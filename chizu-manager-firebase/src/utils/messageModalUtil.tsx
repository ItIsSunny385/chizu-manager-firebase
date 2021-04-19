import React from 'react';
import { Button, Form, FormGroup, FormText, Input, Label } from 'reactstrap';
import { RoomNumberTypes, BuildingBasicInfo, BuildingBasicInfoWithFloorInfo, BuildingInfo } from '../types/map';
import { MessageModalProps } from '../components/MessageModal';

export interface AddNewBuildingWindow {
    latLng: google.maps.LatLng
}

export const getNewBuildingBasicInfoWithFloorInfoModalProp = (
    newBuildingBasicInfoWithFloorInfo: BuildingBasicInfoWithFloorInfo,
    maxNumberOfRooms: number,
    setNewBuildingBasicInfoWithFloorInfo: (value: React.SetStateAction<BuildingBasicInfoWithFloorInfo>) => void,
    setAddNewBuildingWindow: (value: React.SetStateAction<AddNewBuildingWindow>) => void,
    setMessageModalProps: (value: React.SetStateAction<MessageModalProps>) => void,
    setNewBuildingInfo: (value: React.SetStateAction<BuildingInfo>) => void
): MessageModalProps => {
    const numberOfRoomsOptions = new Array<number>();
    for (let i = 0; i <= maxNumberOfRooms; i++) {
        numberOfRoomsOptions.push(i);
    }
    const toggle = () => {
        setNewBuildingBasicInfoWithFloorInfo(undefined);
        setAddNewBuildingWindow(undefined);
        setMessageModalProps(undefined);
    };
    const onClickNextButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setMessageModalProps(undefined);
        const floorNumberRoomNumbersMap = new Map<number, Array<string>>();
        Array.from(newBuildingBasicInfoWithFloorInfo.floorNumberNumberOfRoomsMap.entries())
            .map(([floorNumber, numberOfRooms]) => {
                const roomNumbers = new Array<string>();
                for (let i = 1; i <= numberOfRooms; i++) {
                    if (
                        (newBuildingBasicInfoWithFloorInfo.roomNumberType === RoomNumberTypes.Except4 && i === 4)
                        ||
                        (newBuildingBasicInfoWithFloorInfo.roomNumberType === RoomNumberTypes.Except4And9 && (i === 4 || i === 9))
                    ) {
                        continue;
                    }
                    roomNumbers.push(`${floorNumber}${i.toString().padStart(2, '0')}`);
                }
            });
        setNewBuildingInfo({
            ...newBuildingBasicInfoWithFloorInfo,
            floorNumberRoomNumbersMap: floorNumberRoomNumbersMap
        });
        setNewBuildingBasicInfoWithFloorInfo(undefined);
    };
    return {
        modalHeaderProps: {
            toggle: toggle,
        },
        modalHeaderContents: '集合住宅追加（フロア情報）',
        modalProps: {
            isOpen: true,
            toggle: toggle,
        },
        children: <React.Fragment>
            <div>フロアごとの部屋数を入力してください。4抜きで105まである場合は、「5」と入力してください。4、9抜きで110まである場合も「10」と入力してください。</div>
            <Form className="mt-3">
                {
                    Array.from(newBuildingBasicInfoWithFloorInfo.floorNumberNumberOfRoomsMap.entries())
                        .map(([floorNumber]) => {
                            const onChangeNumberOfRooms = (e: React.ChangeEvent<HTMLInputElement>) => {
                                const newNewBuildingBasicInfoWithFloorInfo = { ...newBuildingBasicInfoWithFloorInfo };
                                newNewBuildingBasicInfoWithFloorInfo.floorNumberNumberOfRoomsMap
                                    .set(floorNumber, Number(e.target.value));
                                setNewBuildingBasicInfoWithFloorInfo(newNewBuildingBasicInfoWithFloorInfo);
                            };
                            return <FormGroup>
                                <Label id={'numberOfRoomsLaebl' + floorNumber}>{floorNumber}階</Label>
                                <Input
                                    id={'numberOfRooms' + floorNumber}
                                    type="select"
                                    onChange={onChangeNumberOfRooms}
                                >
                                    {
                                        numberOfRoomsOptions.map(x => <option value={x}>{x}</option>)
                                    }
                                </Input>
                            </FormGroup>
                        })
                }
            </Form>
        </React.Fragment>,
        modalFooterContents: <React.Fragment>
            <Button onClick={toggle}>キャンセル</Button>
            <Button onClick={onClickNextButton}>次へ</Button>
        </React.Fragment>
    };
}

