import firebase from 'firebase';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, FormFeedback, FormGroup, FormText, Input, Label } from 'reactstrap';
import { Building, Room } from '../types/map';
import { cloneBuilding } from '../utils/mapUtil';
import MessageModal from './MessageModal';
import FloorEditor from './FloorEditor';
import OkModal from './OkModal';
import { ExclamationCircle } from 'react-bootstrap-icons';

interface Props {
    buildingRef: firebase.firestore.DocumentReference;
    title: any;
    data: Building;
    defaultStatusRef: firebase.firestore.DocumentReference;
    toggle: () => void;
    finish: (result: Building) => void;
}

const MAX_BUILDING_NAME_LENGTH = 16;

export default function BuildingInfoModal(props: Props) {
    const [data, setData] = useState(cloneBuilding(props.data));
    const [displayNameError, setDisplayNameError] = useState(false);
    const [floorErrors, setFloorErrors] = useState(new Map<string, boolean>());
    const [displayErrorModal, setDisplayErrorModal] = useState(false);

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
        if (displayNameError || Array.from(floorErrors.values()).some(x => x)) {
            setDisplayErrorModal(true);
            return;
        }
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

    useEffect(() => {
        setDisplayNameError(data.name.length > MAX_BUILDING_NAME_LENGTH);
    }, [data]);

    return <MessageModal {...messageModalProps}>
        <FormGroup>
            <Label for="buildingName">建物名</Label>
            <Input
                id="buildingName"
                value={data.name}
                onChange={onChangeName}
                className={displayNameError ? 'is-invalid' : ''}
            />
            {
                displayNameError
                &&
                <FormFeedback>建物名が長すぎます。</FormFeedback>
            }
            <FormText>{`名前は${MAX_BUILDING_NAME_LENGTH}文字までです。`}</FormText>
        </FormGroup>
        {
            Array.from(data.floors.values()).map((floor) => {
                const floorRef = props.buildingRef.collection('floors').doc(floor.id);
                return <FloorEditor
                    floorRef={floorRef}
                    data={floor}
                    defaultStatusRef={props.defaultStatusRef}
                    setData={(newFloor) => {
                        const newBuilding = cloneBuilding(data);
                        newBuilding.floors.set(floor.id, newFloor);
                        setData(newBuilding);
                    }}
                    setError={(error) => {
                        const newFloorErrors = new Map<string, boolean>(floorErrors);
                        newFloorErrors.set(floor.id, error);
                        setFloorErrors(newFloorErrors);
                    }}
                />
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
        {
            displayErrorModal
            &&
            <OkModal
                header={<Fragment>
                    <ExclamationCircle className="mb-1 mr-2" />エラー
                </Fragment>}
                zIndex={2000}
                toggle={() => { setDisplayErrorModal(false); }}
                ok={() => { setDisplayErrorModal(false); }}
            >
                <div>入力エラーがあります。</div>
            </OkModal>
        }
    </MessageModal>;
}