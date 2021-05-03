import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, Fragment, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import MapApp from '../../components/MapApp';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { GearFill, GeoAltFill, HeptagonFill, InfoCircleFill, PeopleFill } from 'react-bootstrap-icons';
import { Status } from '../../types/model';
import { Polygon, Polyline } from '@react-google-maps/api';
import HouseMarkers from '../../components/HouseMarkers';
import { Building, Floor, House, MapData, Room } from '../../types/map';
import BuildingMarkers from '../../components/BuildingMarkers';
import BorderModeMapContents from '../../components/BorderModeMapContents';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import { getStatusMap } from '../../utils/statusUtil';

interface Props {
    query: any
}

enum PageMode {
    Marker = 'Marker',
    Border = 'Border',
    User = 'User',
    Setting = 'Setting',
}

const db = firebase.firestore();

export default function Edit(props: Props) {
    const [loading, setLoading] = useState(true);
    const [controllerSetted, setControllerSetted] = useState(false);
    const [id] = useState(props.query.id);
    const [mapData, setMapData] = useState(undefined as MapData | undefined);
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [pageMode, setPageMode] = useState(PageMode.Border);
    const [newLatLng, setNewLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const router = useRouter();

    useEffect(() => {
        if (map && mapData && !controllerSetted) {
            /* 地図上のボタンの配置 */
            const topLeftTitle = <div className="mt-1 ml-1 d-block d-md-none"><h4>
                <Badge color="dark">地図編集</Badge>
                <a
                    className="ml-1"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault(); document.getElementById('showInfoModal')!.click();
                    }}
                >
                    <InfoCircleFill />
                </a>
            </h4></div>;
            const topLeftTitleDiv = document.createElement('div');
            ReactDOM.render(topLeftTitle, topLeftTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(topLeftTitleDiv);
            const topCenterTitle = <div className="mt-1 ml-1 d-none d-md-block"><h4>
                <Badge color="dark">地図編集</Badge>
                <a
                    className="ml-1"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault(); document.getElementById('showInfoModal')!.click();
                    }}
                >
                    <InfoCircleFill />
                </a>
            </h4></div>;
            const topCenterTitleDiv = document.createElement('div');
            ReactDOM.render(topCenterTitle, topCenterTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(topCenterTitleDiv);
            const rightTopButtons = <ButtonGroup className="mt-1 mr-1">
                <Button
                    id="borderButton"
                    active
                    onClick={(e) => { document.getElementById('border')!.click(); }}
                >
                    <HeptagonFill />
                </Button>
                <Button
                    id="markerButton"
                    onClick={(e) => { document.getElementById('marker')!.click(); }}
                >
                    <GeoAltFill />
                </Button>
                <Button id="userButton"><PeopleFill /></Button>
                <Button id="settingButton"><GearFill /></Button>
            </ButtonGroup>;
            const rightTopButtonDiv = document.createElement('div');
            ReactDOM.render(rightTopButtons, rightTopButtonDiv);
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(rightTopButtonDiv);
            const leftBottomButtons = <div className="ml-2 mb-2">
                <Button
                    onClick={(e) => {
                        e.preventDefault(); document.getElementById('back')!.click();
                    }}
                >
                    戻る
                </Button>
                <Button
                    className="ml-1"
                    onClick={(e) => {
                        e.preventDefault(); document.getElementById('finish')!.click();
                    }}
                >
                    完了
                </Button>
            </div>;
            const leftBottomButtonDiv = document.createElement('div');
            ReactDOM.render(leftBottomButtons, leftBottomButtonDiv);
            map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(leftBottomButtonDiv);

            /* 境界線に合わせて地図を移動 */
            if (mapData.borderCoords.length > 0) {
                const minLat = Math.min(...mapData.borderCoords.map(x => x.latitude));
                const minLng = Math.min(...mapData.borderCoords.map(x => x.longitude));
                const maxLat = Math.max(...mapData.borderCoords.map(x => x.latitude));
                const maxLng = Math.max(...mapData.borderCoords.map(x => x.longitude));
                map.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(minLat, minLng),
                    new google.maps.LatLng(maxLat, maxLng)
                ));
            }
            setLoading(false);
            setControllerSetted(true);
        }
    }, [map, mapData]);


    useEffect(() => {
        /* ページモードの変更に応じて、地図上ボタンの活性状態を変える */
        const markerButton = document.getElementById('markerButton');
        if (markerButton) {
            markerButton.classList.remove('active');
        }
        const borderButton = document.getElementById('borderButton');
        if (borderButton) {
            borderButton.classList.remove('active');
        }
        const userButton = document.getElementById('userButton');
        if (userButton) {
            userButton.classList.remove('active');
        }
        const settingButton = document.getElementById('settingButton');
        if (settingButton) {
            settingButton.classList.remove('active');
        }
        const activateButtonId = `${pageMode.toLowerCase()}Button`;
        const activateButton = document.getElementById(activateButtonId);
        if (activateButton) {
            activateButton.classList.add('active');
        }
    }, [pageMode]);

    useEffect(() => {
        const f = async () => {
            /* ステータス情報を取得 */
            setStatusMap(await getStatusMap(db, 'statuses'));
            setBuildingStatusMap(await getStatusMap(db, 'building_statuses'));
        };
        f();

        /* 地図情報を取得 */
        db.collection('maps').doc(id).onSnapshot((mapSnap) => {
            const mapData = mapSnap.data();
            if (!mapData) {
                setMapData(undefined);
                return;
            }
            setMapData({
                id: mapSnap.id,
                orderNumber: mapData.orderNumber,
                name: mapData.name,
                status: mapData.status,
                borderCoords: mapData.borderCoords,
                buildings: new Map<string, Building>(),
                houses: new Map<string, House>(),
            } as MapData);
        });
    }, []);

    const prevMapDataRef = useRef<MapData | undefined>();
    useEffect(() => {
        prevMapDataRef.current = mapData;
    });
    const prevMapData = prevMapDataRef.current;
    useEffect(() => {
        if (!prevMapData && mapData) {
            db.collection('maps').doc(id).collection('houses').onSnapshot((housesSnap) => {
                if (!mapData) {
                    return;
                }
                const newMapData1 = { ...mapData };
                for (let changeH of housesSnap.docChanges()) {
                    if (changeH.type === 'added') {
                        newMapData1.houses.set(changeH.doc.id, {
                            id: changeH.doc.id,
                            latLng: changeH.doc.data().latLng,
                            statusRef: changeH.doc.data().statusRef,
                        });
                    } else if (changeH.type === 'modified') {
                        const newHouse = { ...newMapData1.houses.get(changeH.doc.id) } as House;
                        newHouse.latLng = changeH.doc.data().latLng;
                        newHouse.statusRef = changeH.doc.data().statusRef;
                        newMapData1.houses.set(changeH.doc.id, newHouse);
                    } else if (changeH.type === "removed") {
                        newMapData1.houses.delete(changeH.doc.id);
                    }
                }
                setMapData(newMapData1);
            });
            db.collection('maps').doc(id).collection('buildings').onSnapshot((buildingsSnap) => {
                if (!mapData) {
                    return;
                }
                const newMapData1 = { ...mapData };
                for (let changeB of buildingsSnap.docChanges()) {
                    if (changeB.type === 'added') {
                        newMapData1.buildings.set(changeB.doc.id, {
                            id: changeB.doc.id,
                            name: changeB.doc.data().name,
                            latLng: changeB.doc.data().latLng,
                            statusRef: changeB.doc.data().statusRef,
                            floors: new Map<string, Floor>(),
                        } as Building);
                        changeB.doc.ref.collection('floors').onSnapshot((floorsSnap) => {
                            if (!mapData) {
                                return;
                            }
                            const newMapData2 = { ...mapData };
                            const newBuilding1 = newMapData2.buildings.get(changeB.doc.id);
                            if (!newBuilding1) {
                                return;
                            }
                            for (let changeF of floorsSnap.docChanges()) {
                                if (changeF.type === 'added') {
                                    newBuilding1.floors.set(changeF.doc.id, {
                                        id: changeF.doc.id,
                                        number: changeF.doc.data().number,
                                        rooms: new Map<string, Room>(),
                                    });
                                    changeF.doc.ref.collection('rooms').onSnapshot((roomsSnap) => {
                                        if (!mapData) {
                                            return;
                                        }
                                        const newMapData3 = { ...mapData };
                                        const newBuilding2 = newMapData3.buildings.get(changeB.doc.id);
                                        if (!newBuilding2) {
                                            return;
                                        }
                                        const newFloor = newBuilding2.floors.get(changeF.doc.id);
                                        if (!newFloor) {
                                            return;
                                        }
                                        for (let changeR of roomsSnap.docChanges()) {
                                            if (changeR.type === 'added') {
                                                newFloor.rooms.set(changeR.doc.id, {
                                                    id: changeR.doc.id,
                                                    orderNumber: changeR.doc.data().orderNumber,
                                                    roomNumber: changeR.doc.data().roomNumber,
                                                    statusRef: changeR.doc.data().statusRef
                                                })
                                            } else if (changeR.type === 'modified') {
                                                const newRoom = { ...newFloor.rooms.get(changeR.doc.id) } as Room;
                                                newRoom.orderNumber = changeR.doc.data().orderNumber;
                                                newRoom.roomNumber = changeR.doc.data().roomNumber;
                                                newRoom.statusRef = changeR.doc.data().statusRef;
                                                newFloor.rooms.set(changeR.doc.id, newRoom);
                                            } else if (changeR.type === 'removed') {
                                                newFloor.rooms.delete(changeR.doc.id);
                                            }
                                        }
                                        setMapData(newMapData3);
                                    });
                                } else if (changeF.type === 'modified') {
                                    const newFloor = { ...newBuilding1.floors.get(changeF.doc.id) } as Floor;
                                    newFloor.number = changeF.doc.data().number;
                                    newBuilding1.floors.set(changeF.doc.id, newFloor);
                                } else if (changeF.type === 'removed') {
                                    newBuilding1.floors.delete(changeF.doc.id);
                                }
                            }
                            setMapData(newMapData2);
                        });
                    } else if (changeB.type === 'modified') {
                        const newBuilding = { ...newMapData1.buildings.get(changeB.doc.id) } as Building;
                        newBuilding.name = changeB.doc.data().name;
                        newBuilding.latLng = changeB.doc.data().latLng;
                        newBuilding.statusRef = changeB.doc.data().statusRef;
                        newMapData1.buildings.set(changeB.doc.id, newBuilding);
                    } else if (changeB.type === "removed") {
                        newMapData1.buildings.delete(changeB.doc.id);
                    }
                }
                setMapData(newMapData1);
            });
        }
    }, [mapData]);

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={setMap}
                onRightClick={(e) => { setNewLatLng(e.latLng); }}
            >
                {
                    map
                    &&
                    mapData
                    &&
                    pageMode === PageMode.Border
                    &&
                    <BorderModeMapContents
                        mapRef={db.collection('maps').doc(id)}
                        borderCoords={mapData.borderCoords.map(x =>
                            new google.maps.LatLng({ lat: x.latitude, lng: x.longitude }))
                        }
                        newLatLng={newLatLng}
                        resetNewLatLng={() => { setNewLatLng(undefined); }}
                    />
                }
                {
                    map
                    &&
                    mapData
                    &&
                    pageMode !== PageMode.Border
                    &&
                    <MarkerModeMapContents
                        mapRef={db.collection('maps').doc(id)}
                        borderCoords={mapData.borderCoords.map(x => new google.maps.LatLng({ lat: x.latitude, lng: x.longitude }))}
                        statusMap={statusMap}
                        buildingStatusMap={buildingStatusMap}
                        houses={Array.from(mapData.houses.values())}
                        buildings={Array.from(mapData.buildings.values())}
                    />
                }
            </MapApp>
            {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
            <div style={{ display: 'none' }}>
                <Button id="back" onClick={(e) => {
                    e.preventDefault();
                    router.push('/maps');
                }} />
                <Button id="finish" onClick={(e) => {
                    e.preventDefault();
                    router.push('/maps');
                }} />
                <Button id="showInfoModal" onClick={(e) => { }} />
                <Button id="border" onClick={(e) => {
                    e.preventDefault();
                    setPageMode(PageMode.Border);
                }} />
                <Button id="marker" onClick={(e) => {
                    e.preventDefault();
                    setPageMode(PageMode.Marker);
                }} />
            </div>
        </React.Fragment >
    );
}

export async function getServerSideProps(ctx: any) {
    return {
        props: {
            query: ctx.query
        }
    };
}