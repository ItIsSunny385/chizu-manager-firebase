import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import MapApp from '../../components/MapApp';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { GearFill, HeptagonFill, HouseFill, PeopleFill } from 'react-bootstrap-icons';
import { Status } from '../../types/model';
import { MapBasicData, MapData, MapStatus } from '../../types/map';
import BorderModeMapContents from '../../components/BorderModeMapContents';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import AddMapModal from '../../components/AddMapModal';
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
    const [mapDataLoading, _setMapDataLoading] = useState(true);
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [pageMode, setPageMode] = useState(PageMode.Border);
    const [newLatLng, setNewLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const router = useRouter();

    // onSnapShot内では最新のmapDataにアクセスできないため、mapDataRef.currentを用いる
    // https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
    const mapDataRef = useRef(mapData);
    const setMapData = (data: MapData | undefined) => {
        mapDataRef.current = data;
        _setMapData(data);
    };
    const mapDataLoadingRef = useRef(mapDataLoading);
    const setMapDataLoading = (data: boolean) => {
        mapDataLoadingRef.current = data;
        _setMapDataLoading(data);
    };

    useEffect(() => {
        /* 必要なデータを取得する */
        const f = async () => {
            /* ステータス情報を取得 */
            setStatusMap(await getStatusMap(db, 'statuses'));
            setBuildingStatusMap(await getStatusMap(db, 'building_statuses'));
        };
        f();

        /* 地図情報を監視 */
        const mapRef = db.collection('maps').doc(id);
        listeningMapInfoWithChildren(
            mapRef,
            mapDataRef,
            (data) => {
                setMapData(data);
                if (mapDataLoadingRef.current) {
                    setMapDataLoading(false);
                }
            }
        );
    }, []);

    useEffect(() => {
        if (map && !controllerSetted) {
            /* 地図が準備できたら地図上のボタンを配置する */
            const topLeftTitle = <div className="mt-2 ml-1"><h4>
                {
                    mapData
                        ?
                        <Badge color="light" id="mapName" className="border border-dark">{mapData.name}</Badge>
                        :
                        <Badge color="light" id="mapName" className="d-none border border-dark" />
                }
            </h4></div>;

            const topLeftTitleDiv = document.createElement('div');
            ReactDOM.render(topLeftTitle, topLeftTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(topLeftTitleDiv);
            const rightTopButtons = <ButtonGroup className="mt-1 mr-1">
                <Button
                    id="borderButton"
                    active
                    onClick={(e) => { document.getElementById('border')!.click(); }}
                >
                    <HeptagonFill className="mb-1" />
                    <span className="d-none d-md-block">境界線</span>
                </Button>
                <Button
                    id="markerButton"
                    onClick={(e) => { document.getElementById('marker')!.click(); }}
                >
                    <HouseFill className="mb-1" />
                    <span className="d-none d-md-block">建物</span>
                </Button>
                <Button id="userButton">
                    <PeopleFill className="mb-1" />
                    <span className="d-none d-md-block">ユーザ</span>
                </Button>
                <Button id="settingButton">
                    <GearFill className="mb-1" />
                    <span className="ml-1 d-none d-md-block">設定</span>
                </Button>
            </ButtonGroup>;
            const rightTopButtonDiv = document.createElement('div');
            ReactDOM.render(rightTopButtons, rightTopButtonDiv);
            map.controls[google.maps.ControlPosition.RIGHT_TOP].push(rightTopButtonDiv);
            const leftBottomButtons = <div className="ml-2 mb-2">
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

            /* 地図上のボタンを配置できたらローディングアニメーションをやめる */
            setLoading(false);
            setControllerSetted(true);
        }
    }, [map]);

    useEffect(() => {
        if (mapData && !mapDataLoading && controllerSetted) {
            const mapNameBadge = document.getElementById('mapName');
            if (mapNameBadge) {
                mapNameBadge.innerHTML = mapData.name;
                mapNameBadge.classList.remove('d-none');
            }
        }
    }, [mapData, mapDataLoading, controllerSetted]);

    useEffect(() => {
        /* 地図の表示完了とmapDataの取得が完了した場合に動作する */
        if (map && !mapDataLoading) {
            if (mapData) {
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
            } else {
                /* mapDataの初期値をモーダルで指定させる */
            }
        }
    }, [map, mapDataLoading]);


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

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={setMap}
                onRightClick={(e) => { setNewLatLng(e.latLng); }}
            >
                {/* GoogleMapがロードされ、mapDataが設定されてから中身を描画する　*/}
                {
                    map
                    &&
                    !mapDataLoading
                    &&
                    mapData
                    &&
                    <Fragment>
                        {
                            pageMode === PageMode.Border
                                ?
                                <BorderModeMapContents
                                    mapRef={db.collection('maps').doc(id)}
                                    borderCoords={mapData.borderCoords.map(x =>
                                        new google.maps.LatLng({ lat: x.latitude, lng: x.longitude }))
                                    }
                                    newLatLng={newLatLng}
                                    resetNewLatLng={() => { setNewLatLng(undefined); }}
                                />
                                :
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
                    </Fragment>
                }
            </MapApp>
            {/* mapDataをロードしたがデータが空の場合は地図追加モーダルを表示する */}
            {
                !mapDataLoading
                &&
                !mapData
                &&
                <AddMapModal
                    back={() => { router.push('/maps'); }}
                    save={(name) => {
                        const newData: MapBasicData = {
                            name: name,
                            status: MapStatus.Private,
                            borderCoords: [],
                        };
                        db.collection('maps').doc(id).set(newData);
                    }}
                />
            }
            {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
            <div style={{ display: 'none' }}>
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