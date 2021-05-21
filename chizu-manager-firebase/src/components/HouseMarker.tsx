import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { InfoWindow, Marker } from "@react-google-maps/api";
import { Fragment, useState } from "react";
import { ChatTextFill, Signpost2Fill, TrashFill } from "react-bootstrap-icons";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";
import { House } from '../types/map';
import { Status } from "../types/model";
import { getGoogleMapRouteUrl, getMarkerUrl } from '../utils/markerUtil';
import CommentModal from '../components/CommentModal';
import { Colors } from '../types/bootstrap';

interface Props {
    editable: boolean;
    docRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
    data: House;
    statusMap: Map<string, Status>;
    open: boolean;
    toggle: () => void;
}

const db = firebase.firestore();

export default function HouseMarker(props: Props) {
    const [displayCommentModal, setDisplayCommentModal] = useState(false);

    const statusId = props.data.statusRef.id;
    const status = props.statusMap.get(statusId)!;

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
        draggable={props.editable}
        onDragEnd={async (e) => {
            await props.docRef.update({ latLng: new firebase.firestore.GeoPoint(e.latLng.lat(), e.latLng.lng()) });
        }}
        onClick={(e) => {
            props.toggle();
        }}
        zIndex={2}
    >
        {
            props.open
            &&
            <InfoWindow onCloseClick={() => { props.toggle(); }}>
                <Fragment>
                    {
                        props.editable
                        &&
                        <div className="text-right mb-2">
                            <Button outline size="sm" onClick={(e) => { props.docRef.delete(); }}>
                                <TrashFill />
                            </Button>
                        </div>
                    }
                    <InputGroup size="sm">
                        <Input
                            type="select"
                            value={statusId}
                            onChange={async (e) => {
                                await props.docRef.update({ statusRef: db.collection('statuses').doc(e.target.value) });
                            }}
                        >
                            {
                                Array.from(props.statusMap.entries())
                                    .map(([id, x]) => <option key={id} value={id}>{x.name}</option>)
                            }
                        </Input>
                        <InputGroupAddon addonType="append">
                            <Button
                                color={props.data.comment ? Colors.Danger : Colors.Secondary}
                                onClick={(e) => { setDisplayCommentModal(true); }}>
                                <ChatTextFill />
                            </Button>
                        </InputGroupAddon>
                        <InputGroupAddon addonType="append">
                            <Button
                                onClick={() => { window.open(getGoogleMapRouteUrl(props.data.latLng), '_blank'); }}
                            >
                                <Signpost2Fill />
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                    {
                        displayCommentModal
                        &&
                        <CommentModal
                            data={props.data.comment}
                            save={(newData) => { props.docRef.update({ comment: newData }); }}
                            toggle={() => { setDisplayCommentModal(false); }}
                        />
                    }
                </Fragment>
            </InfoWindow >
        }
    </Marker >;
}