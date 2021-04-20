import React, { useState } from 'react';
import { TrashFill } from 'react-bootstrap-icons';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { RoomNumberTypes } from '../types/map';
import { FloorInfoA } from './BuildingFloorInfoModal';
import MessageModal from './MessageModal';

interface Props {
    roomNumberType: RoomNumberTypes,
    floorInfoAArray: FloorInfoA[],
    toggle: () => void,
    finish: (result: FloorInfoB[]) => void,
}

export interface RoomInfo {
    number: string
}

export interface FloorInfoB {
    number: number,
    rooms: RoomInfo[]
}

export default function BuildingRoomInfoModal(props: Props) {
    const defaultFloorInfoBArray = props.floorInfoAArray.map(x => {
        const rooms = Array.from({ length: x.maxRoomNumber }, (v, i) => ({
            number: `${x.floorNumber}${(i + 1).toString().padStart(2, '0')}`
        } as RoomInfo));
        return {
            number: x.floorNumber,
            rooms: rooms
        }
    });
    const [floorInfoBArray, setFloorInfoBArray] = useState(defaultFloorInfoBArray);
    const onClickFinishButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        props.finish(floorInfoBArray);
    };
    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: '集合住宅追加（部屋情報入力）',
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
        {
            floorInfoBArray.map((floor, i) => {
                const onClickAddRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    const newFloorInfoBArray = [...floorInfoBArray];
                    newFloorInfoBArray[i].rooms.push({ number: '' });
                    setFloorInfoBArray(newFloorInfoBArray);
                };
                return <details className="mt-1">
                    <summary>{floor.number}階</summary>
                    <div>
                        {
                            floor.rooms.map((room, j) => {
                                const onChangeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newFloorInfoBArray = [...floorInfoBArray];
                                    newFloorInfoBArray[i].rooms[j].number = e.target.value;
                                    setFloorInfoBArray(newFloorInfoBArray);
                                };
                                const onClickDeleteRoom = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                    const newFloorInfoBArray = [...floorInfoBArray];
                                    newFloorInfoBArray[i].rooms.splice(j, 1);
                                    setFloorInfoBArray(newFloorInfoBArray);
                                };
                                return <InputGroup className="mt-1">
                                    <Input value={room.number} onChange={onChangeRoom} onKeyUp={(e) => { }} />
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
    </MessageModal>;
}