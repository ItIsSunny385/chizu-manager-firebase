import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Fragment } from "react";
import { Polyline } from "@react-google-maps/api";
import { Building, House } from '../types/map';
import BuildingMarkers from './BuildingMarkers';
import { Status } from "../types/model";
import HouseMarker from './HouseMarker';
import SelectBuildingTypeWindow from './SelectBuildingTypeWindow';

interface Props {
    mapRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    borderCoords: google.maps.LatLng[],
    statusMap: Map<string, Status>,
    buildingStatusMap: Map<string, Status>,
    houses: Array<House>,
    buildings: Array<Building>,
    newLatLng: google.maps.LatLng | undefined,
    resetNewLatLng: () => void,
}

const db = firebase.firestore();

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
        {/* 建物種別選択ウィンドウ */}
        {
            props.newLatLng
            &&
            <SelectBuildingTypeWindow
                mapRef={props.mapRef}
                defaultStatusRef={
                    db.collection('statuses').doc(Array.from(props.statusMap.keys())[0])
                }
                defaultBuildingStatusRef={
                    db.collection('building_statuses').doc(Array.from(props.buildingStatusMap.keys())[0])
                }
                latLng={props.newLatLng}
                close={props.resetNewLatLng}
            />
        }
    </Fragment>;
}