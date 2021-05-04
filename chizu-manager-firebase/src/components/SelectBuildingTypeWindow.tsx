import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import React, { Fragment, useState } from 'react';
import firebase from 'firebase';
import { InfoWindow } from '@react-google-maps/api';
import { Building as BuildingIcon, House as HouseIcon } from 'react-bootstrap-icons';
import { Nav, NavItem, NavLink } from 'reactstrap';
import AddBuildingModals from './AddBuildingModals';
import { BasicBuilding, BasicFloor, BasicRoom, Building, House } from '../types/map';

const db = firebase.firestore();

interface Props {
    mapRef: firebase.firestore.DocumentReference,
    latLng: google.maps.LatLng,
    defaultStatusRef: firebase.firestore.DocumentReference,
    defaultBuildingStatusRef: firebase.firestore.DocumentReference,
    close: () => void,
}

export default function SelectBuildingTypeWindow(props: Props) {
    const [buildingRef, setBuildingRef] = useState(undefined as firebase.firestore.DocumentReference<firebase.firestore.DocumentData> | undefined);

    return <InfoWindow position={props.latLng} onCloseClick={props.close}>
        {
            props.defaultStatusRef && props.defaultBuildingStatusRef
                ?
                <Fragment>
                    <div>どちらを追加しますか？</div>
                    <Nav className="h4 mb-0">
                        <NavItem className="ml-3">
                            <NavLink
                                onClick={async (e) => {
                                    const newHouse: House = {
                                        latLng: new firebase.firestore.GeoPoint(props.latLng.lat(), props.latLng.lng()),
                                        statusRef: props.defaultStatusRef,
                                    };
                                    const docRef = props.mapRef.collection('houses').doc();
                                    await docRef.set(newHouse);
                                    props.close();
                                }}
                            >
                                <HouseIcon />
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                onClick={(e) => {
                                    setBuildingRef(props.mapRef.collection('buildings').doc());
                                }}
                            >
                                <BuildingIcon />
                            </NavLink>
                        </NavItem>
                    </Nav>
                    {/* 建物追加モーダル表示 */}
                    {
                        buildingRef
                        &&
                        <AddBuildingModals
                            buildingRef={buildingRef}
                            latLng={props.latLng}
                            defaultStatusRef={props.defaultStatusRef}
                            defaultBuildingStatusRef={props.defaultBuildingStatusRef}
                            toggle={() => {
                                setBuildingRef(undefined);
                                props.close();
                            }}
                            finish={(result: Building) => {
                                const batch = firebase.firestore().batch();
                                const newBuilding: BasicBuilding = {
                                    name: result.name,
                                    latLng: result.latLng,
                                    statusRef: result.statusRef,
                                };
                                batch.set(buildingRef, newBuilding);
                                result.floors.forEach((x) => {
                                    const floorRef = buildingRef.collection('floors').doc(x.id);
                                    const newFloor: BasicFloor = {
                                        number: x.number,
                                    };
                                    batch.set(floorRef, newFloor);
                                    x.rooms.forEach((y) => {
                                        const roomRef = floorRef.collection('rooms').doc(y.id);
                                        const newRoom: BasicRoom = {
                                            orderNumber: y.orderNumber,
                                            roomNumber: y.roomNumber,
                                            statusRef: y.statusRef,
                                        };
                                        batch.set(roomRef, newRoom);
                                    });
                                });
                                batch.commit();
                                setBuildingRef(undefined);
                                props.close();
                            }}
                        />
                    }
                </Fragment>
                :
                <div>ステータス設定がされていないため、建物を追加できません。</div>
        }
    </InfoWindow >;
}