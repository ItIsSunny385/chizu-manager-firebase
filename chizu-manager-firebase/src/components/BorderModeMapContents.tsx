import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Polygon, Polyline } from "@react-google-maps/api";
import { Fragment, useEffect, useState } from "react";
import BorderVertexInfoWindow, { Props as InfoWindowProps } from "./BorderVertexInfoWIndow";

interface Props {
    borderCoords: google.maps.LatLng[];
    newLatLng: google.maps.LatLng | undefined;
    forceSave: boolean;
    update: (newBorderCoods: firebase.firestore.GeoPoint[]) => void;
    resetNewLatLng: () => void;
    finishForceSave: () => void;
}

export default function BorderModeMapContents(props: Props) {
    const [corners, setCorners] = useState(props.borderCoords);
    const [clickVertixStart, setClickVertixStart] = useState(undefined as number | undefined);
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

        /* 頂点をクリックされた場合 */
        if (typeof vertex === 'number') {
            setClickVertixStart(undefined);
            if (!clickVertixStart || new Date().getTime() - clickVertixStart > 200) {
                return;
            }
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
                    props.update(corners.map(x => new firebase.firestore.GeoPoint(x.lat(), x.lng())));
                    setInfoWindowProps(undefined);
                },
            });
        }
    }

    const onMouesDown = (e: google.maps.PolyMouseEvent) => {
        const vertex = e.vertex;
        if (typeof vertex === 'number') {
            setClickVertixStart(new Date().getTime());
        }
    }

    useEffect(() => {
        if (props.newLatLng) {
            if (props.borderCoords.length === 0) {
                setCorners([...corners, props.newLatLng]);
            }
            props.resetNewLatLng();
        }
    });

    useEffect(() => {
        if (props.forceSave) {
            props.update(corners.map(x => new firebase.firestore.GeoPoint(x.lat(), x.lng())));
            props.finishForceSave();
        }
    });

    useEffect(() => {
        if (props.borderCoords.length > 0) {
            props.update(corners.map(x => new firebase.firestore.GeoPoint(x.lat(), x.lng())));
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
                    onMouseDown={onMouesDown}
                />
                :
                <Polygon
                    path={props.borderCoords}
                    editable={true}
                    options={{ strokeColor: "red", fillColor: "red" }}
                    onMouseUp={onMouseUp}
                    onMouseDown={onMouesDown}
                />
        }
        {
            infoWindwProps
            &&
            <BorderVertexInfoWindow {...infoWindwProps} />
        }
    </Fragment>
}