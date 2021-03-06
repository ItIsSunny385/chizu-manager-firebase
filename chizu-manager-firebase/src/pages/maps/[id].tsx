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
import { listeningMapInfoWithChildren } from '../../utils/mapUtil';
import MapSettingModal from '../../components/MapSettingModal';
import MapUsersModal from '../../components/MapUsersModal';
import { PageRoles } from '../../types/role';
import CurrentPositionMarker from '../../components/CurrentPositionMarker';
import Link from 'next/link';

enum PageMode {
    Marker = 'Marker',
    Border = 'Border',
    User = 'User',
    Setting = 'Setting',
}

const db = firebase.firestore();
const auth = firebase.auth();

export default function View() {
    const [loading, setLoading] = useState(true);
    const [controllerSetted, setControllerSetted] = useState(false);
    const [nameSetted, setNameSetted] = useState(false);
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
    const [mouseDownTime, _setMouseDownTime] = useState(undefined as number | undefined);
    const [currentPosition, setCurrentPosition] = useState(undefined as google.maps.LatLng | undefined);
    const [saveBorder, setSaveBorder] = useState(false);
    const [unsubscribes, _setUnsubscribes] = useState<(() => void)[]>([]);
    const [watchId, setWatchId] = useState(undefined as number | undefined);
    const router = useRouter();
    const { id } = router.query as { id: string };

    // onSnapShot??????????????????mapData????????????????????????????????????mapDataRef.current????????????
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
        if (!map) {
            return;
        }
        if (!navigator.geolocation || !google) {
            alert("??????????????????????????????????????????????????????????????????");
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
        if (user) {
            if (!user.isAdmin) {
                router.push('/users/login');
                return;
            }

            /* ?????????????????????????????? */
            getStatusMap(db, 'statuses', setStatusMap);
            getStatusMap(db, 'building_statuses', setBuildingStatusMap);

            /* ???????????????????????? */
            const unsubscribe = listeningUserMap(
                db.collection('users').where('deleted', '==', false).where('isAdmin', '==', false).orderBy('displayName', 'asc'),
                setUserMap
            );
            addUnsubscribes([unsubscribe]);

            /* ????????????????????? */
            const mapRef = db.collection('maps').doc(id);
            listeningMapInfoWithChildren(
                mapRef,
                mapDataRef,
                (data) => {
                    setMapData(data);
                    if (mapDataLoadingRef.current) {
                        setMapDataLoading(false);
                    }
                },
                addUnsubscribes
            );
        }
    }, [user]);

    useEffect(() => {
        if (map && !controllerSetted) {
            /* ??????????????????????????????????????????????????????????????? */
            const rightTopButtons = <ButtonGroup className="mt-1 mr-1">
                <Button
                    id="borderButton"
                    active
                    onClick={(e) => { document.getElementById('border')!.click(); }}
                >
                    <HeptagonFill className="mb-1" />
                    <span className="d-none d-md-block">?????????</span>
                </Button>
                <Button
                    id="markerButton"
                    onClick={(e) => { document.getElementById('marker')!.click(); }}
                >
                    <HouseFill className="mb-1" />
                    <span className="d-none d-md-block">??????</span>
                </Button>
                <Button
                    id="userButton"
                    onClick={(e) => { document.getElementById('user')!.click(); }}
                >
                    <PeopleFill className="mb-1" />
                    <span className="d-none d-md-block">?????????</span>
                </Button>
                <Button
                    id="settingButton"
                    onClick={(e) => { document.getElementById('setting')!.click(); }}
                >
                    <GearFill className="mb-1" />
                    <span className="ml-1 d-none d-md-block">??????</span>
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
                    ??????
            </Button>
            </div>;
            const leftBottomButtonDiv = document.createElement('div');
            ReactDOM.render(leftBottomButtons, leftBottomButtonDiv);
            map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(leftBottomButtonDiv);

            setControllerSetted(true);

            /* ??????????????????????????????????????? */
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
        }
    }, [map]);

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

    useEffect(() => {
        /* ????????????????????????mapData????????????????????????????????????????????? */
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
            /* ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */
            setLoading(false);
        }
    }, [mapDataLoading, controllerSetted, statusMap, buildingStatusMap]);

    useEffect(() => {
        /* ??????????????????????????????????????????????????????????????????????????????????????? */
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
                title={mapData ? mapData.name + ' | ????????????' : '????????????'}
                pageRole={PageRoles.Administrator}
                loading={loading}
                onLoadMap={setMap}
                onRightClick={(e) => { setNewLatLng(e.latLng); }}
                unsubscribes={unsubscribesRef.current}
            >
                {/* GoogleMap?????????????????????mapData????????????????????????????????????????????????*/}
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
                                borderCoords={mapData.borderCoords.map(x =>
                                    new google.maps.LatLng({ lat: x.latitude, lng: x.longitude }))
                                }
                                newLatLng={newLatLng}
                                update={(newBorderCoods) => {
                                    db.collection('maps').doc(id).update({
                                        borderCoords: newBorderCoods
                                    });
                                }}
                                forceSave={saveBorder}
                                resetNewLatLng={() => { setNewLatLng(undefined); }}
                                finishForceSave={() => {
                                    setPrevPageMode(undefined);
                                    setPageMode(PageMode.Marker);
                                    setSaveBorder(false);
                                }}
                            />
                        }
                        {
                            (pageMode === PageMode.Marker || prevPageMode === PageMode.Marker)
                            &&
                            <MarkerModeMapContents
                                editable={true}
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
                {
                    map
                    &&
                    currentPosition
                    &&
                    <CurrentPositionMarker latLng={currentPosition} />
                }
            </MapApp>
            {/* mapData??????????????????????????????????????????????????????????????????????????????????????? */}
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
            { /* ??????????????????????????????Setting??????????????????????????????????????????????????????????????? */}
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
                    reset={() => {
                        const batch = db.batch();
                        const docRef = db.collection('maps').doc(id);
                        mapData.houses.forEach((x) => {
                            const status = statusMap.get(x.statusRef.id);
                            if (status && status.statusAfterResetingRef) {
                                batch.update(
                                    docRef.collection('houses').doc(x.id),
                                    { statusRef: status.statusAfterResetingRef }
                                );
                            }
                        });
                        mapData.buildings.forEach((x) => {
                            const bStatus = buildingStatusMap.get(x.statusRef.id);
                            const buildingDocRef = docRef.collection('buildings').doc(x.id);
                            if (bStatus && bStatus.statusAfterResetingRef) {
                                batch.update(
                                    buildingDocRef,
                                    { statusRef: bStatus.statusAfterResetingRef }
                                );
                            }
                            x.floors.forEach((y) => {
                                const floorDocRef = buildingDocRef.collection('floors').doc(y.id);
                                y.rooms.forEach((z) => {
                                    const rStatus = statusMap.get(z.statusRef.id);
                                    const roomDocRef = floorDocRef.collection('rooms').doc(z.id);
                                    if (rStatus && rStatus.statusAfterResetingRef) {
                                        batch.update(
                                            roomDocRef,
                                            { statusRef: rStatus.statusAfterResetingRef }
                                        );
                                    }
                                });
                            });
                        });
                        batch.commit();
                    }}
                    toggle={() => {
                        setPageMode(prevPageMode!);
                        setPrevPageMode(undefined);
                    }}
                />
            }
            {/* ??????????????????????????????????????? */}
            {
                mapData
                &&
                pageMode === PageMode.User
                &&
                <MapUsersModal
                    userMap={userMap}
                    data={mapData}
                    editable={true}
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
            {/* ???????????????????????????????????? React??????????????????????????????????????????????????????????????????????????????????????????????????? */}
            <div style={{ display: 'none' }}>
                <Link href='/maps'><a id="finish"></a></Link>
                <Button id="border" onClick={(e) => {
                    e.preventDefault();
                    setPrevPageMode(undefined);
                    setPageMode(PageMode.Border);
                }} />
                <Button id="marker" onClick={(e) => {
                    e.preventDefault();
                    if (pageMode === PageMode.Border) {
                        setSaveBorder(true);
                        return;
                    }
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