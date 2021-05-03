import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import React, { Fragment, useState } from 'react';
import firebase from 'firebase';
import { InfoWindow } from '@react-google-maps/api';
import { Building as BuildingIcon, House as HouseIcon } from 'react-bootstrap-icons';
import { Nav, NavItem, NavLink } from 'reactstrap';
import AddBuildingModals from './AddBuildingModals';
import { Building, House } from '../types/map';

const db = firebase.firestore();

interface Props {
    mapRef: firebase.firestore.DocumentReference,
    latLng: google.maps.LatLng,
    defaultStatusRef: firebase.firestore.DocumentReference,
    defaultBuildingStatusRef: firebase.firestore.DocumentReference,
    close: () => void,
    addHouse: (result: House) => void,
    addBuilding: (result: Building) => void,
}

export default function SelectBuildingTypeWindow(props: Props) {
    const [displayAddBuildingModals, setDisplayAddBuildingModals] = useState(false);
    const toggleAddBuildingModals = () => {
        setDisplayAddBuildingModals(false);
        props.close();
    };
    const finishAddBuildingModals = (result: Building) => {
        setDisplayAddBuildingModals(false);
        props.addBuilding(result);
    };
    const onClickHouseIcon = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        const newHouse: House = {
            latLng: new firebase.firestore.GeoPoint(props.latLng.lat(), props.latLng.lng()),
            statusRef: props.defaultStatusRef,
        };
        props.addHouse(newHouse);
    };
    const onClickBuildingIcon = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setDisplayAddBuildingModals(true);
    };
    return <InfoWindow position={props.latLng} onCloseClick={props.close}>
        {
            props.defaultStatusRef && props.defaultBuildingStatusRef
                ?
                <Fragment>
                    <div>どちらを追加しますか？</div>
                    <Nav className="h4 mb-0">
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
                            buildingRef={props.mapRef.collection('buildings').doc()}
                            latLng={props.latLng}
                            defaultStatusRef={props.defaultStatusRef}
                            defaultBuildingStatusRef={props.defaultBuildingStatusRef}
                            toggle={toggleAddBuildingModals}
                            finish={finishAddBuildingModals}
                        />
                    }
                </Fragment>
                :
                <div>ステータス設定がされていないため、建物を追加できません。</div>
        }
    </InfoWindow >;
}