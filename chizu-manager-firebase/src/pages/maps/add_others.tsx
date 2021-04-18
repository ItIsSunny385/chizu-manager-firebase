import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import nookies from 'nookies';
import { NewMapBasicInfoWithBorderCoords } from '../../types/map';
import MapApp from '../../components/MapApp';
import { Marker, Polyline } from '@react-google-maps/api';
import { Badge, Button } from 'reactstrap';
import { InfoCircleFill } from 'react-bootstrap-icons';
import { MessageModalProps } from '../../components/MessageModal';

interface Props {
    newMapBasicInfoWithBorderCoords: NewMapBasicInfoWithBorderCoords
}

export default function AddOthers(props: Props) {
    const [loading, setLoading] = useState(true);
    const [messageModalProps, setMessageModalProps] = useState(undefined as MessageModalProps);
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

    const leftBottomButtons = <div className="ml-2 mb-2">
        <Button onClick={(e) => { e.preventDefault(); document.getElementById('back').click(); }}>戻る</Button>
        <Button className="ml-1" onClick={(e) => { e.preventDefault(); document.getElementById('finish').click(); }}>完了</Button>
    </div>;

    const topCenterTitle = <div className="mt-1"><h4>
        <Badge color="dark">バッジ、建物追加</Badge>
        <a className="ml-1" onClick={(e) => { e.preventDefault(); document.getElementById('showInfoModal').click(); }}><InfoCircleFill /></a>
    </h4></div>;

    const onLoadMap = (map: google.maps.Map<Element>) => {
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
    }

    const onClickBackButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        router.push('/maps/add_border');
    }

    const onClickFinishButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
    }

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
    }

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={onLoadMap}
                messageModalProps={messageModalProps}
            >
                <Polyline
                    path={polylinePath}
                    options={{ strokeColor: "red" }}
                />
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
                />
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