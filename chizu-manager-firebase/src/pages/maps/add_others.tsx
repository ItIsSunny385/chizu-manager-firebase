import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { NewMapBasicInfoWithBorderCoords, Building, House } from '../../types/map';
import MapApp from '../../components/MapApp';
import { Polyline } from '@react-google-maps/api';
import { Badge, Button } from 'reactstrap';
import { InfoCircleFill } from 'react-bootstrap-icons';
import { MessageModalProps } from '../../components/MessageModal';
import SelectBuildingTypeWindow from '../../components/SelectBuildingTypeWindow';
import MapNameBadge from '../../components/MapNameBadge';
import HouseMarker from '../../components/HouseMarker';
import BuildingMarker from '../../components/BuildingMarker';
import { Status } from '../../types/model';

interface Props {
    data: NewMapBasicInfoWithBorderCoords
}

const db = firebase.firestore();

export default function AddOthers(props: Props) {
    const [loading, setLoading] = useState(true);
    const [messageModalProps, setMessageModalProps] = useState(undefined as MessageModalProps);
    const [displaySelectBuildingTypeWindow, setDisplySelectBuildingTypeWindow] = useState(false);
    const [newBuildingLatLng, setNewBuildingLatLng] = useState(undefined as google.maps.LatLng);
    const [houses, setHouses] = useState([] as House[]);
    const [buildings, setBuildings] = useState([] as Building[]);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [buildingStatusMap, setBuildingStatusMap] = useState(new Map<string, Status>());
    const name = props.data.name;
    const borderCoords = props.data.borderCoords;
    const maxLat = Math.max(...borderCoords.map(coord => coord.lat));
    const maxLng = Math.max(...borderCoords.map(coord => coord.lng));
    const minLat = Math.min(...borderCoords.map(coord => coord.lat));
    const minLng = Math.min(...borderCoords.map(coord => coord.lng));
    const router = useRouter();

    const initialBadgePosition: google.maps.LatLngLiteral = {
        lat: (maxLat + minLat) / 2,
        lng: (maxLng + minLng) / 2
    };

    const [badgePosition, setBadgePosition] = useState(initialBadgePosition);
    const polylinePath = [...borderCoords];
    polylinePath.push(polylinePath[0]);

    const onLoadMap = (map: google.maps.Map<Element>) => {
        const leftBottomButtons = <div className="ml-2 mb-2">
            <Button
                onClick={(e) => {
                    e.preventDefault(); document.getElementById('back').click();
                }}
            >
                戻る
            </Button>
            <Button
                className="ml-1"
                onClick={(e) => {
                    e.preventDefault(); document.getElementById('finish').click();
                }}
            >
                完了
            </Button>
        </div>;
        const topCenterTitle = <div className="mt-1"><h4>
            <Badge color="dark">バッジ、建物追加</Badge>
            <a
                className="ml-1"
                onClick={(e) => {
                    e.preventDefault(); document.getElementById('showInfoModal').click();
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

    const onClickFinishButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
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
                    position={badgePosition}
                    name={name}
                    draggable={true}
                    setPosition={setBadgePosition}
                />
                {/* 新規建物追加ウィンドウ */}
                {
                    displaySelectBuildingTypeWindow
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
                }
                {/* 家 */}
                {
                    houses.map((x, i) => {
                        const setHouseInfo = (newHouseInfo: House) => {
                            const newHouses = [...houses];
                            newHouses[i] = newHouseInfo;
                            setHouses(newHouses);
                        };
                        const deleteHouseInfo = () => {
                            const newHouses = [...houses];
                            newHouses.splice(i, 1);
                            setHouses(newHouses);
                        };
                        return <HouseMarker
                            data={x}
                            statusMap={statusMap}
                            set={setHouseInfo}
                            delete={deleteHouseInfo}
                        />;
                    })
                }
                {/* 集合住宅 */}
                {
                    buildings.map((x, i) => {
                        const setBuilding = (newBuilding: Building) => {
                            const newBuildings = [...buildings];
                            newBuildings[i] = newBuilding;
                            setBuildings(newBuildings);
                        };
                        const deleteBuilding = () => {
                            const newBuilding = [...buildings];
                            newBuilding.splice(i, 1);
                            setBuildings(newBuilding);
                        };
                        return <BuildingMarker
                            data={x}
                            buildingStatusMap={buildingStatusMap}
                            set={setBuilding}
                            delete={deleteBuilding}
                        />;
                    })
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

export async function getServerSideProps(ctx) {
    const cookies = nookies.get(ctx);
    const newMapBasicInfoWithBorderCoords = cookies.newMapBasicInfoWithBorderCoords ?
        JSON.parse(cookies.newMapBasicInfoWithBorderCoords) : undefined;
    nookies.destroy(ctx, 'newMapBasicInfoWithBorderCoords', { path: '/' });
    return {
        props: {
            data: newMapBasicInfoWithBorderCoords,
        }
    };
}