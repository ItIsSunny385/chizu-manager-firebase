import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import { Fragment, useState } from "react";
import firebase from 'firebase';
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label } from "reactstrap";
import MessageModal from "./MessageModal";
import { Colors } from '../types/bootstrap';
import { User } from '../types/model';

interface Props {
    setLoading: (loading: boolean) => void,
    setFlashMessage: (color: Colors, message: any) => void,
    toggle: () => void
}

const db = firebase.firestore();
const auth = firebase.auth();

export default function AddUserModal(props: Props) {
    const [data, setData] = useState({
        displayName: '',
        isAdmin: false,
        deleted: false,
    } as User);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayNameError, setDisplayNameError] = useState(undefined as string);
    const [emailError, setEmailError] = useState(undefined as string);
    const [passwordError, setPasswordError] = useState(undefined as string);

    const onClickSaveButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        /* Spinnerを表示 */
        props.setLoading(true);

        /* 各種エラーメッセージの設定 */
        let newDisplayNameError = undefined;
        if (data.displayName.length === 0) {
            newDisplayNameError = '表示名を入力してください。';
        } else if (data.displayName.length > 16) {
            newDisplayNameError = '表示名が長すぎます。'
        }
        setDisplayNameError(newDisplayNameError);

        let newEmailError = undefined;
        if (email.length === 0) {
            newEmailError = 'メールアドレスを入力してください。';
        } else if (email.length > 64) {
            newEmailError = 'メールアドレスが長すぎます。';
        } else if (!/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/.test(email)) {
            newEmailError = '不正なメールアドレスです。';
        }
        setEmailError(newEmailError);

        let newPasswordError = undefined;
        if (password.length < 8) {
            newPasswordError = 'パスワードが短すぎます。';
        } else if (password.length > 32) {
            newPasswordError = 'パスワードが長すぎます。';
        } else if (!(/^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,32}$/i).test(password)) {
            newPasswordError = '英字と数字の両方が必要です。';
        }
        setPasswordError(newPasswordError);

        // エラーがある場合はデータ保存しない。
        if (newDisplayNameError || newEmailError || newPasswordError) {
            props.setLoading(false);
            return;
        }

        // ユーザ登録を実施
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            try {
                await db.collection('users').doc(userCredential.user.uid).set(data);
                props.setFlashMessage(Colors.Success, 'ユーザを登録しました。');
            } catch (error1) {
                console.log(error1);
                try {
                    await db.collection('delete_auth_users').add({
                        uid: userCredential.user.uid,
                    });
                } catch (error2) {
                    console.log(error2);
                }
                props.setFlashMessage(Colors.Danger, 'ユーザの登録に失敗しました。');
            }
            props.setLoading(false);
            props.toggle();
            return;
        } catch (error) {
            console.log(error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setEmailError('このメールアドレスは登録済みです。');
                    props.setLoading(false);
                    return;
                case 'auth/invalid-email':
                    setEmailError('このメールアドレスは不正です。');
                    props.setLoading(false);
                    return;
                case 'auth/operation-not-allowed':
                    props.setFlashMessage(Colors.Danger, 'この操作には対応していません。');
                    props.setLoading(false);
                    props.toggle();
                    return;
                case 'auth/weak-password':
                    setPasswordError('パスワードが弱すぎます。');
                    props.setLoading(false);
                    return;
                default:
                    props.setFlashMessage(Colors.Danger, '不明なエラーが発生しました。');
                    props.setLoading(false);
                    props.toggle();
                    return;
            }
        }
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: 'ユーザ追加',
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button onClick={onClickSaveButton}>保存</Button>
        </Fragment>
    };

    return (
        <MessageModal {...messageModalProps}>
            <Form>
                <FormGroup>
                    <Label id="displayNameLabel" for="displayName">表示名</Label>
                    <Input
                        type="text"
                        name="displayName"
                        className={displayNameError ? 'is-invalid' : ''}
                        onChange={(e) => {
                            const newData = { ...data };
                            newData.displayName = e.target.value;
                            setData(newData);
                        }}
                        defaultValue={data.displayName}
                    />
                    {
                        displayNameError
                        &&
                        <FormFeedback>{displayNameError}</FormFeedback>
                    }
                    <FormText>表示名は1～16文字で入力してください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="roleLabel" for="role">権限</Label>
                    <Input
                        type="select"
                        name="role"
                        onChange={(e) => {
                            const newData = { ...data };
                            newData.isAdmin = e.target.value === 'true';
                            setData(newData);
                        }}
                        defaultValue={data.isAdmin ? 'true' : 'false'}
                    >
                        <option value="false">一般ユーザ</option>
                        <option value="true">管理者</option>
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label id="emailLabel" for="email">メールアドレス</Label>
                    <Input
                        type="email"
                        name="email"
                        className={emailError ? 'is-invalid' : ''}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        defaultValue={email}
                    />
                    {
                        emailError
                        &&
                        <FormFeedback>{emailError}</FormFeedback>
                    }
                    <FormText>メールアドレスは64文字以内で入力してください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label id="passwordLabel" for="password">パスワード</Label>
                    <Input
                        type="password"
                        name="password"
                        className={passwordError ? 'is-invalid' : ''}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        defaultValue={password}
                    />
                    {
                        passwordError
                        &&
                        <FormFeedback>{passwordError}</FormFeedback>
                    }
                    <FormText>パスワードは8～32文字の半角英数字にしてください。英字と数字の両方が必要です。</FormText>
                </FormGroup>
            </Form>
        </MessageModal>
    );
}