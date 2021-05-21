import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Fragment, useEffect, useState } from "react";
import { Polyline } from "@react-google-maps/api";
import { Building, House } from '../types/map';
import { Status } from "../types/model";
import HouseMarker from './HouseMarker';
import SelectBuildingTypeWindow from './SelectBuildingTypeWindow';
import BuildingMarker from './BuildingMarker';

interface Props {
    editable: boolean;
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

    useEffect(() => {
        if (!props.editable && props.newLatLng) {
            props.resetNewLatLng();
        }
    });

    return <Fragment>
        {/* 境界線 */}
        <Polyline
            path={polylinePath}
            options={{ strokeColor: "red", zIndex: 1 }}
        />
        {/* 家 */}
        {
            props.houses.map((x, i) => {
                return <HouseMarker
                    editable={props.editable}
                    docRef={props.mapRef.collection('houses').doc(x.id)}
                    key={i}
                    data={x}
                    statusMap={props.statusMap}
                />;
            })
        }
        {/* 集合住宅 */}
        {
            props.buildings.map((x, i) => {
                return <BuildingMarker
                    editable={props.editable}
                    docRef={props.mapRef.collection('buildings').doc(x.id)}
                    key={i}
                    data={x}
                    statusMap={props.statusMap}
                    buildingStatusMap={props.buildingStatusMap}
                />;
            })
        }
        {/* 建物種別選択ウィンドウ */}
        {
            props.newLatLng
            &&
            props.editable
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