import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import firebase from 'firebase';
import React, { useState } from 'react';
import BuildingBasicInfoModal from './BuildingBasicInfoModal';
import BuildingFloorInfoModal, { FloorInfoA } from './BuildingFloorInfoModal';
import BuildingInfoModal from './BuildingInfoModal';
import { BuildingBasicInfo, Building, Floor, Room, RoomNumberTypes } from '../types/map';

const db = firebase.firestore();

interface Props {
    buildingRef: firebase.firestore.DocumentReference,
    latLng: google.maps.LatLng,
    defaultStatusRef: firebase.firestore.DocumentReference,
    defaultBuildingStatusRef: firebase.firestore.DocumentReference,
    toggle: () => void,
    finish: (result: Building) => void,
}

export default function AddBuildingModals(props: Props) {
    const [displayBasicInfoModal, setDisplayBasicInfoModal] = useState(true);
    const [basicInfo, setBasicInfo] = useState(undefined as BuildingBasicInfo | undefined);
    const [displayFloorInfoModal, setDisplayFloorInfoModal] = useState(false);
    const [building, setBuilding] = useState(undefined as Building | undefined);
    const [displayBuildingInfoModal, setBuildingInfoModal] = useState(false);

    return <React.Fragment>
        {
            displayBasicInfoModal
            &&
            <BuildingBasicInfoModal
                toggle={() => {
                    setDisplayBasicInfoModal(false);
                    props.toggle();
                }}
                next={(result: BuildingBasicInfo) => {
                    setDisplayBasicInfoModal(false);
                    setBasicInfo(result);
                    if (result.roomNumberType === RoomNumberTypes.Other) {
                        const floors = new Map<string, Floor>(Array.from({ length: result.numberOfFloors }, (v, i) => {
                            const floorRef = props.buildingRef.collection('floors').doc();
                            const roomRef = floorRef.collection('rooms').doc();
                            const newRoom: Room = {
                                id: roomRef.id,
                                orderNumber: 1,
                                roomNumber: '',
                                statusRef: props.defaultStatusRef,
                                comment: null,
                            };
                            const newRooms = new Map<string, Room>([[roomRef.id, newRoom]]);
                            const newFloor: Floor = {
                                id: floorRef.id,
                                number: i + 1,
                                rooms: newRooms
                            };
                            return [floorRef.id, newFloor];
                        }));
                        const building: Building = {
                            id: props.buildingRef.id,
                            statusRef: props.defaultBuildingStatusRef,
                            name: result.name,
                            comment: null,
                            latLng: new firebase.firestore.GeoPoint(props.latLng.lat(), props.latLng.lng()),
                            floors: floors,
                        };
                        setBuilding(building);
                        setBuildingInfoModal(true);
                    } else {
                        setDisplayFloorInfoModal(true);
                    }
                }}
            />
        }
        {
            displayFloorInfoModal && basicInfo
            &&
            <BuildingFloorInfoModal
                numberOfFloors={basicInfo.numberOfFloors}
                toggle={() => {
                    setDisplayFloorInfoModal(false);
                    props.toggle();
                }}
                next={(result: FloorInfoA[]) => {
                    setDisplayFloorInfoModal(false);
                    const floors = new Map<string, Floor>(result.map(x => {
                        const floorRef = props.buildingRef.collection('floors').doc();
                        const rooms = new Map<string, Room>(Array.from({ length: x.maxRoomNumber }, (v, i) => i + 1)
                            .filter(j => {
                                if (j === 4 && basicInfo.roomNumberType === RoomNumberTypes.Except4) {
                                    return false;
                                } else if ((j === 4 || j === 9) && basicInfo.roomNumberType === RoomNumberTypes.Except4And9) {
                                    return false;
                                } else {
                                    return true;
                                }
                            })
                            .map(j => {
                                const roomRef = floorRef.collection('rooms').doc();
                                const newRoom = {
                                    id: roomRef.id,
                                    orderNumber: j,
                                    roomNumber: `${x.floorNumber}${j.toString().padStart(2, '0')}`,
                                    statusRef: props.defaultStatusRef,
                                    comment: null,
                                };
                                return [roomRef.id, newRoom];
                            }));
                        const newFloor: Floor = {
                            id: floorRef.id,
                            number: x.floorNumber,
                            rooms: rooms
                        };
                        return [floorRef.id, newFloor];
                    }));
                    const building: Building = {
                        id: props.buildingRef.id,
                        statusRef: props.defaultBuildingStatusRef,
                        name: basicInfo.name,
                        comment: null,
                        latLng: new firebase.firestore.GeoPoint(props.latLng.lat(), props.latLng.lng()),
                        floors: floors,
                    };
                    setBuilding(building);
                    setBuildingInfoModal(true);
                }}
            />
        }
        {
            displayBuildingInfoModal && building
            &&
            <BuildingInfoModal
                buildingRef={props.buildingRef}
                title='集合住宅追加（最終調整）'
                data={building}
                defaultStatusRef={props.defaultStatusRef}
                toggle={() => {
                    setBuildingInfoModal(false);
                    props.toggle();
                }}
                finish={props.finish}
            />
        }
    </React.Fragment>;
}