import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../utils/InitializeFirebase';
import nookies, { setCookie } from 'nookies';
import MapApp from '../../components/MapApp';
import MessageModal, { MessageModalProps } from '../../components/MessageModal';
import { Polyline, Polygon, InfoWindow } from '@react-google-maps/api';
import { Badge, Button, Nav, NavItem, NavLink } from 'reactstrap';
import { CheckSquareFill, InfoCircleFill, TrashFill } from 'react-bootstrap-icons';
import { MapBasicInfo, MapBasicInfoWithBorderCoords } from '../../types/map';

const db = firebase.firestore();
const auth = firebase.auth();

function useCorners(): [
    google.maps.LatLng[],
    React.Dispatch<React.SetStateAction<google.maps.LatLng[]>>,
    (newCorner: google.maps.LatLng) => void
] {
    const [corners, setCorners] = useState([] as google.maps.LatLng[]);
    const push = (newCorner: google.maps.LatLng) => {
        setCorners([...corners, newCorner]);
    }
    return [corners, setCorners, push];
}

interface InfoWindowProps {
    latLng: google.maps.LatLng,
    vertex: number,
    displayCheck: boolean,
}

interface Props {
    data: MapBasicInfo
}

export default function AddBorder(props: Props) {
    const [loading, setLoading] = useState(true);
    const [corners, setCorners, pushCorner] = useCorners();
    const [finished, setFinished] = useState(false);
    const [infoWindowProps, setInfoWindowProps] = useState(undefined as InfoWindowProps);
    const [messageModalProps, setMessageModalProps] = useState(undefined as MessageModalProps);
    const router = useRouter();

    const leftBottomButtons = <div className="ml-2 mb-2">
        <Button onClick={(e) => { e.preventDefault(); document.getElementById('back').click(); }}>戻る</Button>
        <Button className="ml-1" onClick={(e) => { e.preventDefault(); document.getElementById('next').click(); }}>次へ</Button>
    </div>;

    const topCenterTitle = <div className="mt-1"><h4>
        <Badge color="dark">境界線追加</Badge>
        <a className="ml-1" onClick={(e) => { e.preventDefault(); document.getElementById('showInfoModal').click(); }}><InfoCircleFill /></a>
    </h4></div>;

    const onLoadMap = (map: google.maps.Map<Element>) => {
        const leftBottomButtonDiv = document.createElement('div');
        ReactDOM.render(leftBottomButtons, leftBottomButtonDiv);
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(leftBottomButtonDiv);
        const topCenterTitleDiv = document.createElement('div');
        ReactDOM.render(topCenterTitle, topCenterTitleDiv);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(topCenterTitleDiv);
        setLoading(false);
    };

    const onRightClick = (e: google.maps.MapMouseEvent) => {
        pushCorner(e.latLng);
    };

    const onMouseUp = (e: google.maps.PolyMouseEvent) => {
        /* 頂点が動かされた場合 */
        if (typeof e.vertex === 'number') {
            const newCorners = [...corners];
            newCorners[e.vertex] = e.latLng;
            setCorners(newCorners);
        }

        /* 中間点が動かされた場合 */
        if (typeof e.edge === 'number') {
            const newCorner = new google.maps.LatLng({
                lat: 2 * e.latLng.lat() - corners[e.edge].lat(),
                lng: 2 * e.latLng.lng() - corners[e.edge].lng()
            });
            const newCorners = [
                ...corners.slice(0, e.edge + 1),
                newCorner,
                ...corners.slice(e.edge + 1)
            ];
            setCorners(newCorners);
        }
    }

    const onMouseUpPolygone = (e: google.maps.PolyMouseEvent) => {
        onMouseUp(e);

        /* 最初の頂点を右クリックされた場合 */
        if ((e.domEvent as globalThis.MouseEvent).button === 2 && typeof e.vertex === 'number') {
            setInfoWindowProps({
                latLng: e.latLng,
                vertex: e.vertex,
                displayCheck: false,
            });
        }
    }

    const onMouseUpPolyline = (e: google.maps.PolyMouseEvent) => {
        onMouseUp(e);

        /* 最初の頂点を右クリックされた場合 */
        if ((e.domEvent as globalThis.MouseEvent).button === 2 && typeof e.vertex === 'number') {
            setInfoWindowProps({
                latLng: e.latLng,
                vertex: e.vertex,
                displayCheck: e.vertex === 0,
            });
        }
    }

    const onClickTrash = (e: React.MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
        e.preventDefault();
        const newCorners = [...corners];
        newCorners.splice(infoWindowProps.vertex, 1);
        setCorners(newCorners);
        if (newCorners.length === 0) {
            setFinished(false);
        }
        setInfoWindowProps(undefined);
    }

    const onClickCheck = (e: React.MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
        e.preventDefault();
        setFinished(true);
        setInfoWindowProps(undefined);
    }

    const onClickBackButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        router.push('/maps/add');
    }

    const onClickNextButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (!finished) {
            const toggle = () => setMessageModalProps(undefined);
            const newMessageModalProps: MessageModalProps = {
                modalProps: {
                    isOpen: true,
                    toggle: toggle,
                },
                children: '境界線の作成を完了してください。ひとつめの頂点を右クリックしてチェックマークを押すと完了します。',
                modalFooterContents: <Button onClick={toggle}>OK</Button>
            };
            setMessageModalProps(newMessageModalProps);
            return;
        }
        const mapBasicInfoWithBorderCoords: MapBasicInfoWithBorderCoords = {
            ...props.data,
            borderCoords: corners.map(x => ({ lat: x.lat(), lng: x.lng() }))
        };
        setCookie(null,
            'mapBasicInfoWithBorderCoords',
            JSON.stringify(mapBasicInfoWithBorderCoords),
            { path: '/' }
        );
        router.push('/maps/add_others');
    }

    const onClickShowInfoModalButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const toggle = () => setMessageModalProps(undefined);
        const newMessageModalProps: MessageModalProps = {
            modalHeaderProps: {
                toggle: toggle,
            },
            modalHeaderContents: '境界線追加画面の使い方',
            modalProps: {
                isOpen: true,
                toggle: toggle,
            },
            children: <ol>
                <li>境界線を作成したい場所に地図を移動させます。</li>
                <li>地図を右クリックして、境界線の頂点を追加してきます。</li>
                <li>頂点を追加し終わったら、最初に追加した頂点を右クリックして、チェックマークを押し、境界線を囲みます。</li>
                <li>境界線を微修正したい場合は、頂点と辺の中間に表示される丸をドラッグアンドドロップして微調整します。</li>
                <li>頂点を削除するときは右クリックして削除ボタンを押してください。</li>
                <li>微修正が終わったら、左下の「次へ」ボタンを押します。</li>
            </ol>,
            modalFooterContents: <Button onClick={toggle}>OK</Button>
        };
        setMessageModalProps(newMessageModalProps);
        return;
    }

    useEffect(() => {
        if (!props.data) {
            router.push('/maps/add');
        }
    }, []);

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={onLoadMap}
                onRightClick={finished ? undefined : onRightClick}
                messageModalProps={messageModalProps}
            >
                {
                    finished
                        ?
                        <Polygon
                            path={corners}
                            editable={true}
                            options={{ strokeColor: "red", fillColor: "red" }}
                            onMouseUp={onMouseUpPolygone}
                        />
                        :
                        <Polyline
                            path={corners}
                            editable={true}
                            options={{ strokeColor: "red" }}
                            onMouseUp={onMouseUpPolyline}
                        />
                }
                {
                    infoWindowProps
                    &&
                    <InfoWindow position={infoWindowProps.latLng} onCloseClick={() => { setInfoWindowProps(undefined) }}>
                        <Nav style={{ fontSize: "1.5rem" }}>
                            <NavItem>
                                <NavLink onClick={onClickTrash}><TrashFill /></NavLink>
                            </NavItem>
                            {
                                infoWindowProps.displayCheck
                                &&
                                <NavItem>
                                    <NavLink onClick={onClickCheck} className="ml-1"><CheckSquareFill /></NavLink>
                                </NavItem>
                            }
                        </Nav>
                    </InfoWindow>
                }
            </MapApp >
            {/* カスタムコントロール内は Reactで制御できないためカスタムコントロールからこちらのボタンを押させる */}
            <div style={{ display: 'none' }}>
                <Button id="back" onClick={onClickBackButton} />
                <Button id="next" onClick={onClickNextButton} />
                <Button id="showInfoModal" onClick={onClickShowInfoModalButton} />
            </div>
        </React.Fragment>
    );
}

export async function getServerSideProps(ctx) {
    const cookies = nookies.get(ctx);
    const mapBasicInfo: MapBasicInfo = cookies.mapBasicInfo ?
        JSON.parse(cookies.mapBasicInfo) : undefined;
    nookies.destroy(ctx, 'mapBasicInfo', { path: '/' });
    return {
        props: {
            data: mapBasicInfo,
        }
    };
}