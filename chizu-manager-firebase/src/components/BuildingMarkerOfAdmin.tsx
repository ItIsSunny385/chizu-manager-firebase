import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { BuildingInfo, } from '../types/map';
import { getMarkerUrl } from '../utils/markerUtil';
import BuildingInfoModal from './BuildingInfoModal';

interface Props {
    data: BuildingInfo,
    set: (newData: BuildingInfo) => void,
    delete: () => void,
}

export default function BuildingMarkerOfAdmin(props: Props) {
    const [openWindow, setOpenWindow] = useState(false);
    const [displayBuildingInfoModal, setDisplayBuildingInfoModal] = useState(false);

    return <Marker
        position={props.data.latLng}
        icon={{
            url: getMarkerUrl('yellow'),
            scaledSize: new google.maps.Size(50, 50),
            labelOrigin: new google.maps.Point(25, 18),
        }}
        label={{
            text: '集',
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
                    <h5>{props.data.name}</h5>
                    <div className="h6">
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
                    </div>
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