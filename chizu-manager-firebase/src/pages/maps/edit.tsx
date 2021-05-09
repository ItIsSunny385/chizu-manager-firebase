import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import MapApp from '../../components/MapApp';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { GearFill, HeptagonFill, HouseFill, PeopleFill } from 'react-bootstrap-icons';
import { Status, User } from '../../types/model';
import { MapBasicData, MapData } from '../../types/map';
import BorderModeMapContents from '../../components/BorderModeMapContents';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import AddMapModal from '../../components/AddMapModal';
import { getStatusMap } from '../../utils/statusUtil';
import { getUser, listeningUserMap } from '../../utils/userUtil';
import { cloneMapData, listeningMapInfoWithChildren } from '../../utils/mapUtil';
import MapSettingModal from '../../components/MapSettingModal';
import MapUsersModal from '../../components/MapUsersModal';
import { PageRoles } from '../../types/role';

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
const auth = firebase.auth();

export default function Edit(props: Props) {
    const [loading, setLoading] = useState(true);
    const [controllerSetted, setControllerSetted] = useState(false);
    const [id] = useState(props.query.id);
    const [mapData, _setMapData] = useState(undefined as MapData | undefined);
    const [mapDataLoading, _setMapDataLoading] = useState(true);
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [pageMode, setPageMode] = useState(PageMode.Border);
    const [prevPageMode, setPrevPageMode] = useState(undefined as PageMode | undefined);
    const [newLatLng, setNewLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [userMap, setUserMap] = useState(new Map<string, User>());
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
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (!authUser) {
                router.push('/users/login');
            } else {
                setAuthUser(authUser);
                getUser(authUser.uid, setUser);
            }
            unsubscribe();
        });
    }, []);

    useEffect(() => {
        if (user) {
            if (!user.isAdmin) {
                router.push('/users/login');
                return;
            }

            /* ステータス情報を取得 */
            getStatusMap(db, 'statuses', setStatusMap);
            getStatusMap(db, 'building_statuses', setBuildingStatusMap);

            /* ユーザ情報を取得 */
            listeningUserMap(db.collection('users').where('deleted', '==', false), setUserMap);

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
        }
    }, [user]);

    useEffect(() => {
        if (map && !controllerSetted) {
            /* 地図が準備できたら地図上のボタンを配置する */
            const topLeftTitle = <div className="mt-2 ml-1 d-block d-md-none"><h4>
                {
                    mapData
                        ?
                        <Badge color="light" id="mapNameLeft" className="border border-dark">{mapData.name}</Badge>
                        :
                        <Badge color="light" id="mapNameLeft" className="d-none border border-dark" />
                }
            </h4></div>;
            const topLeftTitleDiv = document.createElement('div');
            ReactDOM.render(topLeftTitle, topLeftTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(topLeftTitleDiv);
            const topCenterTitle = <div className="mt-2 d-none d-md-block"><h4>
                {
                    mapData
                        ?
                        <Badge color="light" id="mapNameCenter" className="border border-dark">{mapData.name}</Badge>
                        :
                        <Badge color="light" id="mapNameCenter" className="d-none border border-dark" />
                }
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
                <Button
                    id="userButton"
                    onClick={(e) => { document.getElementById('user')!.click(); }}
                >
                    <PeopleFill className="mb-1" />
                    <span className="d-none d-md-block">ユーザ</span>
                </Button>
                <Button
                    id="settingButton"
                    onClick={(e) => { document.getElementById('setting')!.click(); }}
                >
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

            setControllerSetted(true);
        }
    }, [map]);

    useEffect(() => {
        if (mapData && !mapDataLoading && controllerSetted) {
            const mapNameBadgeLeft = document.getElementById('mapNameLeft');
            if (mapNameBadgeLeft) {
                mapNameBadgeLeft.innerHTML = mapData.name;
                mapNameBadgeLeft.classList.remove('d-none');
            }
            const mapNameCenter = document.getElementById('mapNameCenter');
            if (mapNameCenter) {
                mapNameCenter.innerHTML = mapData.name;
                mapNameCenter.classList.remove('d-none');
            }
        }
    }, [mapData, mapDataLoading, controllerSetted]);

    useEffect(() => {
        /* 地図の表示完了とmapDataの取得が完了した場合に動作する */
        if (map && !mapDataLoading && mapData && mapData.borderCoords.length > 0) {
            const minLat = Math.min(...mapData.borderCoords.map(x => x.latitude));
            const minLng = Math.min(...mapData.borderCoords.map(x => x.longitude));
            const maxLat = Math.max(...mapData.borderCoords.map(x => x.latitude));
            const maxLng = Math.max(...mapData.borderCoords.map(x => x.longitude));
            map.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(minLat, minLng),
                new google.maps.LatLng(maxLat, maxLng)
            ));
        }
    }, [map, mapDataLoading]);

    useEffect(() => {
        if (!mapDataLoading && statusMap.size > 0 && buildingStatusMap.size > 0 && controllerSetted) {
            /* データをロードして、地図上のボタンを配置できたらローディングアニメーションをやめる */
            setLoading(false);
        }
    }, [mapDataLoading, controllerSetted, statusMap, buildingStatusMap]);

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
                authUser={authUser}
                user={user}
                title={mapData ? mapData.name + ' | 地図編集' : '地図編集'}
                pageRole={PageRoles.Administrator}
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
                            (pageMode === PageMode.Border || prevPageMode === PageMode.Border)
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
                            (pageMode === PageMode.Marker || prevPageMode === PageMode.Marker)
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
                            using: false,
                            borderCoords: [],
                            managers: [],
                            allEditable: false,
                            editors: [],
                            allUsable: false,
                            users: [],
                        };
                        db.collection('maps').doc(id).set(newData);
                    }}
                />
            }
            { /* 設定ボタンが押されてSettingモードになったときは設定モーダルを表示する */}
            {
                mapData
                &&
                pageMode === PageMode.Setting
                &&
                <MapSettingModal
                    name={mapData.name}
                    using={mapData.using}
                    updateNameAndUsing={(name, using) => {
                        db.collection('maps').doc(id).update({
                            name: name,
                            using: using
                        })
                    }}
                    reset={() => { }}
                    toggle={() => {
                        setPageMode(prevPageMode!);
                        setPrevPageMode(undefined);
                    }}
                />
            }
            {/* ユーザボタンが押されたとき */}
            {
                mapData
                &&
                pageMode === PageMode.User
                &&
                userMap.size > 0
                &&
                <MapUsersModal
                    userMap={userMap}
                    data={mapData}
                    update={(managers, allEditable, editors, allUsable, users) => {
                        db.collection('maps').doc(id).update({
                            managers: managers,
                            allEditable: allEditable,
                            editors: editors,
                            allUsable: allUsable,
                            users: users,
                        });
                    }}
                    toggle={() => {
                        setPageMode(prevPageMode!);
                        setPrevPageMode(undefined);
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
                    setPrevPageMode(undefined);
                    setPageMode(PageMode.Border);
                }} />
                <Button id="marker" onClick={(e) => {
                    e.preventDefault();
                    setPrevPageMode(undefined);
                    setPageMode(PageMode.Marker);
                }} />
                <Button id="user" onClick={(e) => {
                    e.preventDefault();
                    setPrevPageMode(pageMode);
                    setPageMode(PageMode.User);
                }}
                />
                <Button id="setting" onClick={(e) => {
                    e.preventDefault();
                    setPrevPageMode(pageMode);
                    setPageMode(PageMode.Setting);
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