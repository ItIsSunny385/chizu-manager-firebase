import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Fragment } from "react";
import { Polyline } from "@react-google-maps/api";
import { Building, House } from '../types/map';
import BuildingMarkers from './BuildingMarkers';
import { Status } from "../types/model";
import HouseMarker from './HouseMarker';

interface Props {
    mapRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    borderCoords: google.maps.LatLng[],
    statusMap: Map<string, Status>,
    buildingStatusMap: Map<string, Status>,
    houses: Array<House>,
    buildings: Array<Building>,
}

export default function MarkerModeMapContents(props: Props) {
    const polylinePath = [...props.borderCoords];
    if (polylinePath.length > 0) {
        polylinePath.push(polylinePath[0]);
    }
    return <Fragment>
        {/* 境界線 */}
        <Polyline
            path={polylinePath}
            options={{ strokeColor: "red", zIndex: 1 }}
        />
        {/* 家 */}
        {
            props.houses.map((x, i) => {
                console.log(props.mapRef.collection('houses').doc(x.id));
                return <HouseMarker
                    docRef={props.mapRef.collection('houses').doc(x.id)}
                    key={i}
                    data={x}
                    statusMap={props.statusMap}
                />;
            })
        }
        {/* 集合住宅 */}
        <BuildingMarkers
            data={props.buildings}
            statusMap={props.statusMap}
            buildingStatusMap={props.buildingStatusMap}
            setData={(buildings: Array<Building>) => {
            }}
        />
    </Fragment>;
}