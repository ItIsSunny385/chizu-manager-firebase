import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import { Status, User } from '../../types/model';
import { PageRoles } from '../../types/role';
import { getUser } from '../../utils/userUtil';
import MapApp from '../../components/MapApp';
import SelectMapModal from '../../components/SelectMapModal';
import { MapData } from '../../types/map';
import { listeningMapChildrenAndSetMapDataMap, listeningMapQueryWithNoChildren } from '../../utils/mapUtil';
import MarkerModeMapContents from '../../components/MarkerModeMapContents';
import { getStatusMap } from '../../utils/statusUtil';
import { Badge, Button, ButtonGroup } from 'reactstrap';
import { ListTask, PeopleFill } from 'react-bootstrap-icons';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [controllerSetted, setControllerSetted] = useState(false);
    const [title, setTitle] = useState('メイン');
    const [pageRole, setPageRole] = useState(undefined as PageRoles | undefined);
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [mapDataMap, _setMapDataMap] = useState(new Map<string, MapData>());
    const [mapId, setMapId] = useState(undefined as string | undefined);
    const [mapData, setMapData] = useState(undefined as MapData | undefined);
    const [listeningMapIds, setListeningMapIds] = useState(new Array<string>());
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [displaySelectMapModal, setDisplaySelectMapModal] = useState(true);
    const [newLatLng, setNewLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const router = useRouter();

    const mapDataMapRef = useRef(mapDataMap);
    const setMapDataMap = (data: Map<string, MapData>) => {
        mapDataMapRef.current = data;
        _setMapDataMap(data);
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
        if (user && authUser) {
            if (user.isAdmin) {
                router.push('/users/login');
                return;
            }

            /* ステータス情報を取得 */
            getStatusMap(db, 'statuses', setStatusMap);
            getStatusMap(db, 'building_statuses', setBuildingStatusMap);

            const userRef = db.collection('users').doc(authUser.uid);

            /* マネージャとしての地図 */
            listeningMapQueryWithNoChildren(
                db.collection('maps').where('managers', 'array-contains', userRef),
                mapDataMapRef,
                setMapDataMap
            );

            /* 編集者としての地図 */
            listeningMapQueryWithNoChildren(
                db.collection('maps').where('allEditable', '==', true),
                mapDataMapRef,
                setMapDataMap
            );
            listeningMapQueryWithNoChildren(
                db.collection('maps').where('editors', 'array-contains', userRef),
                mapDataMapRef,
                setMapDataMap
            );

            /* 利用者としての地図 */
            listeningMapQueryWithNoChildren(
                db.collection('maps').where('allUsable', '==', true),
                mapDataMapRef,
                setMapDataMap
            );
            listeningMapQueryWithNoChildren(
                db.collection('maps').where('users', 'array-contains', userRef),
                mapDataMapRef,
                setMapDataMap
            );

            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!map || controllerSetted) {
            return;
        }

        const topLeftTitle = <div className="mt-2 ml-1 d-block d-md-none"><h4>
            <Badge color="light" id="mapNameLeft" className="d-none border border-dark" />
        </h4></div>;
        const topLeftTitleDiv = document.createElement('div');
        ReactDOM.render(topLeftTitle, topLeftTitleDiv);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(topLeftTitleDiv);
        const topCenterTitle = <div className="mt-2 d-none d-md-block"><h4>
            <Badge color="light" id="mapNameCenter" className="d-none border border-dark" />
        </h4></div>;
        const topCenterTitleDiv = document.createElement('div');
        ReactDOM.render(topCenterTitle, topCenterTitleDiv);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(topCenterTitleDiv);
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
            setMapDataMap
        );
        setListeningMapIds([...listeningMapIds, mapId]);
        setDisplaySelectMapModal(false);
    }, [mapId]);

    useEffect(() => {
        if (mapId) {
            const newMapData = mapDataMap.get(mapId);
            setMapData(mapDataMap.get(mapId));
            if (newMapData && map) {
                const minLat = Math.min(...newMapData.borderCoords.map(x => x.latitude));
                const minLng = Math.min(...newMapData.borderCoords.map(x => x.longitude));
                const maxLat = Math.max(...newMapData.borderCoords.map(x => x.latitude));
                const maxLng = Math.max(...newMapData.borderCoords.map(x => x.longitude));
                map.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(minLat, minLng),
                    new google.maps.LatLng(maxLat, maxLng)
                ));
            }
        } else {
            setMapData(undefined);
        }
    }, [mapDataMap, mapId]);

    useEffect(() => {
        if (!controllerSetted) {
            return;
        }
        const mapNameBadgeLeft = document.getElementById('mapNameLeft');
        const mapNameCenter = document.getElementById('mapNameCenter');
        if (!mapNameBadgeLeft || !mapNameCenter) {
            return;
        }
        if (mapData) {
            mapNameBadgeLeft.innerHTML = mapData.name;
            mapNameBadgeLeft.classList.remove('d-none');
            mapNameCenter.innerHTML = mapData.name;
            mapNameCenter.classList.remove('d-none');
            setTitle(mapData.name);
        } else {
            mapNameBadgeLeft.innerHTML = '';
            mapNameBadgeLeft.classList.add('d-none');
            mapNameCenter.innerHTML = '';
            mapNameCenter.classList.add('d-none');
            setTitle('メイン');
        }
    }, [mapData, controllerSetted]);

    return <Fragment>
        <MapApp
            authUser={authUser}
            user={user}
            title={title}
            loading={loading}
            pageRole={pageRole}
            onLoadMap={setMap}
            onRightClick={(e) => { setNewLatLng(e.latLng); }}
        >
            {
                map
                &&
                mapId
                &&
                mapData
                &&
                <MarkerModeMapContents
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
        {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
        <div style={{ display: 'none' }}>
            <Button id="user" onClick={(e) => {
                e.preventDefault();
            }}
            />
            <Button id="list" onClick={(e) => {
                e.preventDefault();
                setDisplaySelectMapModal(true);
            }} />
        </div>
    </Fragment>;
}