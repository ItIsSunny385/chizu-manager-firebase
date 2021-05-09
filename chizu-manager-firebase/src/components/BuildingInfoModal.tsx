import firebase from 'firebase';
import React, { useState } from 'react';
import { TrashFill } from 'react-bootstrap-icons';
import { Button, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import { Building, Room } from '../types/map';
import { cloneBuilding } from '../utils/mapUtil';
import MessageModal from './MessageModal';

interface Props {
    buildingRef: firebase.firestore.DocumentReference,
    title: string,
    data: Building,
    defaultStatusRef: firebase.firestore.DocumentReference,
    toggle: () => void,
    finish: (result: Building) => void,
}

export default function BuildingInfoModal(props: Props) {
    const [data, setData] = useState(cloneBuilding(props.data));
    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = cloneBuilding(data);
        newData.name = e.target.value;
        setData(newData);
    };
    const onClickDeleteFloor = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const newData = cloneBuilding(data);
        const lastFloorId = Array.from(newData.floors.keys())[newData.floors.size - 1];
        newData.floors.delete(lastFloorId);
        setData(newData);
    };
    const onClickAddFloor = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const newData = cloneBuilding(data);
        const floorRef = props.buildingRef.collection('floors').doc();
        const roomRef = floorRef.collection('rooms').doc();
        const newRoom: Room = {
            id: roomRef.id,
            orderNumber: 1,
            roomNumber: '',
            statusRef: props.defaultStatusRef,
            comment: null,
        };
        newData.floors.set(floorRef.id, {
            id: floorRef.id,
            number: newData.floors.size + 1,
            rooms: new Map<string, Room>([[roomRef.id, newRoom]]),
        });
        setData(newData);
    };
    const onClickFinishButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        props.finish(data);
    };
    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: props.title,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <React.Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button onClick={onClickFinishButton}>完了</Button>
        </React.Fragment>
    };
    return <MessageModal {...messageModalProps}>
        <FormGroup>
            <Label for="buildingName">名前</Label>
            <Input id="buildingName" defaultValue={data.name} onChange={onChangeName} />
        </FormGroup>
        {
            Array.from(data.floors.values()).map((floor, i) => {
                const floorRef = props.buildingRef.collection('floors').doc(floor.id);
                const roomsRef = floorRef.collection('rooms');
                const onClickAddRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    const newData = cloneBuilding(data);
                    const nextOrderNumber = floor.rooms.size > 0
                        ? Math.max(...Array.from(floor.rooms.values()).map(x => x.orderNumber)) + 1 : 1;
                    const roomRef = roomsRef.doc();
                    const newRoom: Room = {
                        id: roomRef.id,
                        orderNumber: nextOrderNumber,
                        roomNumber: '',
                        statusRef: props.defaultStatusRef,
                        comment: null,
                    };
                    newData.floors.get(floor.id)!.rooms.set(roomRef.id, newRoom);
                    setData(newData);
                };
                return <details key={floor.number} className="mt-1">
                    <summary>{floor.number}階</summary>
                    <div>
                        {
                            Array.from(floor.rooms.values()).map((room, j) => {
                                const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newData = cloneBuilding(data);
                                    newData.floors.get(floor.id)!.rooms.get(room.id)!.roomNumber = e.target.value;
                                    setData(newData);
                                };
                                const onClickDeleteRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    const newData = cloneBuilding(data);
                                    newData.floors.get(floor.id)!.rooms.delete(room.id);
                                    setData(newData);
                                };
                                return <InputGroup key={j} className="mt-1">
                                    <Input defaultValue={room.roomNumber} onChange={onChangeRoom} />
                                    <InputGroupAddon addonType="append">
                                        <Button onClick={onClickDeleteRoom}><TrashFill /></Button>
                                    </InputGroupAddon>
                                </InputGroup>;
                            })
                        }
                        <div className="mt-1 text-right">
                            <Button onClick={onClickAddRoom}>部屋追加</Button>
                        </div>
                    </div>
                </details>;
            })
        }
        <div className="mt-3">
            {
                data.floors.size > 1
                &&
                <Button onClick={onClickDeleteFloor} className="mr-1">フロア削除</Button>
            }
            <Button onClick={onClickAddFloor}>フロア追加</Button>
        </div>
    </MessageModal>;
}