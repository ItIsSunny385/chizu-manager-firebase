import React, { useState, MouseEvent, useEffect } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../components/InitializeFirebase';
import { setCookie } from 'nookies';
import MapApp from '../../components/MapApp';
import { Polyline, Polygon } from '@react-google-maps/api';

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

export default function AddBorder() {
    const [loading, setLoading] = useState(true);
    const [corners, setCorners, pushCorner] = useCorners();
    const [finished, setFinished] = useState(false);
    const router = useRouter();

    const onLoadMap = (map: google.maps.Map<Element>) => {
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
            setFinished(true);
        }
    }

    const onMouseUpPolyline = (e: google.maps.PolyMouseEvent) => {
        onMouseUp(e);

        /* 最初の頂点を右クリックされた場合 */
        if ((e.domEvent as globalThis.MouseEvent).button === 2 && e.vertex === 0) {
            setFinished(true);
        }
    }

    return (
        <MapApp
            loading={loading}
            onLoadMap={onLoadMap}
            onRightClick={finished ? undefined : onRightClick}
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
                        onMouseDown={(e) => { console.log('onMouseDown', e) }}
                    />
            }
        </MapApp>
    );
}