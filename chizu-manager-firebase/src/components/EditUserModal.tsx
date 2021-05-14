import '../utils/InitializeFirebase';
import { Fragment, useState } from "react";
import firebase from 'firebase';
import { Button, Form, FormFeedback, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";
import { User } from '../types/model';
import MessageModal from "./MessageModal";
import { Colors } from "../types/bootstrap";
import { cloneUser } from "../utils/userUtil";
import { useRouter } from 'next/router';
import { Person } from 'react-bootstrap-icons';

export interface Props {
    authUser: firebase.User;
    id: string;
    userMap: Map<string, User>;
    setLoading: (loading: boolean) => void;
    update: (removeMapUserFlg: boolean, newData: User) => Promise<void>;
    setFlashMessage: (color: Colors, message: any) => void;
    toggle: () => void;
}

const db = firebase.firestore();
const auth = firebase.auth();

export default function EditUserModal(props: Props) {
    const [data, setData] = useState(cloneUser(props.userMap.get(props.id)!));
    const [displayNameError, setDisplayNameError] = useState(undefined as string | undefined);
    const router = useRouter();

    const onClickSaveButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        props.setLoading(true);

        // 変更点がない場合はそのまま閉じる
        const originalData = props.userMap.get(props.id);
        if (JSON.stringify(originalData) === JSON.stringify(data)) {
            props.toggle();
            return;
        }

        // 変更点がある場合はエラーがあるか調べる
        let newDisplayNameError = undefined;
        if (data.displayName.length === 0) {
            newDisplayNameError = '表示名を入力してください。';
        } else if (data.displayName.length > 16) {
            newDisplayNameError = '表示名が長すぎます。'
        } else if (Array.from(props.userMap.entries())
            .some(([id, x]) => x.displayName === data.displayName && id !== props.id)) {
            newDisplayNameError = 'この表示名は既に使われています。';
        }
        setDisplayNameError(newDisplayNameError);

        // エラーがある場合は、モーダルは閉じない
        if (newDisplayNameError) {
            props.setLoading(false);
            return;
        }

        // エラーがなければデータを保存する
        try {
            const signOut = props.id === props.authUser.uid && !data.isAdmin;
            await props.update(!props.userMap.get(props.id)!.isAdmin && data.isAdmin, data);

            // ログインユーザを一般ユーザに変更した場合はログアウト
            if (signOut) {
                auth.signOut();
                router.push('/users/login');
            }
            props.setFlashMessage(Colors.Success, 'ユーザを更新しました。');
        } catch (error) {
            console.log(error);
            props.setFlashMessage(Colors.Danger, 'ユーザの更新に失敗しました。');
        }
        props.toggle();
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <Person className="mb-1 mr-2" />ユーザ編集
        </Fragment>,
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
                <Label id="idLabel" for="id">ID</Label>
                <Input
                    type="text"
                    name="id"
                    value={props.id}
                    disabled={true}
                />
            </FormGroup>
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
        </Form>
    </MessageModal>;
}