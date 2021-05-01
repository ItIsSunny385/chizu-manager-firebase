import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import MapApp from '../../components/MapApp';
import { Badge, Button } from 'reactstrap';
import { InfoCircleFill } from 'react-bootstrap-icons';
import { Map } from '../../types/model';
import { House } from '../../types/map';
import { Polyline } from '@react-google-maps/api';
import MapNameBadge from '../../components/MapNameBadge';

interface Props {
    query: any
}

const db = firebase.firestore();

export default function Edit(props: Props) {
    const [loading, setLoading] = useState(true);
    const [id] = useState(props.query.id);
    const [data, setData] = useState(undefined as Map | undefined);
    const [map, setMap] = useState(undefined as google.maps.Map<Element> | undefined);
    const [polylinePath, setPolylinePath] = useState([] as google.maps.LatLngLiteral[])

    useEffect(() => {
        if (map && data) {
            const minLat = Math.min(...data.borderCoords.map(x => x.latitude));
            const minLng = Math.min(...data.borderCoords.map(x => x.longitude));
            const maxLat = Math.max(...data.borderCoords.map(x => x.latitude));
            const maxLng = Math.max(...data.borderCoords.map(x => x.longitude));
            map.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(minLat, minLng),
                new google.maps.LatLng(maxLat, maxLng)
            ));
            const newPolyLinePath = data.borderCoords.map(x => ({ lat: x.latitude, lng: x.longitude }));
            newPolyLinePath.push(newPolyLinePath[0]);
            setPolylinePath(newPolyLinePath);
            setLoading(false);
        }
    }, [map, data])

    useEffect(() => {
        db.collection('maps').doc(id).onSnapshot(x => {
            const xData = x.data();
            if (!xData) {
                return;
            }
            const newData1: Map = {
                id: x.id,
                orderNumber: xData.orderNumber,
                name: xData.name,
                status: xData.status,
                borderCoords: xData.borderCoords,
                badgeLatLng: xData.badgeLatLng,
                buildings: [],
                houses: [],
            };
            setData(newData1);
        });
    }, []);

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={(map) => { setMap(map); }}
            >
                {
                    data
                    &&
                    <Fragment>
                        {/* 境界線 */}
                        <Polyline
                            path={polylinePath}
                            options={{ strokeColor: "red", zIndex: 1 }}
                        />
                        {/* 地図名バッジ */}
                        <MapNameBadge
                            latLng={data.badgeLatLng}
                            name={data.name}
                            draggable={true}
                        />
                    </Fragment>
                }
            </MapApp>
        </React.Fragment>
    );
}

export async function getServerSideProps(ctx: any) {
    return {
        props: {
            query: ctx.query
        }
    };
}