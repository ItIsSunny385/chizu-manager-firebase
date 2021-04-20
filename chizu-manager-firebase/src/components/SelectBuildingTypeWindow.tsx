import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { Building as BuildingIcon, House as HouseIcon } from 'react-bootstrap-icons';
import { Nav, NavItem, NavLink } from 'reactstrap';

interface Props {
    latLng: google.maps.LatLng,
    close: () => void,
    onClickHouseIcon: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
    onClickBuildingIcon: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
}

export default function SelectBuildingTypeWindow(props: Props) {
    return <InfoWindow position={props.latLng} onCloseClick={close}>
        <React.Fragment>
            <div>どちらを追加しますか？</div>
            <Nav style={{ fontSize: "1.5rem" }}>
                <NavItem className="ml-3">
                    <NavLink onClick={props.onClickHouseIcon}><HouseIcon /></NavLink>
                </NavItem>
                <NavItem>
                    <NavLink onClick={props.onClickBuildingIcon}><BuildingIcon /></NavLink>
                </NavItem>
            </Nav>
        </React.Fragment>
    </InfoWindow >;
}