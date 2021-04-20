import React, {
    useState,
    useEffect
} from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import {
    NewMapBasicInfoWithBorderCoords,
    RoomNumberTypes,
    BuildingBasicInfo,
    BuildingBasicInfoWithFloorInfo,
    BuildingInfo
} from '../../types/map';
import { getMarkerUrl } from '../../utils/markerUtil'
import MapApp from '../../components/MapApp';
import {
    InfoWindow,
    Marker,
    Polyline
} from '@react-google-maps/api';
import {
    Badge,
    Button,
    Input,
    InputGroup,
    InputGroupAddon,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import {
    Building,
    House,
    InfoCircleFill,
    TrashFill
} from 'react-bootstrap-icons';
import {
    getNewBuildingBasicInfoModalProp,
    getNewBuildingBasicInfoWithFloorInfoModalProp,
    AddNewBuildingWindow
} from '../../utils/messageModalUtil'
import { MessageModalProps } from '../../components/MessageModal';

const MAX_NUMBER_OF_FLOORS = 30;
const MAX_NUMBER_OF_ROOMS = 30;

interface Props {
    newMapBasicInfoWithBorderCoords: NewMapBasicInfoWithBorderCoords
}

interface House {
    latLng: google.maps.LatLng
}

export default function AddOthers(props: Props) {
    const [loading, setLoading] = useState(true);
    const [messageModalProps, setMessageModalProps] = useState(undefined as MessageModalProps);
    const [addNewBuildingWindow, setAddNewBuildingWindow] = useState(undefined as AddNewBuildingWindow);
    const [houses, setHouses] = useState([] as House[]);
    const [buildings, setBuildings] = useState([] as BuildingInfo[]);
    const [newBuildingBasicInfo, setNewBuildingBasicInfo] = useState(undefined as BuildingBasicInfo);
    const [newBuildingBasicInfoWithFloorInfo, setNewBuildingBasicInfoWithFloorInfo]
        = useState(undefined as BuildingBasicInfoWithFloorInfo);
    const [newBuildingInfo, setNewBuildingInfo] = useState(undefined as BuildingInfo);
    const name = props.newMapBasicInfoWithBorderCoords.name;
    const borderCoords = props.newMapBasicInfoWithBorderCoords.borderCoords;
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

    const onDragEndBadge = (e: google.maps.MapMouseEvent) => {
        setBadgePosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
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

    const onClickHouse = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setAddNewBuildingWindow(undefined);
        const newHouses = [
            ...houses,
            { latLng: addNewBuildingWindow.latLng }
        ];
        setHouses(newHouses);
    };

    const onClickBuilding = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setNewBuildingBasicInfo({
            latLng: addNewBuildingWindow.latLng,
            name: '',
            numberOfFloors: 1,
            roomNumberType: RoomNumberTypes.SerialNumber,
        });
    };

    const onRightClickMap = (e: google.maps.MapMouseEvent) => {
        setAddNewBuildingWindow({ latLng: e.latLng });
    };

    useEffect(() => {
        if (!newBuildingBasicInfo) {
            return;
        }
        const newMessageModalProps = getNewBuildingBasicInfoModalProp(
            newBuildingBasicInfo,
            MAX_NUMBER_OF_FLOORS,
            setNewBuildingBasicInfo,
            setAddNewBuildingWindow,
            setMessageModalProps,
            setNewBuildingBasicInfoWithFloorInfo
        );
        setMessageModalProps(newMessageModalProps);
    }, [newBuildingBasicInfo]);

    useEffect(() => {
        if (!newBuildingBasicInfoWithFloorInfo) {
            return;
        }
        const newMessageModalProps = getNewBuildingBasicInfoWithFloorInfoModalProp(
            newBuildingBasicInfoWithFloorInfo,
            MAX_NUMBER_OF_ROOMS,
            setNewBuildingBasicInfoWithFloorInfo,
            setAddNewBuildingWindow,
            setMessageModalProps,
            setNewBuildingInfo
        );
        setMessageModalProps(newMessageModalProps);
    }, [newBuildingBasicInfoWithFloorInfo]);

    useEffect(() => {
        if (!newBuildingInfo) {
            return;
        }
        const toggle = () => {
            setNewBuildingInfo(undefined);
            setAddNewBuildingWindow(undefined);
            setMessageModalProps(undefined);
        };
        const onClickFinishButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            setMessageModalProps(undefined);
            setAddNewBuildingWindow(undefined);
            setBuildings([...buildings, newBuildingInfo]);
        };
        setMessageModalProps({
            modalHeaderProps: {
                toggle: toggle,
            },
            modalHeaderContents: '集合住宅追加（部屋情報入力）',
            modalProps: {
                isOpen: true,
                toggle: toggle,
            },
            children: <React.Fragment>
                {
                    newBuildingInfo.floors.map((floor, i) => {
                        const onClickAddRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                            const newNewBuildingInfo = { ...newBuildingInfo };
                            newNewBuildingInfo.floors[i].rooms.push({ number: '' });
                            setNewBuildingInfo(newNewBuildingInfo);
                        };
                        return <details className="mt-1">
                            <summary>{floor.number}階</summary>
                            <div>
                                {
                                    floor.rooms.map((room, j) => {
                                        const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const newNewBuildingInfo = { ...newBuildingInfo };
                                            newNewBuildingInfo.floors[i].rooms[j].number = e.target.value;
                                            setNewBuildingInfo(newNewBuildingInfo);
                                        };
                                        const onClickDeleteRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                            const newNewBuildingInfo = { ...newBuildingInfo };
                                            newNewBuildingInfo.floors[i].rooms.splice(j, 1);
                                            setNewBuildingInfo(newNewBuildingInfo);
                                        };
                                        return <InputGroup className="mt-1">
                                            <Input value={room.number} onChange={onChangeRoom} onKeyUp={(e) => { }} />
                                            <InputGroupAddon addonType="append">
                                                <Button onClick={onClickDeleteRoom}><TrashFill /></Button>
                                            </InputGroupAddon>
                                        </InputGroup>;
                                    })
                                }
                                <div className="mt-1 text-right">
                                    <Button onClick={onClickAddRoom}>部屋追加</Button>
                                </div>
                            </div>
                        </details>;
                    })
                }
            </React.Fragment>,
            modalFooterContents: <React.Fragment>
                <Button onClick={toggle}>キャンセル</Button>
                <Button onClick={onClickFinishButton}>完了</Button>
            </React.Fragment>
        });
    }, [newBuildingInfo]);

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
                <Marker
                    position={badgePosition}
                    icon={{
                        url: '//:0',
                        scaledSize: new google.maps.Size(100, 30),
                        labelOrigin: new google.maps.Point(50, 15),
                        anchor: new google.maps.Point(50, 15),
                    }}
                    label={{
                        text: name,
                        color: '#FF0000',
                        fontWeight: 'bold',
                        fontSize: '30px',
                    }}
                    draggable={true}
                    onDragEnd={onDragEndBadge}
                    zIndex={3}
                />
                {/* 新規建物追加ウィンドウ */}
                {
                    addNewBuildingWindow
                    &&
                    <InfoWindow position={addNewBuildingWindow.latLng} onCloseClick={() => { setAddNewBuildingWindow(undefined) }}>
                        <React.Fragment>
                            <div>どちらを追加しますか？</div>
                            <Nav style={{ fontSize: "1.5rem" }}>
                                <NavItem className="ml-3">
                                    <NavLink onClick={onClickHouse}><House /></NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink onClick={onClickBuilding}><Building /></NavLink>
                                </NavItem>
                            </Nav>
                        </React.Fragment>
                    </InfoWindow>
                }
                {/* 家 */}
                {
                    houses.map((x, i) => {
                        const onDragEndHouse = (e: google.maps.MapMouseEvent) => {
                            const newHouses = [...houses];
                            newHouses[i].latLng = e.latLng;
                            setHouses(newHouses);
                        };
                        return <Marker
                            position={x.latLng}
                            icon={{
                                url: getMarkerUrl('lightblue'),
                                scaledSize: new google.maps.Size(50, 50),
                                labelOrigin: new google.maps.Point(25, 18),
                            }}
                            label={{
                                text: '家',
                                color: '#000000',
                                fontWeight: 'bold',
                            }}
                            draggable={true}
                            onDragEnd={onDragEndHouse}
                            zIndex={2}
                        />
                    })
                }
                {/* 集合住宅 */}
                {
                    buildings.map((x, i) => {
                        const onDragEndHouse = (e: google.maps.MapMouseEvent) => {
                            const newBuildings = [...buildings];
                            newBuildings[i].latLng = e.latLng;
                            setBuildings(newBuildings);
                        };
                        return <Marker
                            position={x.latLng}
                            icon={{
                                url: getMarkerUrl('yellow'),
                                scaledSize: new google.maps.Size(50, 50),
                                labelOrigin: new google.maps.Point(25, 18),
                            }}
                            label={{
                                text: '集',
                                color: '#000000',
                                fontWeight: 'bold',
                            }}
                            draggable={true}
                            onDragEnd={onDragEndHouse}
                            zIndex={2}
                        />
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
            newMapBasicInfoWithBorderCoords: newMapBasicInfoWithBorderCoords,
        }
    };
}