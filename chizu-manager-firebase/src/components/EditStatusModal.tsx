import { Fragment, useState } from "react";
import firebase from 'firebase';
import { Button, Form, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";
import MessageModal from "./MessageModal";
import { Status, Pins, StatusType, StatusCollectionName } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';

export interface Props {
    type: StatusType,
    id: string,
    statusMap: Map<string, Status>,
    toggle: () => void
}

const db = firebase.firestore();

export default function AddStatusModal(props: Props) {
    const [data, setData] = useState(props.statusMap.get(props.id) as Status);

    const collectionName = StatusCollectionName[props.type];
    const title = props.type === StatusType.HouseOrRoom ? '家・部屋ステータス編集' : '集合住宅ステータス編集';


    const onClickSaveButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const originalData = props.statusMap.get(props.id);
        if (JSON.stringify(originalData) !== JSON.stringify(data)) {
            const batch = firebase.firestore().batch();
            if (originalData.number < data.number) {
                Array.from(props.statusMap.entries()).forEach(([id, status]) => {
                    if (originalData.number < status.number && status.number <= data.number) {
                        batch.update(db.collection(collectionName).doc(id), {
                            number: firebase.firestore.FieldValue.increment(-1)
                        });
                    }
                });
            } else if (data.number < originalData.number) {
                Array.from(props.statusMap.entries()).forEach(([id, status]) => {
                    if (data.number <= status.number && status.number < originalData.number) {
                        batch.update(db.collection(collectionName).doc(id), {
                            number: firebase.firestore.FieldValue.increment(1)
                        });
                    }
                });
            }
            batch.update(db.collection(collectionName).doc(props.id), data);
            await batch.commit();
        }
        props.toggle();
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: title,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button onClick={onClickSaveButton}>保存</Button>
        </Fragment>
    };

    return <MessageModal {...messageModalProps}>
        <Form>
            <FormGroup>
                <Label for="id">ID</Label>
                <Input id="id" type="text" defaultValue={props.id} disabled={true} />
            </FormGroup>
            <FormGroup>
                <Label for="name">名前</Label>
                <Input id="name" type="text"
                    defaultValue={data.name}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.name = e.target.value;
                        setData(newData);
                    }}
                />
                <FormText>8文字以内で入力してください。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="number">順番</Label>
                <Input id="number" type="select"
                    defaultValue={data.number}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.number = Number(e.target.value);
                        setData(newData);
                    }}
                >
                    {
                        Array.from({ length: props.statusMap.size }, (v, i) => i + 1)
                            .map(x => <option key={x} value={x}>{x}</option>)
                    }
                </Input>
                <FormText>表示順として使用されます。1を選んだ場合は、家などを追加した時のデフォルトステータスとなります。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="pin">ピン</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            <img src={getMarkerUrl(Pins[data.pin])} height="24px" />
                        </InputGroupText>
                    </InputGroupAddon>
                    <Input id="pin" type="select"
                        defaultValue={data.pin}
                        onChange={(e) => {
                            const newData = { ...data };
                            newData.pin = e.target.value;
                            setData(newData);
                        }}
                    >
                        {
                            Object.keys(Pins).map(x => <option key={Pins[x]} value={Pins[x]}>{Pins[x]}</option>)
                        }
                    </Input>
                </InputGroup>
                <FormText>ピンの種類を選択してください。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="label">ラベル</Label>
                <Input id="label" type="text"
                    defaultValue={data.label}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.label = e.target.value;
                        setData(newData);
                    }}
                />
                <FormText>4文字以内で入力してください。ピン上に表示されます。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="statusAfterReseting">リセット後ステータス</Label>
                <Input id="statusAfterReseting" type="select"
                    defaultValue={data.statusAfterResetingRef ? data.statusAfterResetingRef.id : ''}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.statusAfterResetingRef = e.target.value ?
                            db.collection(collectionName).doc(e.target.value)
                            :
                            null;
                        setData(newData);
                    }}
                >
                    <option value=''></option>
                    {
                        Array.from(props.statusMap).map(([id, x]) =>
                            id === props.id ? null : <option value={id}>{x.name}</option>
                        )
                    }
                </Input>
                <FormText>地図をリセットした時に、どのステータスに変更するか設定してください。</FormText>
            </FormGroup>
        </Form>
    </MessageModal>;
}