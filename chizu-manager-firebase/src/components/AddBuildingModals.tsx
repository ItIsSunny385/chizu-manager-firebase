import React, { useState } from 'react';
import BuildingBasicInfoModal from './BuildingBasicInfoModal';
import BuildingFloorInfoModal, { FloorInfoA } from './BuildingFloorInfoModal';
import BuildingRoomInfoModal from './BuildingInfoModal';
import { BuildingBasicInfo, BuildingInfo, FloorInfoB, RoomInfo, RoomNumberTypes } from '../types/map';

interface Props {
    latLng: google.maps.LatLng,
    toggle: () => void,
    finish: (result: BuildingInfo) => void,
}

export default function AddBuildingModals(props: Props) {
    const [displayBasicInfoModal, setDisplayBasicInfoModal] = useState(true);
    const [basicInfo, setBasicInfo] = useState(undefined as BuildingBasicInfo);
    const [displayFloorInfoModal, setDisplayFloorInfoModal] = useState(false);
    const [buildingInfo, setBuildingInfo] = useState(undefined as BuildingInfo);
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
                            rooms: [{ number: '' }]
                        } as FloorInfoB));
                        const building: BuildingInfo = {
                            name: result.name,
                            latLng: props.latLng,
                            floors: floors,
                        };
                        setBuildingInfo(building);
                        setBuildingInfoModal(true);
                    } else {
                        setDisplayFloorInfoModal(true);
                    }
                }}
            />
        }
        {
            displayFloorInfoModal
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
                                number: `${x.floorNumber}${j.toString().padStart(2, '0')}`
                            } as RoomInfo));
                        return {
                            number: x.floorNumber,
                            rooms: rooms
                        }
                    });
                    const building: BuildingInfo = {
                        name: basicInfo.name,
                        latLng: props.latLng,
                        floors: floors,
                    };
                    setBuildingInfo(building);
                    setBuildingInfoModal(true);
                }}
            />
        }
        {
            displayBuildingInfoModal
            &&
            <BuildingRoomInfoModal
                title='集合住宅追加（最終調整）'
                data={buildingInfo}
                toggle={() => {
                    setBuildingInfoModal(false);
                    props.toggle();
                }}
                finish={props.finish}
            />
        }
    </React.Fragment>;
}