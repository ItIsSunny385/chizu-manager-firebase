import firebase from 'firebase';
import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Button, ButtonGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Building, } from '../types/map';
import { Status } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import BuildingInfoModal from './BuildingInfoModal';
import { ChatTextFill, PencilFill, TrashFill } from 'react-bootstrap-icons';

interface Props {
    data: Building,
    statusMap: Map<string, Status>,
    buildingStatusMap: Map<string, Status>,
    set: (newData: Building) => void,
    delete: () => void,
}

const db = firebase.firestore();

export default function BuildingMarker(props: Props) {
    const [openWindow, setOpenWindow] = useState(false);
    const [displayBuildingInfoModal, setDisplayBuildingInfoModal] = useState(false);
    const buildingStatusId = props.data.statusRef.id;
    const buildingStatus = props.buildingStatusMap.get(buildingStatusId);
    const defaultStatusId = props.statusMap.keys().next().value as string;
    const defaultStatusRef = db.collection('statuses').doc(defaultStatusId);

    return <Marker
        position={{ lat: props.data.latLng.latitude, lng: props.data.latLng.longitude }}
        icon={{
            url: getMarkerUrl(buildingStatus.pin),
            scaledSize: new google.maps.Size(50, 50),
            labelOrigin: new google.maps.Point(25, 18),
        }}
        label={{
            text: buildingStatus.label,
            color: '#000000',
            fontWeight: 'bold',
        }}
        draggable={true}
        onDragEnd={(e) => {
            const newData = { ...props.data };
            newData.latLng = new firebase.firestore.GeoPoint(e.latLng.lat(), e.latLng.lng());
            props.set(newData);
        }}
        onClick={(e) => {
            setOpenWindow(!openWindow);
        }}
        zIndex={2}
    >
        {
            openWindow
            &&
            <InfoWindow onCloseClick={() => { setOpenWindow(false); }}>
                <div>
                    <ButtonGroup size="sm" className="text-right d-block">
                        <Button
                            outline
                            onClick={(e) => { setDisplayBuildingInfoModal(true); }}
                        >
                            <PencilFill />
                        </Button>
                        <Button
                            outline
                            onClick={(e) => { props.delete(); }}>
                            <TrashFill />
                        </Button>
                    </ButtonGroup>
                    <h6 className="mt-2">{props.data.name}</h6>
                    <InputGroup size="sm">
                        <Input
                            type="select"
                            defaultValue={props.data.statusRef.id}
                            onChange={(e) => {
                                const newData = { ...props.data };
                                newData.statusRef = db.collection('building_statuses').doc(e.target.value);
                                props.set(newData);
                            }}
                        >
                            {
                                Array.from(props.buildingStatusMap.entries())
                                    .map(([id, x]) => <option key={id} value={id}>{x.name}</option>)
                            }
                        </Input>
                        <InputGroupAddon addonType="append">
                            <Button><ChatTextFill /></Button>
                        </InputGroupAddon>
                    </InputGroup>
                    <div className="mt-1">
                        {
                            props.data.floors.map((x, i) => {
                                return <details key={i} className="mt-1">
                                    <summary>{x.number}階（{x.rooms.length}部屋）</summary>
                                    {
                                        x.rooms.map((y, j) => <InputGroup size="sm">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>{y.number}</InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                type="select"
                                                defaultValue={y.statusRef.id}
                                                onChange={(e) => {
                                                    const newData = { ...props.data };
                                                    newData.floors[i].rooms[j].statusRef
                                                        = db.collection('statuses').doc(e.target.value);
                                                    props.set(newData);
                                                }}
                                            >
                                                {
                                                    Array.from(props.statusMap.entries())
                                                        .map(([id, y]) => <option key={id} value={id}>{y.name}</option>)
                                                }
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button><ChatTextFill /></Button>
                                            </InputGroupAddon>
                                        </InputGroup>)
                                    }
                                </details>;
                            })
                        }
                    </div>
                    {
                        displayBuildingInfoModal
                        &&
                        <BuildingInfoModal
                            title='建物情報編集'
                            data={props.data}
                            defaultStatusRef={defaultStatusRef}
                            toggle={() => {
                                setDisplayBuildingInfoModal(false);
                            }}
                            finish={(result) => {
                                props.set(result);
                                setDisplayBuildingInfoModal(false);
                            }}
                        />
                    }
                </div>
            </InfoWindow>
        }
    </Marker>;
}