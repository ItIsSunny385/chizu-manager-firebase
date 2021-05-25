import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import { Status, User } from '../../types/model';
import { PageRoles } from '../../types/role';
import { getUser, listeningUserMap } from '../../utils/userUtil';
import MapApp from '../../components/MapApp';
import SelectMapModal from '../../components/SelectMapModal';
import { MapData } from '../../types/map';
import { listeningMapChildrenAndSetMapDataMap, listeningMapQueryWithNoChildren } from '../../utils/mapUtil';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import { getStatusMap } from '../../utils/statusUtil';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { ListTask, PeopleFill } from 'react-bootstrap-icons';
import MapUsersModal from '../../components/MapUsersModal';
import CurrentPositionMarker from '../../components/CurrentPositionMarker';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [controllerSetted, setControllerSetted] = useState(false);
    const [nameSetted, setNameSetted] = useState(false);
    const [title, setTitle] = useState('地図選択');
    const [pageRole, setPageRole] = useState(undefined as PageRoles | undefined);
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [mapDataMap, _setMapDataMap] = useState(new Map<string, MapData>());
    const [mapId, _setMapId] = useState(undefined as string | undefined);
    const [mapData, setMapData] = useState(undefined as MapData | undefined);
    const [listeningMapIds, _setListeningMapIds] = useState(new Array<string>());
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [displaySelectMapModal, setDisplaySelectMapModal] = useState(true);
    const [displayUsersModal, setDisplayUsersModal] = useState(false);
    const [newLatLng, setNewLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const [userMap, setUserMap] = useState(new Map<string, User>());
    const [mouseDownTime, _setMouseDownTime] = useState(undefined as number | undefined);
    const [currentPosition, setCurrentPosition] = useState(undefined as google.maps.LatLng | undefined);
    const [unsubscribes, _setUnsubscribes] = useState<(() => void)[]>([]);
    const [watchId, setWatchId] = useState(undefined as number | undefined);
    const router = useRouter();

    const mapDataMapRef = useRef(mapDataMap);
    const setMapDataMap = (data: Map<string, MapData>) => {
        mapDataMapRef.current = data;
        _setMapDataMap(data);
    };

    const mapIdRef = useRef(mapId);
    const setMapId = (data: string | undefined) => {
        mapIdRef.current = data;
        _setMapId(data);
    };

    const listeningMapIdsRef = useRef(listeningMapIds);
    const setListeningMapIds = (data: string[]) => {
        listeningMapIdsRef.current = data;
        _setListeningMapIds(data);
    };

    const mouseDownTimeRef = useRef(mouseDownTime);
    const setMouseDownTime = (data: number | undefined) => {
        mouseDownTimeRef.current = data;
        _setMouseDownTime(data);
    };

    const unsubscribesRef = useRef(unsubscribes);
    const setUnsubscribes = (data: (() => void)[]) => {
        unsubscribesRef.current = data;
        _setUnsubscribes(data);
    };
    const addUnsubscribes = (unsubscribes: (() => void)[]) => {
        const newUnsubscribes = [...unsubscribesRef.current, ...unsubscribes];
        setUnsubscribes(newUnsubscribes);
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
        return () => {
            unsubscribesRef.current.forEach(x => { x(); });
            if (navigator && watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    useEffect(() => {
        if (user && authUser) {
            if (user.isAdmin) {
                router.push('/users/login');
                return;
            }

            /* ステータス情報を取得 */
            getStatusMap(db, 'statuses', setStatusMap);
            getStatusMap(db, 'building_statuses', setBuildingStatusMap);

            /* ユーザ情報を取得 */
            const unsubscribe1 = listeningUserMap(
                db.collection('users').where('deleted', '==', false).where('isAdmin', '==', false).orderBy('displayName', 'asc'),
                setUserMap
            );

            const userRef = db.collection('users').doc(authUser.uid);
            const resetMapData = (targetMapId: string) => {
                if (mapIdRef.current === targetMapId) {
                    setMapId(undefined);
                }
                if (listeningMapIdsRef.current.includes(targetMapId)) {
                    const newListeningMapIds = [...listeningMapIdsRef.current];
                    newListeningMapIds.splice(newListeningMapIds.indexOf(targetMapId), 1);
                    setListeningMapIds(newListeningMapIds);
                }
            };

            /* マネージャとしての地図 */
            const unsubscribe2 = listeningMapQueryWithNoChildren(
                db.collection('maps').where('managers', 'array-contains', userRef).where('using', '==', true),
                mapDataMapRef,
                setMapDataMap,
                resetMapData
            );

            /* 編集者としての地図 */
            const unsubscribe3 = listeningMapQueryWithNoChildren(
                db.collection('maps').where('allEditable', '==', true).where('using', '==', true),
                mapDataMapRef,
                setMapDataMap,
                resetMapData
            );
            const unsubscribe4 = listeningMapQueryWithNoChildren(
                db.collection('maps').where('editors', 'array-contains', userRef).where('using', '==', true),
                mapDataMapRef,
                setMapDataMap,
                resetMapData
            );

            /* 利用者としての地図 */
            const unsubscribe5 = listeningMapQueryWithNoChildren(
                db.collection('maps').where('allUsable', '==', true).where('using', '==', true),
                mapDataMapRef,
                setMapDataMap,
                resetMapData
            );
            const unsubscribe6 = listeningMapQueryWithNoChildren(
                db.collection('maps').where('users', 'array-contains', userRef).where('using', '==', true),
                mapDataMapRef,
                setMapDataMap,
                resetMapData
            );
            addUnsubscribes([unsubscribe1, unsubscribe2, unsubscribe3, unsubscribe4, unsubscribe5, unsubscribe6]);

            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!map || controllerSetted) {
            return;
        }

        const rightTopButtons = <ButtonGroup className="mt-1 mr-1">
            <Button
                id="listButton"
                onClick={(e) => { document.getElementById('list')!.click(); }}
            >
                <div><ListTask className="mb-1" /></div>
                <div><span>一覧</span></div>
            </Button>
            <Button
                id="userButton"
                onClick={(e) => { document.getElementById('user')!.click(); }}
            >
                <div><PeopleFill className="mb-1" /></div>
                <div><span>ユーザ</span></div>
            </Button>
        </ButtonGroup>;
        const rightTopButtonDiv = document.createElement('div');
        ReactDOM.render(rightTopButtons, rightTopButtonDiv);
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(rightTopButtonDiv);
        setControllerSetted(true);

        /* ロングタップ時の処理を実装 */
        google.maps.event.addListener(map, "mousedown", (e) => {
            setMouseDownTime(new Date().getTime());
        });

        google.maps.event.addListener(map, "mouseup", (e) => {
            const nowTime = new Date().getTime();
            if (mouseDownTimeRef.current && (nowTime - mouseDownTimeRef.current) >= 1000) {
                setNewLatLng(e.latLng);
                setMouseDownTime(undefined);
            }
        });
    }, [map]);

    useEffect(() => {
        if (!map) {
            return;
        }
        if (!navigator.geolocation || !google) {
            alert("あなたの端末では、現在位置を取得できません。");
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                if (typeof google === 'undefined') {
                    return;
                }
                setCurrentPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            },
            () => {
                setCurrentPosition(undefined);
            }
        );
        setWatchId(watchId);
    }, [map]);

    useEffect(() => {
        if (!mapId) {
            return;
        }
        if (listeningMapIds.includes(mapId)) {
            return;
        }
        listeningMapChildrenAndSetMapDataMap(
            db.collection('maps').doc(mapId),
            mapDataMapRef,
            setMapDataMap,
            addUnsubscribes
        );
        setListeningMapIds([...listeningMapIds, mapId]);
    }, [mapId]);

    useEffect(() => {
        if (!mapId || !map) {
            return;
        }
        const newMapData = mapDataMap.get(mapId);
        if (!newMapData) {
            return;
        }
        const minLat = Math.min(...newMapData.borderCoords.map(x => x.latitude));
        const minLng = Math.min(...newMapData.borderCoords.map(x => x.longitude));
        const maxLat = Math.max(...newMapData.borderCoords.map(x => x.latitude));
        const maxLng = Math.max(...newMapData.borderCoords.map(x => x.longitude));
        map.fitBounds(new google.maps.LatLngBounds(
            new google.maps.LatLng(minLat, minLng),
            new google.maps.LatLng(maxLat, maxLng)
        ));
    }, [mapId]);

    useEffect(() => {
        if (mapId) {
            return;
        }
        setMapData(undefined);
        setDisplayUsersModal(false);
        setDisplaySelectMapModal(true);
    }, [mapId]);

    useEffect(() => {
        if (!mapId) {
            return;
        }
        setMapData(mapDataMap.get(mapId));
    }, [mapId, mapDataMap]);

    useEffect(() => {
        if (!controllerSetted) {
            return;
        }
        if (mapData) {
            setTitle(mapData.name);
            if (authUser) {
                const userRef = db.collection('users').doc(authUser.uid)
                let role = PageRoles.User;
                if (mapData.managers.some(x => x.isEqual(userRef))) {
                    role = PageRoles.Manager;
                } else if (mapData.allEditable || mapData.editors.some(x => x.isEqual(userRef))) {
                    role = PageRoles.Editor;
                }
                setPageRole(role);
            } else {
                setPageRole(undefined);
            }
        } else {
            setTitle('地図選択');
            setPageRole(undefined);
        }
    }, [mapData, controllerSetted]);

    useEffect(() => {
        if (!map || (!mapData && !nameSetted)) {
            return;
        }
        if (nameSetted) {
            const mapNameBadgeLeft = document.getElementById('mapNameLeft');
            if (mapNameBadgeLeft) {
                mapNameBadgeLeft.innerHTML = mapData ? mapData.name : '';
            }
            const mapNameCenter = document.getElementById('mapNameCenter');
            if (mapNameCenter) {
                mapNameCenter.innerHTML = mapData ? mapData.name : '';
            }
        } else {
            const topLeftTitle = <div className="mt-2 ml-1 d-block d-md-none"><h4>
                <Badge color="light" id="mapNameLeft" className="border border-dark">
                    {mapData ? mapData.name : ''}
                </Badge>
            </h4></div>;
            const topLeftTitleDiv = document.createElement('div');
            ReactDOM.render(topLeftTitle, topLeftTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(topLeftTitleDiv);
            const topCenterTitle = <div className="mt-2 d-none d-md-block"><h4>
                <Badge color="light" id="mapNameCenter" className="border border-dark">
                    {mapData ? mapData.name : ''}
                </Badge>
            </h4></div>;
            const topCenterTitleDiv = document.createElement('div');
            ReactDOM.render(topCenterTitle, topCenterTitleDiv);
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(topCenterTitleDiv);
            setNameSetted(true);
        }
    }, [map, mapData]);

    return <Fragment>
        <MapApp
            authUser={authUser}
            user={user}
            title={title}
            loading={loading}
            pageRole={pageRole}
            onLoadMap={setMap}
            onRightClick={(e) => { setNewLatLng(e.latLng); }}
            unsubscribes={unsubscribesRef.current}
        >
            {
                map
                &&
                mapId
                &&
                mapData
                &&
                <MarkerModeMapContents
                    editable={pageRole === PageRoles.Manager || pageRole === PageRoles.Editor}
                    mapRef={db.collection('maps').doc(mapId)}
                    borderCoords={mapData.borderCoords.map(x => new google.maps.LatLng({ lat: x.latitude, lng: x.longitude }))}
                    statusMap={statusMap}
                    buildingStatusMap={buildingStatusMap}
                    houses={Array.from(mapData.houses.values())}
                    buildings={Array.from(mapData.buildings.values())}
                    newLatLng={newLatLng}
                    resetNewLatLng={() => { setNewLatLng(undefined); }}
                />
            }
            {
                map
                &&
                currentPosition
                &&
                <CurrentPositionMarker latLng={currentPosition} />
            }
        </MapApp>
        {
            displaySelectMapModal
            &&
            authUser
            &&
            <SelectMapModal
                staticMode={!mapId}
                userRef={db.collection('users').doc(authUser.uid)}
                mapDataArray={Array.from(mapDataMap.values()).sort((a, b) => a.name > b.name ? 1 : -1)}
                select={(mapId) => { setMapId(mapId); }}
                toggle={() => { setDisplaySelectMapModal(false); }}
            />
        }
        {
            displayUsersModal
            &&
            mapData
            &&
            <MapUsersModal
                userMap={userMap}
                data={mapData}
                editable={pageRole === PageRoles.Manager}
                update={(managers, allEditable, editors, allUsable, users) => {
                    db.collection('maps').doc(mapId).update({
                        managers: managers,
                        allEditable: allEditable,
                        editors: editors,
                        allUsable: allUsable,
                        users: users,
                    });
                }}
                toggle={() => {
                    setDisplayUsersModal(false);
                }}
            />
        }
        {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
        <div style={{ display: 'none' }}>
            <Button id="user" onClick={(e) => {
                e.preventDefault();
                setDisplayUsersModal(true);
            }}
            />
            <Button id="list" onClick={(e) => {
                e.preventDefault();
                setDisplaySelectMapModal(true);
            }} />
        </div>
    </Fragment>;
}