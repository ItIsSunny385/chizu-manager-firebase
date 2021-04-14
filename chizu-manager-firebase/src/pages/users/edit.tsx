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

export default function Edit() {
    const router = useRouter();
    const [alertType, setAlertType] = useState(undefined);
    const [alertMessage, setAlertMessage] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [id, setId] = useState('');
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

    const onClickRegisterButton = ((e: MouseEvent) => {
        e.preventDefault();
    });

    useEffect(() => {
        /* URLがきちんと取得できたらid値を設定 */
        if (router.asPath !== router.route) {
            setId(String(router.query.id));
        }
    }, [router]);

    useEffect(() => {
        /* id値が設定されたらユーザ情報を表示 */
        const f = async () => {
            const user = await db.collection('users').doc(id).get();
            if (!user.exists) {
                setCookie(null, 'alertType', 'danger', { path: '/' });
                setCookie(null, 'alertMessage', '該当するユーザが存在しません。', { path: '/' })
                router.push('/users');
                return;
            }
            setDisplayName(user.data().displayName);
            setRole(user.data().role);
            setLoading(false);
        }
        f();
    }, [id]);

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
                    <Button onClick={onClickBackButton} className="ml-auto">戻る</Button>
                    <Button onClick={onClickRegisterButton} className="ml-1">更新</Button>
                </div>
            </Form>
        </AdminApp>
    );
}