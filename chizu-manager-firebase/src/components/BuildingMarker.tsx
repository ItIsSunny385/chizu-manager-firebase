import firebase from 'firebase';
import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Button, ButtonGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { BasicFloor, BasicRoom, Building, } from '../types/map';
import { Status } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import BuildingInfoModal from './BuildingInfoModal';
import { ChatTextFill, PencilFill, TrashFill } from 'react-bootstrap-icons';
import { updateBuilding } from '../utils/buildingUtil';

interface Props {
    docRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    data: Building,
    statusMap: Map<string, Status>,
    buildingStatusMap: Map<string, Status>,
}

const db = firebase.firestore();

export default function BuildingMarker(props: Props) {
    const [openWindow, setOpenWindow] = useState(false);
    const [displayBuildingInfoModal, setDisplayBuildingInfoModal] = useState(false);
    const buildingStatusId = props.data.statusRef.id;
    const buildingStatus = props.buildingStatusMap.get(buildingStatusId)!;
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
        onDragEnd={async (e) => {
            await props.docRef.update({ latLng: new firebase.firestore.GeoPoint(e.latLng.lat(), e.latLng.lng()) })
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
                            onClick={(e) => { props.docRef.delete(); }}>
                            <TrashFill />
                        </Button>
                    </ButtonGroup>
                    <h6 className="mt-2">{props.data.name}</h6>
                    <InputGroup size="sm">
                        <Input
                            type="select"
                            defaultValue={props.data.statusRef.id}
                            onChange={async (e) => {
                                await props.docRef.update({ statusRef: db.collection('building_statuses').doc(e.target.value) });
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
                            Array.from(props.data.floors.values()).map((x, i) => {
                                const floorRef = props.docRef.collection('floors').doc(x.id);
                                return <details key={i} className="mt-1">
                                    <summary>{x.number}階（{x.rooms.size}部屋）</summary>
                                    {
                                        Array.from(x.rooms.values()).map((y, j) => <InputGroup size="sm">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>{y.roomNumber}</InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                type="select"
                                                value={y.statusRef.id}
                                                onChange={async (e) => {
                                                    const roomRef = floorRef.collection('rooms').doc(y.id);
                                                    await roomRef.update({ statusRef: db.collection('statuses').doc(e.target.value) })
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
                            buildingRef={props.docRef}
                            title='建物情報編集'
                            data={props.data}
                            defaultStatusRef={defaultStatusRef}
                            toggle={() => {
                                setDisplayBuildingInfoModal(false);
                            }}
                            finish={(result) => {
                                /* 建物情報の更新 */
                                updateBuilding(props.docRef, props.data, result);
                                setDisplayBuildingInfoModal(false);
                            }}
                        />
                    }
                </div>
            </InfoWindow>
        }
    </Marker>;
}