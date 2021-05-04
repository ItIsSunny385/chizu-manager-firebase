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
import { Building, Floor, House, MapData, Room } from '../../types/map';
import BuildingMarkers from '../../components/BuildingMarkers';
import BorderModeMapContents from '../../components/BorderModeMapContents';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import { getStatusMap } from '../../utils/statusUtil';
import { listeningMapInfoWithChildren } from '../../utils/mapUtil';

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
    const [mapData, _setMapData] = useState(undefined as MapData | undefined);
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


    // onSnapShot内では最新のmapDataにアクセスできないため、mapDataRef.currentを用いる
    // https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
    const mapDataRef = useRef(mapData);
    const setMapData = (data: MapData | undefined) => {
        mapDataRef.current = data;
        _setMapData(data);
    }

    useEffect(() => {
        const f = async () => {
            /* ステータス情報を取得 */
            setStatusMap(await getStatusMap(db, 'statuses'));
            setBuildingStatusMap(await getStatusMap(db, 'building_statuses'));
        };
        f();

        /* 地図情報を監視 */
        const mapRef = db.collection('maps').doc(id);
        listeningMapInfoWithChildren(mapRef, mapDataRef, setMapData);
    }, []);

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
                        newLatLng={newLatLng}
                        resetNewLatLng={() => { setNewLatLng(undefined); }}
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