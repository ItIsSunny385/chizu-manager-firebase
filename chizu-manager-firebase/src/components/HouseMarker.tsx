import firebase from 'firebase';
import { InfoWindow, Marker } from "@react-google-maps/api";
import { useState } from "react";
import { ChatTextFill, TrashFill } from "react-bootstrap-icons";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";
import { House } from '../types/map';
import { Status } from "../types/model";
import { getMarkerUrl } from '../utils/markerUtil';

interface Props {
    data: House,
    statusMap: Map<string, Status>,
    set: (newData: House) => void,
    delete: () => void,
}

const db = firebase.firestore();

export default function HouseMarker(props: Props) {
    const [openWindow, setOpenWindow] = useState(false);
    const statusId = props.data.statusRef.id;
    const status = props.statusMap.get(statusId);

    return <Marker
        position={{ lat: props.data.latLng.latitude, lng: props.data.latLng.longitude }}
        icon={{
            url: getMarkerUrl(status.pin),
            scaledSize: new google.maps.Size(50, 50),
            labelOrigin: new google.maps.Point(25, 18),
        }}
        label={{
            text: status.label,
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
                <InputGroup size="sm">
                    <Input
                        type="select"
                        defaultValue={statusId}
                        onChange={(e) => {
                            const newData = { ...props.data };
                            newData.statusRef = db.collection('statuses').doc(e.target.value);
                            props.set(newData);
                        }}
                    >
                        {
                            Array.from(props.statusMap.entries())
                                .map(([id, x]) => <option key={id} value={id}>{x.name}</option>)
                        }
                    </Input>
                    <InputGroupAddon addonType="append">
                        <Button><ChatTextFill /></Button>
                    </InputGroupAddon>
                    <InputGroupAddon addonType="append">
                        <Button onClick={(e) => { props.delete(); }}><TrashFill /></Button>
                    </InputGroupAddon>
                </InputGroup>
            </InfoWindow>
        }
    </Marker >;
}