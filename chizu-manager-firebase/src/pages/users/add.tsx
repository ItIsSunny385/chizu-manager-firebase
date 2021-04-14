import { useState, MouseEvent } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../components/InitializeFirebase';
import AdminApp from '../../components/AdminApp';
import { Button, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import { setCookie } from 'nookies';

const db = firebase.firestore();
const auth = firebase.auth();

const Role = {
    GeneralUser: 'GeneralUser',
    Edotor: 'Editor',
    Administrator: 'Administrator',
};

export default function Add() {
    const [loading, setLoading] = useState(false);
    const [alertType, setAlertType] = useState(undefined);
    const [alertMessage, setAlertMessage] = useState(undefined);
    const [displayName, setDisplayName] = useState('');
    const [displayError1, setDisplayError1] = useState(false);
    const [role, setRole] = useState(Role.GeneralUser);
    const [email, setEmail] = useState('');
    const [displayError2, setDisplayError2] = useState(false);
    const [password, setPassword] = useState('');
    const [displayError3, setDisplayError3] = useState(false);
    const router = useRouter();

    const onChangeDisplayName = ((e) => {
        setDisplayName(e.target.value);
    });

    const onChangeRole = ((e) => {
        setRole(e.target.value);
    });

    const onChangeEmail = ((e) => {
        setEmail(e.target.value);
    });

    const onChangePassword = ((e) => {
        setPassword(e.target.value);
    });

    const onClickRegisterButton = (async (e: MouseEvent) => {
        e.preventDefault();

        /* Spinnerを表示 */
        setLoading(true);

        /* 各入力値がエラーかどうかを判別 */
        const newDisplayError1 = !(0 < displayName.length && displayName.length <= 32);
        setDisplayError1(newDisplayError1);
        const regEmail = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;
        const newDisplayError2 = !(regEmail.test(email) && email.length <= 256);
        setDisplayError2(newDisplayError2);
        const regPassword = /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,32}$/i;
        const newDisplayError3 = !regPassword.test(password);
        setDisplayError3(newDisplayError3);

        /* エラーがある場合は該当箇所が見えるようにし、そうでない場合はデータをサーバに送る */
        if (newDisplayError1) {
            setLoading(false);
            router.push('#displayNameLabel');
            return;
        } else if (newDisplayError2) {
            setLoading(false);
            router.push('#emailLabel');
            return;
        } else if (newDisplayError3) {
            setLoading(false);
            router.push('#passwordLabel');
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            try {
                await db.collection('users').doc(userCredential.user.uid).set({
                    displayName: displayName,
                    role: role,
                    deleted: false,
                });
                setCookie(null, 'alertType', 'success', { path: '/' });
                setCookie(null, 'alertMessage', 'ユーザを登録しました。', { path: '/' });
                router.push('/users');
                return;
            } catch (error1) {
                console.log(error1);
                try {
                    await db.collection('delete_auth_users').add({
                        uid: userCredential.user.uid,
                    });
                } catch (error2) {
                    console.log(error2);
                }
                setAlertType('danger');
                setAlertMessage('ユーザ登録に失敗しました。管理者にお問い合わせください。');
            }
        } catch (error) {
            console.log(error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setAlertType('danger');
                    setAlertMessage('このメールアドレスは登録済みです。');
                    break;
                case 'auth/invalid-email':
                    setAlertType('danger');
                    setAlertMessage('このメールアドレスは不正です。');
                    break;
                case 'auth/operation-not-allowed':
                    setAlertType('danger');
                    setAlertMessage('この操作には対応していません。');
                    break;
                case 'auth/weak-password':
                    setAlertType('danger');
                    setAlertMessage('パスワードが弱すぎます。');
                    break;
                default:
                    setAlertType('danger');
                    setAlertMessage('不明なエラーが発生しました。');
                    break;
            }
        }
        setLoading(false);
        router.push('#alert');
        return;
    });

    const onClickBackButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users');
    });

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ登録"
            alertType={alertType}
            alertMessage={alertMessage}
            loading={loading}
            setAlertType={setAlertType}
            setAlertMessage={setAlertMessage}
        >
            <Form>
                <FormGroup>
                    <Label id="displayNameLabel" for="displayName">表示名</Label>
                    <Input
                        type="text"
                        name="displayName"
                        className={displayError1 ? 'is-invalid' : ''}
                        onChange={onChangeDisplayName}
                    />
                    {
                        displayError1
                        &&
                        <FormFeedback>正しい表示名を入力してください。</FormFeedback>
                    }
                    <FormText>表示名は1～32文字で入力してください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="roleLabel" for="role">権限</Label>
                    <Input type="select" name="role" onChange={onChangeRole}>
                        <option value="GeneralUser">一般ユーザ</option>
                        <option value="Editor">編集者</option>
                        <option value="Administrator">管理者</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label id="emailLabel" for="email">メールアドレス</Label>
                    <Input
                        type="email"
                        name="email"
                        className={displayError2 ? 'is-invalid' : ''}
                        onChange={onChangeEmail}
                    />
                    {
                        displayError2
                        &&
                        <FormFeedback>正しいメールアドレスを入力してください。</FormFeedback>
                    }
                    <FormText>メールアドレスは256文字以内で入力してください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="passwordLabel" for="password">パスワード</Label>
                    <Input
                        type="password"
                        name="password"
                        className={displayError3 ? 'is-invalid' : ''}
                        onChange={onChangePassword}
                    />
                    {
                        displayError3
                        &&
                        <div className="invalid-feedback">正しいパスワードを入力してください。</div>
                    }
                    <FormText>パスワードは8～32文字の半角英数字にしてください。英字と数字の両方が必要です。</FormText>
                </FormGroup>
                <div className="text-left mb-2">
                    <Button onClick={onClickBackButton}>戻る</Button>
                    <Button onClick={onClickRegisterButton} className="ml-1">登録</Button>
                </div>
            </Form>
        </AdminApp>
    );
}