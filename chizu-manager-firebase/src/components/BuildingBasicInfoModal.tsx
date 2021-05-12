import React, { Fragment, useState } from 'react';
import MessageModal from './MessageModal';
import { Button, Form, FormGroup, FormText, Input, Label } from 'reactstrap';
import { BuildingBasicInfo, RoomNumberTypes } from '../types/map';
import { Building as BuildingIcon } from 'react-bootstrap-icons';

const MAX_FLOOR_NUMBER = 30;

export interface Props {
    toggle: () => void,
    next: (result: BuildingBasicInfo) => void,
}

export default function BuildingBasicInfoModal(props: Props) {
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        numberOfFloors: 1,
        roomNumberType: RoomNumberTypes.SerialNumber
    } as BuildingBasicInfo);

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBasicInfo = { ...basicInfo };
        newBasicInfo.name = e.target.value;
        setBasicInfo(newBasicInfo);
    };

    const onChangeNumberOfFloors = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBasicInfo = { ...basicInfo };
        newBasicInfo.numberOfFloors = Number(e.target.value);
        setBasicInfo(newBasicInfo);
    };

    const onChangeRoomNumberType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBasicInfo = { ...basicInfo };
        newBasicInfo.roomNumberType = e.target.value as RoomNumberTypes;
        setBasicInfo(newBasicInfo);
    };

    const onClickNextButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        props.next(basicInfo);
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <BuildingIcon className="mb-1 mr-2" />集合住宅追加（基本情報）
        </Fragment>,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <React.Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button onClick={onClickNextButton}>次へ</Button>
        </React.Fragment>
    };

    const floorNumberOptions = new Array<number>();
    for (let i = 1; i <= MAX_FLOOR_NUMBER; i++) {
        floorNumberOptions.push(i);
    }

    return <MessageModal {...messageModalProps}>
        <div>おおよその基本情報を入力してください。後から細かい点を修正できます。</div>
        <Form className="mt-3">
            <FormGroup>
                <Label id="buildingNameLabel" for="buildingName">名前</Label>
                <Input
                    type="text"
                    id="buildingName"
                    defaultValue={basicInfo.name}
                    onChange={onChangeName}
                />
                <FormText>集合住宅の名前を入力してください。</FormText>
            </FormGroup>
            <FormGroup>
                <Label id="numbeOfFloorsLabel" for="numberOfFloors">階数</Label>
                <Input
                    type="select"
                    id="numberOfFloors"
                    defaultValue={basicInfo.numberOfFloors}
                    onChange={onChangeNumberOfFloors}
                >
                    {
                        floorNumberOptions.map(x => <option key={x} value={x}>{x}</option>)
                    }
                </Input>
                <FormText>集合住宅の階数を選択してください。</FormText>
            </FormGroup>
            <FormGroup tag="fieldset">
                <Label id="roomNumberTypeLabel" for="roomNumberType">部屋番号タイプ</Label>
                <Input
                    type="select"
                    defaultValue={basicInfo.roomNumberType}
                    onChange={onChangeRoomNumberType}
                >
                    <option value={RoomNumberTypes.SerialNumber}>連番</option>
                    <option value={RoomNumberTypes.Except4}>4抜き</option>
                    <option value={RoomNumberTypes.Except4And9}>4、9抜き</option>
                    <option value={RoomNumberTypes.Other}>その他</option>
                </Input>
                <FormText>おおよその部屋番号タイプを入力してください。後から部屋番号は調整できます。</FormText>
            </FormGroup>
        </Form>
    </MessageModal >;
}