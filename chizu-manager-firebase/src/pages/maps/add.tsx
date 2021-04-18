import { useState, MouseEvent, useEffect } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../components/InitializeFirebase';
import AdminApp from '../../components/AdminApp';
import { NewMapBasicInfo } from '../../types/map';
import { Button, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import { setCookie } from 'nookies';
import { Router } from 'express';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Add() {
    const [loading, setLoading] = useState(true);
    const [alertType, setAlertType] = useState(undefined);
    const [alertMessage, setAlertMessage] = useState(undefined);
    const [name, setName] = useState('');
    const [mapsSize, setMapsSize] = useState(0);
    const [orderNumber, setNumber] = useState(1);
    const [publicFlg, setPublicFlg] = useState(0);
    const [editableFlg, setEditableFlg] = useState(0);
    const [displayError1, setDisplayError1] = useState(false);
    const router = useRouter();

    const onChangeName = ((e) => {
        setName(e.target.value);
    });

    const onChangeNumber = ((e) => {
        e.preventDefault();
        const settedNumber = Number(e.target.value);
        const newNumber = 0 < settedNumber && settedNumber <= mapsSize + 1 ? settedNumber : mapsSize + 1;
        setNumber(newNumber);
    });

    const onChangePublicFlg = ((e) => {
        setPublicFlg(Number(e.target.value));
    });

    const onChangeEditableFlg = ((e) => {
        setEditableFlg(Number(e.target.value))
    });

    const onClickBackButton = ((e: MouseEvent) => {
        e.preventDefault();
    });

    const onClickNextButton = ((e: MouseEvent) => {
        e.preventDefault();

        /* Spinnerを表示 */
        setLoading(true);

        /* 各入力値がエラーかどうかを判別 */
        const newDisplayError1 = !(0 < name.length && name.length <= 32);
        setDisplayError1(newDisplayError1);
        if (newDisplayError1) {
            setLoading(false);
            return;
        }

        /* エラーがなかった場合はCookieにデータを登録し、次のページに遷移する */
        const newMapBasicInfo: NewMapBasicInfo = {
            name: name,
            orderNumber: orderNumber,
            publicFlg: Boolean(publicFlg),
            editableFlg: Boolean(editableFlg)
        };
        setCookie(null, 'newMapBasicInfo', JSON.stringify(newMapBasicInfo), { path: '/' });
        router.push('/maps/add_border');
        return;
    });

    useEffect(() => {
        db.collection('maps').get().then(snap => {
            const mapsSize = snap.size;
            setMapsSize(mapsSize);
            setNumber(mapsSize + 1);
        });
        setLoading(false);
    }, []);

    return (
        <AdminApp
            activeTabId={1}
            pageTitle="地図登録"
            alertType={alertType}
            alertMessage={alertMessage}
            loading={loading}
            setAlertType={setAlertType}
            setAlertMessage={setAlertMessage}
        >
            <Form>
                <FormGroup>
                    <Label id="nameLabel" for="name">名前</Label>
                    <Input
                        type="text"
                        name="name"
                        className={displayError1 ? 'is-invalid' : ''}
                        onChange={onChangeName}
                    />
                    {
                        displayError1
                        &&
                        <FormFeedback>正しい名前を入力してください。</FormFeedback>
                    }
                    <FormText>名前は1～32文字で入力してください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="numberLabel" for="number">番号</Label>
                    <Input
                        type="number"
                        name="number"
                        value={orderNumber}
                        onChange={onChangeNumber}
                    />
                    <FormText>1から{mapsSize + 1}までの地図の順番を入力してください。一覧などでの順番に利用されます。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="publicFlgLabel" for="publicFlg">公開／非公開</Label>
                    <Input
                        type="select"
                        name="publicFlg"
                        onChange={onChangePublicFlg}
                    >
                        <option value="0">非公開</option>
                        <option value="1">公開</option>
                    </Input>
                    <FormText>全ユーザに公開する場合は「公開」を選択してください。非公開にした場合は公開するユーザを個別に設定できます。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="editableFlgLabel" for="editableFlg">編集可</Label>
                    <Input
                        type="select"
                        name="editableFlg"
                        onChange={onChangeEditableFlg}
                    >
                        <option value="0">編集不可</option>
                        <option value="1">編集可</option>
                    </Input>
                    <FormText>編集者が編集可能かどうかを選択します。編集不可でも管理者は編集できます。</FormText>
                </FormGroup>
                <div className="text-left mb-2">
                    <Button onClick={onClickBackButton}>戻る</Button>
                    <Button onClick={onClickNextButton} className="ml-1">次へ</Button>
                </div>
            </Form>
        </AdminApp>
    );
}