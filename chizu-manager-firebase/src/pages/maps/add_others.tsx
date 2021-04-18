import React, { useState, useEffect } from 'react';
import nookies from 'nookies';
import { NewMapBasicInfoWithBorderCoords } from '../../types/map';
import MapApp from '../../components/MapApp';
import { Marker, Polyline } from '@react-google-maps/api';

interface Props {
    newMapBasicInfoWithBorderCoords: NewMapBasicInfoWithBorderCoords
}

export default function AddOthers(props: Props) {
    const [loading, setLoading] = useState(true);
    const name = props.newMapBasicInfoWithBorderCoords.name;
    const borderCoords = props.newMapBasicInfoWithBorderCoords.borderCoords;
    const maxLat = Math.max(...borderCoords.map(coord => coord.lat));
    const maxLng = Math.max(...borderCoords.map(coord => coord.lng));
    const minLat = Math.min(...borderCoords.map(coord => coord.lat));
    const minLng = Math.min(...borderCoords.map(coord => coord.lng));

    const initialBadgePosition: google.maps.LatLngLiteral = {
        lat: (maxLat + minLat) / 2,
        lng: (maxLng + minLng) / 2
    };

    const [badgePosition, setBadgePosition] = useState(initialBadgePosition);
    const polylinePath = [...borderCoords];
    polylinePath.push(polylinePath[0]);
    console.log(polylinePath);

    const onLoadMap = (map: google.maps.Map<Element>) => {
        map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLng), new google.maps.LatLng(maxLat, maxLng)));
        setLoading(false);
    };

    const onDragEndBadge = (e: google.maps.MapMouseEvent) => {
        setBadgePosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    }

    return (
        <React.Fragment>
            <MapApp
                loading={loading}
                onLoadMap={onLoadMap}
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