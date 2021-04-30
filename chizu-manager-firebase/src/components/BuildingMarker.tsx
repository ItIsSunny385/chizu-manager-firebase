import firebase from 'firebase';
import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import { Building, } from '../types/map';
import { Status } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import BuildingInfoModal from './BuildingInfoModal';

interface Props {
    data: Building,
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

    return <Marker
        position={props.data.latLng}
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
            newData.latLng = e.latLng;
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
                <React.Fragment>
                    <h6>{props.data.name}</h6>
                    <Input
                        bsSize="sm"
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
                                .map(([id, x]) => <option value={id}>{x.name}</option>)
                        }
                    </Input>
                    {
                        props.data.floors.map(x => {
                            return <details>
                                <summary>{x.number}階</summary>
                                {
                                    x.rooms.map(y => <div>{y.number}</div>)
                                }
                            </details>;
                        })
                    }
                    <div>
                        <Button
                            size="sm"
                            onClick={(e) => { setDisplayBuildingInfoModal(true); }}
                        >
                            編集
                        </Button>
                        <Button
                            size="sm"
                            className="ml-1"
                            onClick={props.delete}
                        >
                            削除
                        </Button>
                    </div>
                    {
                        displayBuildingInfoModal
                        &&
                        <BuildingInfoModal
                            title='建物情報編集'
                            data={props.data}
                            toggle={() => {
                                setDisplayBuildingInfoModal(false);
                            }}
                            finish={(result) => {
                                props.set(result);
                                setDisplayBuildingInfoModal(false);
                            }}
                        />
                    }
                </React.Fragment>
            </InfoWindow>
        }
    </Marker>;
}