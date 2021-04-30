import { useState, MouseEvent, useEffect } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../utils/InitializeFirebase';
import AdminApp from '../../components/AdminApp';
import { MapStatus, MapBasicInfo } from '../../types/map';
import { Button, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import { setCookie } from 'nookies';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Add() {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [mapsSize, setMapsSize] = useState(0);
    const [orderNumber, setNumber] = useState(1);
    const [status, setStatus] = useState(MapStatus.Private);
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

    const onChangeStatus = ((e) => {
        e.preventDefault();
        setStatus(e.target.value);
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
        const mapBasicInfo: MapBasicInfo = {
            name: name,
            orderNumber: orderNumber,
            status: status,
        };
        setCookie(null, 'mapBasicInfo', JSON.stringify(mapBasicInfo), { path: '/' });
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
            loading={loading}
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
                    <Label id="statusLabel" for="statis">公開／非公開</Label>
                    <Input
                        type="select"
                        name="status"
                        value={status}
                        onChange={onChangeStatus}
                    >
                        <option value={MapStatus.Private}>非公開</option>
                        <option value={MapStatus.Viewable}>全員閲覧可</option>
                        <option value={MapStatus.Editable}>全員編集可</option>
                    </Input>
                    <FormText>非公開にした場合は閲覧・編集可能ユーザを個別に設定できます。全員閲覧可に設定した場合も、編集可能にするユーザを個別に設定できます。どれを選択しても管理者は編集できます。</FormText>
                </FormGroup>
                <div className="text-left mb-2">
                    <Button onClick={onClickBackButton}>戻る</Button>
                    <Button onClick={onClickNextButton} className="ml-1">次へ</Button>
                </div>
            </Form>
        </AdminApp>
    );
}