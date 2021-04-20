import React, { useState } from 'react';
import BuildingBasicInfoModal from './BuildingBasicInfoModal';
import BuildingFloorInfoModal, { FloorInfoA } from './BuildingFloorInfoModal';
import BuildingRoomInfoModal, { FloorInfoB } from './BuildingRoomInfoModal';
import { BuildingBasicInfo, BuildingInfo } from '../types/map';

interface Props {
    latLng: google.maps.LatLng,
    toggle: () => void,
    finish: (result: BuildingInfo) => void,
}

export default function AddBuildingModals(props: Props) {
    const [displayBasicInfoModal, setDisplayBasicInfoModal] = useState(true);
    const [basicInfo, setBasicInfo] = useState(undefined as BuildingBasicInfo);
    const [displayFloorInfoModal, setDisplayFloorInfoModal] = useState(false);
    const [floorInfoArray, setFloorInfoArray] = useState(undefined as FloorInfoA[]);
    const [displayRoomInfoModal, setDisplayRoomInfoModal] = useState(false);

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
                    setDisplayFloorInfoModal(true);
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
                    setFloorInfoArray(result);
                    setDisplayRoomInfoModal(true);
                }}
            />
        }
        {
            displayRoomInfoModal
            &&
            <BuildingRoomInfoModal
                roomNumberType={basicInfo.roomNumberType}
                floorInfoAArray={floorInfoArray}
                toggle={() => {
                    setDisplayRoomInfoModal(false);
                    props.toggle();
                }}
                finish={(result: FloorInfoB[]) => {
                    const building: BuildingInfo = {
                        name: basicInfo.name,
                        latLng: props.latLng,
                        floors: result,
                    };
                    props.finish(building);
                }}
            />
        }
    </React.Fragment>;
}