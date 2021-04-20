import React, {
    useState,
    useEffect
} from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import MessageModal from './MessageModal';

export interface FloorInfoA {
    floorNumber: number,
    maxRoomNumber: number
}

export interface Props {
    numberOfFloors: number,
    toggle: () => void,
    next: (result: FloorInfoA[]) => void,
}

const MAX_ROOM_NUMBER = 30;

export default function BuildingFloorInfoModal(props: Props) {
    const defaultFloorInfoArray = Array.from(
        { length: props.numberOfFloors },
        (v, i) => ({ floorNumber: i + 1, maxRoomNumber: 1 } as FloorInfoA)
    );
    const [floorInfoArray, setFloorInfoArray] = useState(defaultFloorInfoArray);

    const onClickNextButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        props.next(floorInfoArray);
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: '集合住宅追加（フロア情報）',
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <React.Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button onClick={onClickNextButton}>次へ</Button>
        </React.Fragment>
    };

    return <MessageModal {...messageModalProps}>
        <div>
            フロアごとの部屋数を入力してください。
            4抜きで105まである場合は、「5」と入力してください。
            4、9抜きで110まである場合も「10」と入力してください。
        </div>
        <Form className="mt-3">
            {
                floorInfoArray.map((x, i) => {
                    const onChangeNumberOfRooms = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const newFloorInfoArray = [...floorInfoArray];
                        newFloorInfoArray[i].maxRoomNumber = Number(e.target.value);
                        setFloorInfoArray(newFloorInfoArray);
                    };
                    return <FormGroup>
                        <Label id={'numberOfRoomsLaebl' + x.floorNumber}>{x.floorNumber}階</Label>
                        <Input
                            id={'numberOfRooms' + x.floorNumber}
                            type="select"
                            onChange={onChangeNumberOfRooms}
                        >
                            {
                                Array.from({ length: MAX_ROOM_NUMBER }, (v, j) => j + 1)
                                    .map(x => <option value={x}>{x}</option>)
                            }
                        </Input>
                    </FormGroup>;
                })
            }
        </Form>
    </MessageModal>;
}