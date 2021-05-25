import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Button, FormText } from 'reactstrap';
import { Floor, Room } from '../types/map';
import { cloneFloor } from '../utils/mapUtil';
import RoomEditor, { MAX_ROOM_NAME_LENGTH } from './RoomEditor';

interface Props {
    floorRef: firebase.firestore.DocumentReference;
    data: Floor;
    defaultStatusRef: firebase.firestore.DocumentReference;
    setData: (newData: Floor) => void;
    setError: (error: boolean) => void;
}

export default function FloorEditor(props: Props) {
    const [floorError, setFloorError] = useState(false);
    const [roomErrors, setRoomErrors] = useState(new Map<string, boolean>());

    useEffect(() => {
        setFloorError(Array.from(roomErrors.values()).some(x => x));
    }, [roomErrors]);

    useEffect(() => {
        props.setError(floorError);
    }, [floorError]);

    return <details key={props.data.id} className="mt-1">
        <summary>
            {props.data.number}階
            {
                floorError
                &&
                <small className="text-danger ml-3">部屋番号が長すぎます。</small>
            }
        </summary>
        <div>
            <FormText>{`部屋番号は${MAX_ROOM_NAME_LENGTH}文字までです。`}</FormText>
            {
                Array.from(props.data.rooms.values()).map((room) => {
                    return <RoomEditor
                        data={room}
                        defaultStatusRef={props.defaultStatusRef}
                        setData={(newRoom) => {
                            const newFloor = cloneFloor(props.data);
                            newFloor.rooms.set(room.id, newRoom);
                            props.setData(newFloor);
                        }}
                        delete={() => {
                            const newFloor = cloneFloor(props.data);
                            newFloor.rooms.delete(room.id);
                            props.setData(newFloor);
                        }}
                        setError={(error) => {
                            const newRoomErrors = new Map<string, boolean>(roomErrors);
                            newRoomErrors.set(room.id, error);
                            setRoomErrors(newRoomErrors);
                        }}
                    />
                })
            }
            <div className="mt-1 text-right">
                <Button
                    onClick={() => {
                        const newData = cloneFloor(props.data);
                        const nextOrderNumber = props.data.rooms.size > 0
                            ? Math.max(...Array.from(props.data.rooms.values()).map(x => x.orderNumber)) + 1 : 1;
                        const roomRef = props.floorRef.collection('rooms').doc();
                        const newRoom: Room = {
                            id: roomRef.id,
                            orderNumber: nextOrderNumber,
                            roomNumber: '',
                            statusRef: props.defaultStatusRef,
                            comment: null,
                        };
                        newData.rooms.set(roomRef.id, newRoom);
                        props.setData(newData);
                    }}
                >部屋追加</Button>
            </div>
        </div>
    </details>;
}