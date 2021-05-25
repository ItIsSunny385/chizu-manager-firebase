import firebase from 'firebase';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, FormFeedback, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { TrashFill } from 'react-bootstrap-icons';
import { Room } from '../types/map';
import { cloneRoom } from '../utils/mapUtil';

export const MAX_ROOM_NAME_LENGTH = 16;

interface Props {
    data: Room;
    defaultStatusRef: firebase.firestore.DocumentReference;
    setData: (newData: Room) => void;
    delete: () => void;
    setError: (error: boolean) => void;
}

export default function RoomEditor(props: Props) {
    const [displayError, setDisplayError] = useState(false);

    useEffect(() => {
        props.setError(displayError);
    }, [displayError]);

    return <Fragment>
        <InputGroup key={props.data.id} className="mt-1">
            <Input
                value={props.data.roomNumber}
                onChange={(e) => {
                    const newData = cloneRoom(props.data);
                    newData.roomNumber = e.target.value;
                    setDisplayError(newData.roomNumber.length > MAX_ROOM_NAME_LENGTH);
                    props.setData(newData);
                }}
                className={displayError ? 'is-invalid' : ''}
            />
            <InputGroupAddon addonType="append">
                <Button onClick={props.delete}><TrashFill /></Button>
            </InputGroupAddon>
        </InputGroup>
    </Fragment>;
}