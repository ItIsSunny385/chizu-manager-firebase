import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import MapApp from '../../components/MapApp';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { GearFill, GeoAltFill, HeptagonFill, InfoCircleFill, PeopleFill } from 'react-bootstrap-icons';
import { Status } from '../../types/model';
import { Polygon, Polyline } from '@react-google-maps/api';
import MapNameBadge from '../../components/MapNameBadge';
import HouseMarkers from '../../components/HouseMarkers';
import { Building, Floor, House, MapData, Room } from '../../types/map';
import BuildingMarkers from '../../components/BuildingMarkers';

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
    const [fetchedData, setFetchedData] = useState(undefined as MapData | undefined);
    const [clientData, setClientData] = useState(undefined as MapData | undefined);
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [polylinePath, setPolylinePath] = useState([] as google.maps.LatLngLiteral[]);
    const [pageMode, setPageMode] = useState(PageMode.Marker);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const router = useRouter();

    useEffect(() => {
        if (map && clientData && !controllerSetted) {
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
                    id="markerButton"
                    active
                    onClick={(e) => { document.getElementById('marker')!.click(); }}
                >
                    <GeoAltFill />
                </Button>
                <Button
                    id="borderButton"
                    onClick={(e) => { document.getElementById('border')!.click(); }}
                >
                    <HeptagonFill />
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
            const minLat = Math.min(...clientData.borderCoords.map(x => x.latitude));
            const minLng = Math.min(...clientData.borderCoords.map(x => x.longitude));
            const maxLat = Math.max(...clientData.borderCoords.map(x => x.latitude));
            const maxLng = Math.max(...clientData.borderCoords.map(x => x.longitude));
            map.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(minLat, minLng),
                new google.maps.LatLng(maxLat, maxLng)
            ));
            const newPolyLinePath = clientData.borderCoords.map(x => ({ lat: x.latitude, lng: x.longitude }));
            newPolyLinePath.push(newPolyLinePath[0]);
            setPolylinePath(newPolyLinePath);
            setLoading(false);
            setControllerSetted(true);
        }
    }, [map, clientData])

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
        const getData = async () => {
            /* ステータス情報を取得 */
            const statusesSnap = await db.collection('statuses').orderBy('number', 'asc').get();
            const newStatusMap = new Map<string, Status>();
            statusesSnap.forEach((x) => {
                newStatusMap.set(x.id, {
                    name: x.data().name,
                    number: x.data().number,
                    pin: x.data().pin,
                    label: x.data().label,
                    statusAfterResetingRef: x.data().statusAfterResetingRef,
                });
            });
            setStatusMap(newStatusMap);
            const bStatusesSnap = await db.collection('building_statuses').orderBy('number', 'asc').get();
            const newBuildingStatusMap = new Map<string, Status>();
            bStatusesSnap.forEach((x) => {
                newBuildingStatusMap.set(x.id, {
                    name: x.data().name,
                    number: x.data().number,
                    pin: x.data().pin,
                    label: x.data().label,
                    statusAfterResetingRef: x.data().statusAfterResetingRef,
                });
            });
            setBuildingStatusMap(newBuildingStatusMap);

            /* 地図情報を取得 */
            const mapSnap = await db.collection('maps').doc(id).get();
            const mapData = mapSnap.data();
            if (!mapData) {
                return;
            }
            const newData: MapData = {
                id: mapSnap.id,
                orderNumber: mapData.orderNumber,
                name: mapData.name,
                status: mapData.status,
                borderCoords: mapData.borderCoords,
                badgeLatLng: mapData.badgeLatLng,
                buildings: [],
                houses: [],
            };
            const housesSnap = await mapSnap.ref.collection('houses').get();
            housesSnap.forEach(x => {
                newData.houses.push({
                    id: x.id,
                    latLng: x.data().latLng,
                    statusRef: x.data().statusRef,
                });
            });
            const buildingsSnap = await mapSnap.ref.collection('buildings').get();
            for (const x of buildingsSnap.docs) {
                const floorsSnap = await x.ref.collection('floors').orderBy('number', 'asc').get();
                const floors = new Array<Floor>();
                for (const y of floorsSnap.docs) {
                    const roomsSnap = await y.ref.collection('rooms').orderBy('orderNumber', 'asc').get();
                    const rooms = new Array<Room>();
                    roomsSnap.forEach(z => {
                        rooms.push({
                            id: z.id,
                            orderNumber: z.data().orderNumber,
                            roomNumber: z.data().roomNumber,
                            statusRef: z.data().statusRef,
                        });
                    });
                    floors.push({
                        id: y.id,
                        number: y.data().number,
                        rooms: rooms,
                    });
                }
                newData.buildings.push({
                    id: x.id,
                    name: x.data().name,
                    latLng: x.data().latLng,
                    statusRef: x.data().statusRef,
                    floors: floors,
                });
            }
            setClientData(newData);
            setFetchedData(newData);
        };
        getData();
    }, []);

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={(map) => { setMap(map); }}
            >
                {
                    clientData
                    &&
                    pageMode === PageMode.Border
                    &&
                    <Polygon
                        path={clientData.borderCoords.map(x => ({ lat: x.latitude, lng: x.longitude }))}
                        editable={true}
                        options={{ strokeColor: "red", fillColor: "red" }}
                        onMouseUp={(e) => { }}
                    />
                }
                {
                    clientData
                    &&
                    pageMode !== PageMode.Border
                    &&
                    <Fragment>
                        {/* 境界線 */}
                        <Polyline
                            path={polylinePath}
                            options={{ strokeColor: "red", zIndex: 1 }}
                        />
                        {/* 地図名バッジ */}
                        <MapNameBadge
                            latLng={clientData.badgeLatLng}
                            name={clientData.name}
                            draggable={true}
                        />
                        {/* 家 */}
                        <HouseMarkers
                            data={clientData.houses}
                            statusMap={statusMap}
                            setData={(houses: Array<House>) => {
                                const newClientData = { ...clientData };
                                newClientData.houses = houses;
                                setClientData(newClientData);
                            }}
                        />
                        {/* 集合住宅 */}
                        <BuildingMarkers
                            data={clientData.buildings}
                            statusMap={statusMap}
                            buildingStatusMap={buildingStatusMap}
                            setData={(buildings: Array<Building>) => {
                                const newClientData = { ...clientData };
                                newClientData.buildings = buildings;
                                setClientData(newClientData);
                            }}
                        />
                    </Fragment>
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