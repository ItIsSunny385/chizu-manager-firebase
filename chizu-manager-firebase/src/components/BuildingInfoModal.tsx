import React, { useState } from 'react';
import { TrashFill } from 'react-bootstrap-icons';
import { Button, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import { BuildingInfo, FloorInfoB } from '../types/map';
import MessageModal from './MessageModal';

interface Props {
    title: string,
    data: BuildingInfo,
    toggle: () => void,
    finish: (result: BuildingInfo) => void,
}

export default function BuildingInfoModal(props: Props) {
    const [data, setData] = useState(props.data);
    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...data };
        newData.name = e.target.value;
        setData(newData);
    };
    const onClickAddFloor = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const newData = { ...data };
        newData.floors.push({
            number: newData.floors.length + 1,
            rooms: [{ number: '' }],
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
            data.floors.map((floor, i) => {
                const onClickAddRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    const newData = { ...data };
                    newData.floors[i].rooms.push({ number: '' });
                    setData(newData);
                };
                return <details className="mt-1">
                    <summary>{floor.number}階</summary>
                    <div>
                        {
                            floor.rooms.map((room, j) => {
                                const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newData = { ...data };
                                    newData.floors[i].rooms[j].number = e.target.value;
                                    setData(newData);
                                };
                                const onClickDeleteRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    const newData = { ...data };
                                    newData.floors[i].rooms.splice(j, 1);
                                    setData(newData);
                                };
                                return <InputGroup className="mt-1">
                                    <Input defaultValue={room.number} onChange={onChangeRoom} />
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
            <Button onClick={onClickAddFloor}>フロア追加</Button>
        </div>
    </MessageModal>;
}