export const getNewBuildingBasicInfoModalProp = (
    newBuildingBasicInfo: BuildingBasicInfo,
    maxFloorNumbers: number,
    setNewBuildingBasicInfo: (value: React.SetStateAction<BuildingBasicInfo>) => void,
    setAddNewBuildingWindow: (value: React.SetStateAction<AddNewBuildingWindow>) => void,
    setMessageModalProps: (value: React.SetStateAction<MessageModalProps>) => void,
    setNewBuildingBasicInfoWithFloorInfo: (value: React.SetStateAction<BuildingBasicInfoWithFloorInfo>) => void
): MessageModalProps => {
    const toggle = () => {
        setNewBuildingBasicInfo(undefined);
        setAddNewBuildingWindow(undefined);
        setMessageModalProps(undefined);
    };
    const onClickNextButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setMessageModalProps(undefined);
        const floorNumberNumberOfRoomsMap = new Map<number, number>();
        for (let i = 1; i <= newBuildingBasicInfo.numberOfFloors; i++) {
            floorNumberNumberOfRoomsMap.set(i, 0);
        }
        setNewBuildingBasicInfoWithFloorInfo({
            ...newBuildingBasicInfo,
            floorNumberNumberOfRoomsMap: floorNumberNumberOfRoomsMap
        });
        setNewBuildingBasicInfo(undefined);
    };
    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNewBuildingInfo = { ...newBuildingBasicInfo };
        newNewBuildingInfo.name = e.target.value;
        setNewBuildingBasicInfo(newNewBuildingInfo);
    };
    const onChangeNumberOfFloors = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNewBuildingInfo = { ...newBuildingBasicInfo };
        newNewBuildingInfo.numberOfFloors = Number(e.target.value);
        setNewBuildingBasicInfo(newNewBuildingInfo);
    };
    const onChangeRoomNumberType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNewBuildingInfo = { ...newBuildingBasicInfo };
        newNewBuildingInfo.roomNumberType = RoomNumberTypes[e.target.value];
        setNewBuildingBasicInfo(newNewBuildingInfo);
    };
    const floorNumberOptions = new Array<number>();
    for (let i = 1; i <= maxFloorNumbers; i++) {
        floorNumberOptions.push(i);
    }
    return {
        modalHeaderProps: {
            toggle: toggle,
        },
        modalHeaderContents: '集合住宅追加（基本情報）',
        modalProps: {
            isOpen: true,
            toggle: toggle,
        },
        children: <Form>
            <FormGroup>
                <Label id="buildingNameLabel" for="buildingName">名前</Label>
                <Input
                    type="text"
                    id="buildingName"
                    onChange={onChangeName}
                />
                <FormText>集合住宅の名前を入力してください。</FormText>
            </FormGroup>
            <FormGroup>
                <Label id="numbeOfFloorsLabel" for="numberOfFloors">階数</Label>
                <Input
                    type="select"
                    id="numberOfFloors"
                    onChange={onChangeNumberOfFloors}
                >
                    {
                        floorNumberOptions.map(x => <option value={x}>{x}</option>)
                    }
                </Input>
                <FormText>集合住宅の階数を選択してください。</FormText>
            </FormGroup>
            <FormGroup tag="fieldset">
                <Label id="roomNumberTypeLabel" for="roomNumberType">部屋番号タイプ</Label>
                <Input
                    type="select"
                    onChange={onChangeRoomNumberType}
                >
                    <option value={RoomNumberTypes.SerialNumber}>連番</option>
                    <option value={RoomNumberTypes.Except4}>4抜き</option>
                    <option value={RoomNumberTypes.Except4And9}>4、9抜き</option>
                    <option value={RoomNumberTypes.Other}>その他</option>
                </Input>
                <FormText>おおよその部屋番号タイプを入力してください。後から部屋番号は調整できます。</FormText>
            </FormGroup>
        </Form>,
        modalFooterContents: <React.Fragment>
            <Button onClick={toggle}>キャンセル</Button>
            <Button onClick={onClickNextButton}>次へ</Button>
        </React.Fragment>
    };
};