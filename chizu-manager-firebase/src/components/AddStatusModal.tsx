import { Fragment, useState } from "react";
import firebase from 'firebase';
import { Button, Form, FormGroup, FormText, Input, Label } from "reactstrap";
import MessageModal from "./MessageModal";
import { Status, Pins } from '../types/model';

export interface Props {
    statusMap: Map<string, Status>,
    toggle: () => void
}

const db = firebase.firestore();

export default function AddStatusModal(props: Props) {
    const [data, setData] = useState({
        name: '',
        number: props.statusMap.size + 1,
        pin: Pins.yellow,
        label: '',
        statusAfterResetingRef: null
    } as Status);

    const onClickSaveButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const batch = firebase.firestore().batch();
        Array.from(props.statusMap.entries()).forEach(([id, status]) => {
            if (status.number >= data.number) {
                batch.update(db.collection('statuses').doc(id), {
                    number: firebase.firestore.FieldValue.increment(1)
                });
            }
        });
        await batch.commit();
        await db.collection('statuses').add(data);
        props.toggle();
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: '家・部屋用ステータス追加',
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
                        Array.from({ length: props.statusMap.size + 1 }, (v, i) => i + 1)
                            .map(x => <option value={x}>{x}</option>)
                    }
                </Input>
                <FormText>表示順として使用されます。1を選んだ場合は、家などを追加した時のデフォルトステータスとなります。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="pin">ピン</Label>
                <Input id="pin" type="select"
                    defaultValue={data.pin}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.pin = e.target.value;
                        setData(newData);
                    }}
                >
                    {
                        Object.keys(Pins).map(x => <option value={Pins[x]}>{Pins[x]}</option>)
                    }
                </Input>
                <FormText>ピンの種類を入力してください。</FormText>
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
                <FormText>4文字以内で入力してください。</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="statusAfterReseting">リセット後ステータス</Label>
                <Input id="statusAfterReseting" type="select"
                    defaultValue={data.pin}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.statusAfterResetingRef = e.target.value ?
                            db.collection('statuses').doc(e.target.value)
                            :
                            null;
                        setData(newData);
                    }}
                >
                    <option value=''></option>
                    {
                        Array.from(props.statusMap).map(([id, x]) => <option value={id}>{x.name}</option>)
                    }
                </Input>
            </FormGroup>
        </Form>
    </MessageModal>;
}