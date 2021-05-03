import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Polygon, Polyline } from "@react-google-maps/api";
import { Fragment, useEffect, useState } from "react";
import BorderVertexInfoWindow, { Props as InfoWindowProps } from "./BorderVertexInfoWIndow";

interface Props {
    mapRef: firebase.firestore.DocumentReference,
    borderCoords: google.maps.LatLng[],
    newLatLng: google.maps.LatLng | undefined,
    resetNewLatLng: () => void,
}

export default function BorderModeMapContents(props: Props) {
    const [corners, setCorners] = useState(props.borderCoords);
    const [infoWindwProps, setInfoWindowProps] = useState(undefined as InfoWindowProps | undefined);

    const onMouseUp = (e: google.maps.PolyMouseEvent) => {
        /* 頂点が動かされた場合 */
        const vertex = e.vertex;
        const edge = e.edge;
        if (typeof vertex === 'number') {
            const newCorners = [...corners];
            newCorners[vertex] = e.latLng;
            setCorners(newCorners);
        }

        /* 中間点が動かされた場合 */
        if (typeof edge === 'number') {
            const newCorner = new google.maps.LatLng({
                lat: 2 * e.latLng.lat() - corners[edge].lat(),
                lng: 2 * e.latLng.lng() - corners[edge].lng()
            });
            const newCorners = [
                ...corners.slice(0, edge + 1),
                newCorner,
                ...corners.slice(edge + 1)
            ];
            setCorners(newCorners);
        }

        /* 頂点を右クリックされた場合 */
        if ((e.domEvent as globalThis.MouseEvent).button === 2 && typeof vertex === 'number') {
            setInfoWindowProps({
                latLng: e.latLng,
                displayCheck: vertex === 0 && props.borderCoords.length === 0,
                toggle: () => {
                    setInfoWindowProps(undefined);
                },
                delete: () => {
                    const newCorners = [...corners];
                    newCorners.splice(vertex, 1);
                    setCorners(newCorners);
                    setInfoWindowProps(undefined);
                },
                check: () => {
                    props.mapRef.update({
                        borderCoords: corners.map(x => new firebase.firestore.GeoPoint(x.lat(), x.lng()))
                    });
                    setInfoWindowProps(undefined);
                },
            });
        }
    }

    useEffect(() => {
        if (props.newLatLng) {
            setCorners([...corners, props.newLatLng]);
            props.resetNewLatLng();
        }
    });

    useEffect(() => {
        if (props.borderCoords.length > 0) {
            console.log(corners);
            props.mapRef.update({
                borderCoords: corners.map(x => new firebase.firestore.GeoPoint(x.lat(), x.lng()))
            });
        }
    }, [corners])

    return <Fragment>
        {
            props.borderCoords.length === 0
                ?
                <Polyline
                    path={corners}
                    editable={true}
                    options={{ strokeColor: "red" }}
                    onMouseUp={onMouseUp}
                />
                :
                <Polygon
                    path={props.borderCoords}
                    editable={true}
                    options={{ strokeColor: "red", fillColor: "red" }}
                    onMouseUp={onMouseUp}
                />
        }
        {
            infoWindwProps
            &&
            <BorderVertexInfoWindow {...infoWindwProps} />
        }
    </Fragment>
}