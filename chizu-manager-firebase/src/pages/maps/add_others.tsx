import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { MapBasicInfoWithBorderCoords, Building, House } from '../../types/map';
import MapApp from '../../components/MapApp';
import { Polyline } from '@react-google-maps/api';
import { Badge, Button } from 'reactstrap';
import { InfoCircleFill } from 'react-bootstrap-icons';
import { MessageModalProps } from '../../components/MessageModal';
import SelectBuildingTypeWindow from '../../components/SelectBuildingTypeWindow';
import MapNameBadge from '../../components/MapNameBadge';
import { Status } from '../../types/model';

interface Props {
    data: MapBasicInfoWithBorderCoords
}

const db = firebase.firestore();

export default function AddOthers(props: Props) {
    const [loading, setLoading] = useState(true);
    const [messageModalProps, setMessageModalProps] = useState(undefined as MessageModalProps | undefined);
    const [displaySelectBuildingTypeWindow, setDisplySelectBuildingTypeWindow] = useState(false);
    const [newBuildingLatLng, setNewBuildingLatLng] = useState(undefined as google.maps.LatLng | undefined);
    const [houses, setHouses] = useState([] as House[]);
    const [buildings, setBuildings] = useState([] as Building[]);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const name = props.data.name;
    const borderCoords = props.data.borderCoords;
    const maxLat = Math.max(...borderCoords.map(coord => coord.latitude));
    const maxLng = Math.max(...borderCoords.map(coord => coord.longitude));
    const minLat = Math.min(...borderCoords.map(coord => coord.latitude));
    const minLng = Math.min(...borderCoords.map(coord => coord.longitude));
    const router = useRouter();

    const initialBadgeLatLng =
        new firebase.firestore.GeoPoint((maxLat + minLat) / 2, (maxLng + minLng) / 2);

    const [badgeLatLng, setBadgeLatLng] = useState(initialBadgeLatLng);
    const polylinePath = [...borderCoords.map(x => ({ lat: x.latitude, lng: x.longitude }))];
    polylinePath.push(polylinePath[0]);

    const onLoadMap = (map: google.maps.Map<Element>) => {
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
        const topCenterTitle = <div className="mt-1"><h4>
            <Badge color="dark">バッジ、建物追加</Badge>
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
        const leftBottomButtonDiv = document.createElement('div');
        ReactDOM.render(leftBottomButtons, leftBottomButtonDiv);
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(leftBottomButtonDiv);
        const topCenterTitleDiv = document.createElement('div');
        ReactDOM.render(topCenterTitle, topCenterTitleDiv);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(topCenterTitleDiv);
        map.fitBounds(new google.maps.LatLngBounds(
            new google.maps.LatLng(minLat, minLng),
            new google.maps.LatLng(maxLat, maxLng)
        ));
        setLoading(false);
    };

    const onClickBackButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        router.push('/maps/add_border');
    };

    const onClickFinishButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        const batch = firebase.firestore().batch();
        const mapRef = db.collection('maps').doc();
        batch.set(mapRef, { ...props.data, badgeLatLng: badgeLatLng });
        houses.forEach(x => {
            const houseRef = mapRef.collection('houses').doc();
            batch.set(houseRef, x);
        });
        buildings.forEach(x => {
            const buildingRef = mapRef.collection('buildings').doc();
            const building = { ...x } as any;
            delete building.floors;
            batch.set(buildingRef, building);
            x.floors.forEach(y => {
                const floorRef = buildingRef.collection('floors').doc();
                const floor = { ...y } as any;
                delete floor.rooms;
                batch.set(floorRef, floor);
                y.rooms.forEach(z => {
                    const roomRef = floorRef.collection('rooms').doc();
                    batch.set(roomRef, z);
                });
            });
        });
        try {
            await batch.commit();
            router.push('/maps');
        } catch (error) {
            const toggle = () => setMessageModalProps(undefined);
            const newMessageModalProps: MessageModalProps = {
                modalHeaderProps: {
                    toggle: toggle,
                },
                modalProps: {
                    isOpen: true,
                    toggle: toggle,
                },
                children: 'エラーが発生しました！',
                modalFooterContents: <Button onClick={toggle}>OK</Button>
            };
            setMessageModalProps(newMessageModalProps);
        }
    };

    const onClickShowInfoModalButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const toggle = () => setMessageModalProps(undefined);
        const newMessageModalProps: MessageModalProps = {
            modalHeaderProps: {
                toggle: toggle,
            },
            modalHeaderContents: 'バッジ、建物追加画面の使い方',
            modalProps: {
                isOpen: true,
                toggle: toggle,
            },
            children: <ol>
                <li>バッジ（地図名称のマーカー）をドラッグアンドドロップで適切な場所に動かします。</li>
                <li>建物を追加したい場所で右クリックをします。</li>
                <li>追加する建物種別を家と集合住宅から選びます。家を選択した場合はすぐに家が追加されます。</li>
                <li>ビルを選択した場合は、その後で階数などの情報を聞かれるので、それに従って入力してください。</li>
                <li>必要があれば一度追加した建物を削除したり、ドラッグアンドドロップで動かすこともできます。</li>
                <li>建物の追加が終わったら、左下の「完了」ボタンを押します。</li>
            </ol>,
            modalFooterContents: <Button onClick={toggle}>OK</Button>
        };
        setMessageModalProps(newMessageModalProps);
        return;
    };

    const addHouse = (result: House) => {
        const newHouses = [...houses, result];
        setHouses(newHouses);
        setNewBuildingLatLng(undefined);
    };

    const addBuilding = (result: Building) => {
        const newBuildings = [...buildings, result];
        setBuildings(newBuildings);
        setNewBuildingLatLng(undefined);
    };

    const onRightClickMap = (e: google.maps.MapMouseEvent) => {
        setNewBuildingLatLng(e.latLng);
        setDisplySelectBuildingTypeWindow(true);
    };

    useEffect(() => {
        db.collection('statuses').orderBy('number', 'asc').onSnapshot((snapshot) => {
            const newStatusMap = new Map<string, Status>();
            snapshot.forEach((x) => {
                newStatusMap.set(x.id, {
                    name: x.data().name,
                    number: x.data().number,
                    pin: x.data().pin,
                    label: x.data().label,
                    statusAfterResetingRef: x.data().statusAfterResetingRef,
                });
            });
            setStatusMap(newStatusMap);
        });

        db.collection('building_statuses').orderBy('number', 'asc').onSnapshot((snapshot) => {
            const newBuildingStatusMap = new Map<string, Status>();
            snapshot.forEach((x) => {
                newBuildingStatusMap.set(x.id, {
                    name: x.data().name,
                    number: x.data().number,
                    pin: x.data().pin,
                    label: x.data().label,
                    statusAfterResetingRef: x.data().statusAfterResetingRef,
                });
            });
            setBuildingStatusMap(newBuildingStatusMap);
        });
    }, []);

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={onLoadMap}
                messageModalProps={messageModalProps}
                onRightClick={onRightClickMap}
            >
                {/* 境界線 */}
                <Polyline
                    path={polylinePath}
                    options={{ strokeColor: "red", zIndex: 1 }}
                />
                {/* 地図名バッジ */}
                <MapNameBadge
                    latLng={badgeLatLng}
                    name={name}
                    draggable={true}
                    setLatLng={setBadgeLatLng}
                />
                {/* 新規建物追加ウィンドウ */}
                {
                    /*
                    displaySelectBuildingTypeWindow && newBuildingLatLng
                    &&
                    <SelectBuildingTypeWindow
                        defaultStatusRef={
                            db.collection('statuses').doc(Array.from(statusMap.keys())[0])
                        }
                        defaultBuildingStatusRef={
                            db.collection('building_statuses').doc(Array.from(buildingStatusMap.keys())[0])
                        }
                        latLng={newBuildingLatLng}
                        close={() => {
                            setNewBuildingLatLng(undefined);
                            setDisplySelectBuildingTypeWindow(false);
                        }}
                        addHouse={addHouse}
                        addBuilding={addBuilding}
                    />
                    */
                }
                {/* 家 */}
                {
                    /*
                    <HouseMarkers
                        data={houses}
                        statusMap={statusMap}
                        setData={setHouses}
                    />
                    */
                }
                {/* 集合住宅 */}
                {
                    /*
                    <BuildingMarkers
                        data={buildings}
                        statusMap={statusMap}
                        buildingStatusMap={buildingStatusMap}
                        setData={setBuildings}
                    />
                    */
                }
            </MapApp>
            {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
            <div style={{ display: 'none' }}>
                <Button id="back" onClick={onClickBackButton} />
                <Button id="finish" onClick={onClickFinishButton} />
                <Button id="showInfoModal" onClick={onClickShowInfoModalButton} />
            </div>
        </React.Fragment >
    );
}

export async function getServerSideProps(ctx: any) {
    const cookies = nookies.get(ctx);
    const mapBasicInfoWithBorderCoords = cookies.mapBasicInfoWithBorderCoords ?
        JSON.parse(cookies.mapBasicInfoWithBorderCoords) : undefined;
    nookies.destroy(ctx, 'mapBasicInfoWithBorderCoords', { path: '/' });
    return {
        props: {
            data: mapBasicInfoWithBorderCoords,
        }
    };
}