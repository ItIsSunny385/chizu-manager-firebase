import firebase from 'firebase';
import React, { useState } from 'react';
import BuildingBasicInfoModal from './BuildingBasicInfoModal';
import BuildingFloorInfoModal, { FloorInfoA } from './BuildingFloorInfoModal';
import BuildingInfoModal from './BuildingInfoModal';
import { BuildingBasicInfo, Building, Floor, Room, RoomNumberTypes } from '../types/map';

interface Props {
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
                        const floors = Array.from({ length: result.numberOfFloors }, (v, i) => ({
                            number: i + 1,
                            rooms: [{
                                orderNumber: 1,
                                roomNumber: '',
                                statusRef: props.defaultStatusRef
                            } as Room]
                        } as Floor));
                        const building: Building = {
                            statusRef: props.defaultBuildingStatusRef,
                            name: result.name,
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
                    const floors = result.map(x => {
                        const rooms = Array.from({ length: x.maxRoomNumber }, (v, i) => i + 1)
                            .filter(j => {
                                if (j === 4 && basicInfo.roomNumberType === RoomNumberTypes.Except4) {
                                    return false;
                                } else if ((j === 4 || j === 9) && basicInfo.roomNumberType === RoomNumberTypes.Except4And9) {
                                    return false;
                                } else {
                                    return true;
                                }
                            })
                            .map(j => ({
                                orderNumber: j,
                                roomNumber: `${x.floorNumber}${j.toString().padStart(2, '0')}`,
                                statusRef: props.defaultStatusRef
                            } as Room));
                        return {
                            number: x.floorNumber,
                            rooms: rooms
                        }
                    });
                    const building: Building = {
                        statusRef: props.defaultBuildingStatusRef,
                        name: basicInfo.name,
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