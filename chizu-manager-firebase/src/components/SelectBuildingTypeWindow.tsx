import React, { useState } from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { Building as BuildingIcon, House, House as HouseIcon } from 'react-bootstrap-icons';
import { Nav, NavItem, NavLink } from 'reactstrap';
import AddBuildingModals from './AddBuildingModals';
import { BuildingInfo, HouseInfo } from '../types/map';

interface Props {
    latLng: google.maps.LatLng,
    close: () => void,
    addHouse: (result: HouseInfo) => void,
    addBuilding: (result: BuildingInfo) => void,
}

export default function SelectBuildingTypeWindow(props: Props) {
    const [displayAddBuildingModals, setDisplayAddBuildingModals] = useState(false);
    const toggleAddBuildingModals = () => {
        setDisplayAddBuildingModals(false);
        props.close();
    };
    const finishAddBuildingModals = (result: BuildingInfo) => {
        setDisplayAddBuildingModals(false);
        props.addBuilding(result);
    };
    const onClickHouseIcon = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        const houseInfo: HouseInfo = {
            latLng: props.latLng
        };
        props.addHouse(houseInfo);
    };
    const onClickBuildingIcon = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setDisplayAddBuildingModals(true);
    };
    return <InfoWindow position={props.latLng} onCloseClick={props.close}>
        <React.Fragment>
            <div>どちらを追加しますか？</div>
            <Nav style={{ fontSize: "1.5rem" }}>
                <NavItem className="ml-3">
                    <NavLink onClick={onClickHouseIcon}><HouseIcon /></NavLink>
                </NavItem>
                <NavItem>
                    <NavLink onClick={onClickBuildingIcon}><BuildingIcon /></NavLink>
                </NavItem>
            </Nav>
            {/* 建物追加モーダル表示 */}
            {
                displayAddBuildingModals
                &&
                <AddBuildingModals
                    latLng={props.latLng}
                    toggle={toggleAddBuildingModals}
                    finish={finishAddBuildingModals}
                />
            }
        </React.Fragment>
    </InfoWindow >;
}