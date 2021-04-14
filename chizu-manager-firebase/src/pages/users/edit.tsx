import { MouseEvent, useEffect, useState } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import { Button, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import AdminApp from '../../components/AdminApp';
import { setCookie } from 'nookies';
import '../../components/InitializeFirebase';

const db = firebase.firestore();

const Role = {
    GeneralUser: 'GeneralUser',
    Edotor: 'Editor',
    Administrator: 'Administrator',
};

interface Props {
    query: any
}

export default function Edit(props: Props) {
    const router = useRouter();
    const [alertType, setAlertType] = useState(undefined);
    const [alertMessage, setAlertMessage] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [id] = useState(props.query.id);
    const [displayName, setDisplayName] = useState('');
    const [displayError1, setDisplayError1] = useState(false);
    const [role, setRole] = useState(Role.GeneralUser);

    const onChangeDisplayName = ((e) => {
        setDisplayName(e.target.value);
    });

    const onChangeRole = ((e) => {
        setRole(e.target.value);
    });

    const onClickBackButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users');
    });

    const onClickDeleteButton = (async (e: MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        const batch = db.batch();
        const userRef = db.collection('users').doc(id);
        batch.update(userRef, { deleted: true });
        const deleteAuthUserRef = db.collection('delete_auth_users').doc(id);
        batch.set(deleteAuthUserRef, { uid: id });
        try {
            await batch.commit();
            setCookie(null, 'alertType', 'success', { path: '/' });
            setCookie(null, 'alertMessage', 'ユーザを削除しました。', { path: '/' });
            router.push('/users');
            return;
        } catch (error) {
            console.log(error);
            setAlertType('danger');
            setAlertType('削除に失敗しました。');
            setLoading(false);
            return;
        }
    });

    const onClickRegisterButton = (async (e: MouseEvent) => {
        e.preventDefault();

        /* Spinnerを表示 */
        setLoading(true);

        /* 各入力値がエラーかどうかを判別 */
        const newDisplayError1 = !(0 < displayName.length && displayName.length <= 32);
        setDisplayError1(newDisplayError1);

        /* エラーがある場合は該当箇所が見えるようにし、そうでない場合はデータをサーバに送る */
        if (newDisplayError1) {
            setLoading(false);
            router.push('#displayNameLabel');
            return;
        }

        /* データをアップデートする */
        try {
            await db.collection('users').doc(id).update({
                displayName: displayName,
                role: role,
            });
            setCookie(null, 'alertType', 'success', { path: '/' });
            setCookie(null, 'alertMessage', 'ユーザ情報を更新しました。', { path: '/' });
            router.push('/users');
            return;
        } catch (error) {
            console.log(error);
            setAlertType('danger');
            setAlertMessage('ユーザ情報更新に失敗しました。管理者にお問い合わせください。');
            setLoading(false);
            router.push('#alert');
            return;
        }
    });

    useEffect(() => {
        if (!id) {
            setCookie(null, 'alertType', 'danger', { path: '/' });
            setCookie(null, 'alertMessage', 'IDを指定してください。', { path: '/' });
            router.push('/users');
            return;
        }
        /* id値が設定されたらユーザ情報を表示 */
        const f = async () => {
            const user = await db.collection('users').doc(id).get();
            if (!user.exists) {
                setCookie(null, 'alertType', 'danger', { path: '/' });
                setCookie(null, 'alertMessage', '該当するユーザが存在しません。', { path: '/' });
                router.push('/users');
                return;
            }
            setDisplayName(user.data().displayName);
            setRole(user.data().role);
            setLoading(false);
        }
        f();
    }, []);

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ編集"
            alertType={alertType}
            alertMessage={alertMessage}
            loading={loading}
            setAlertType={setAlertType}
            setAlertMessage={setAlertMessage}
        >
            <Form>
                <FormGroup>
                    <Label id="idLabel" for="id">ID</Label>
                    <Input
                        type="text"
                        name="id"
                        value={id}
                        disabled={true}
                    />
                </FormGroup>
                <FormGroup>
                    <Label id="displayNameLabel" for="displayName">表示名</Label>
                    <Input
                        type="text"
                        name="displayName"
                        className={displayError1 ? 'is-invalid' : ''}
                        onChange={onChangeDisplayName}
                        value={displayName}
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
                    <Input type="select" name="role" onChange={onChangeRole} value={role}>
                        <option value="GeneralUser">一般ユーザ</option>
                        <option value="Editor">編集者</option>
                        <option value="Administrator">管理者</option>
                    </Input>
                </FormGroup>
                <div className="text-left mb-2">
                    <Button onClick={onClickBackButton}>戻る</Button>
                    <Button onClick={onClickDeleteButton} className="ml-1">削除</Button>
                    <Button onClick={onClickRegisterButton} className="ml-1">更新</Button>
                </div>
            </Form>
        </AdminApp>
    );
}

export async function getServerSideProps(ctx) {
    return {
        props: {
            query: ctx.query
        }
    };
}