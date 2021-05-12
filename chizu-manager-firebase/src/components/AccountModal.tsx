import firebase from 'firebase';
import { Fragment, useState } from "react";
import MessageModal from "./MessageModal";
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label } from "reactstrap";
import { User } from '../types/model';
import { Key, PersonCircle } from 'react-bootstrap-icons';
import FlashMessage, { Props as FlashMessageProps } from "./FlashMessage";
import { Colors } from '../types/bootstrap';

interface Props {
    authUser: firebase.User;
    user: User;
    toggle: () => void;
}

export default function AccountModal(props: Props) {
    const [password1, setPassword1] = useState('');
    const [password1Error, setPassword1Error] = useState(undefined as string | undefined);
    const [password2, setPassword2] = useState('');
    const [password2Error, setPassword2Error] = useState(undefined as string | undefined);
    const [flashMessageProps, setFlashMessageProps] = useState(undefined as FlashMessageProps | undefined);

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <PersonCircle className="mb-1 mr-2" />アカウント
        </Fragment>,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>閉じる</Button>
        </Fragment >
    };

    return <MessageModal {...messageModalProps}>
        <div className="mb-5">
            <h4 className="mb-3"><PersonCircle className="mb-1 mr-2" />アカウント</h4>
            <Form>
                <FormGroup>
                    <Label>メールアドレス</Label>
                    <Input type="text" disabled={true} value={props.authUser.email!} />
                    <FormText>メールアドレスは変更できません。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label>表示名</Label>
                    <Input type="text" disabled={true} value={props.user.displayName} />
                    <FormText>表示名の変更は管理者にお問い合わせください。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label>権限</Label>
                    <Input type="text" disabled={true} value={props.user.isAdmin ? '管理者' : '一般ユーザ'} />
                    <FormText>権限の変更は管理者にお問い合わせください。</FormText>
                </FormGroup>
            </Form>
        </div>
        <div>
            <h4 className="mb-3"><Key className="mb-1 mr-2" />パスワード変更</h4>
            {
                flashMessageProps
                &&
                <FlashMessage {...flashMessageProps} />
            }
            <Form>
                <FormGroup>
                    <Label>新しいパスワード</Label>
                    <Input
                        id="newPassword1"
                        type="password"
                        className={password1Error ? 'is-invalid' : ''}
                        onChange={(e) => { setPassword1(e.target.value); }}
                    />
                    {
                        password1Error
                        &&
                        <FormFeedback>{password1Error}</FormFeedback>
                    }
                    <FormText>パスワードは8～32文字の半角英数字にしてください。英字と数字の両方が必要です。</FormText>
                </FormGroup>
                <FormGroup>
                    <Label>新しいパスワード（確認用）</Label>
                    <Input
                        id="newPassword2"
                        type="password"
                        className={password2Error ? 'is-invalid' : ''}
                        onChange={(e) => { setPassword2(e.target.value); }}
                    />
                    {
                        password2Error
                        &&
                        <FormFeedback>{password2Error}</FormFeedback>
                    }
                    <FormText>一つ目の新しいパスワードと同じものを入力してください。</FormText>
                </FormGroup>
                <Button onClick={async (e) => {
                    let newPassword1Error = undefined;
                    if (password1.length < 8) {
                        newPassword1Error = 'パスワードが短すぎます。';
                    } else if (password1.length > 32) {
                        newPassword1Error = 'パスワードが長すぎます。';
                    } else if (!(/^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,32}$/i).test(password1)) {
                        newPassword1Error = '英字と数字の両方が必要です。';
                    }
                    setPassword1Error(newPassword1Error);

                    let newPassword2Error = undefined;
                    if (password1 !== password2) {
                        newPassword2Error = 'パスワードが異なります';
                    }
                    setPassword2Error(newPassword2Error);

                    if (newPassword1Error || newPassword2Error) {
                        return;
                    }

                    await props.authUser.updatePassword(password1);
                    const newPassword1Input = document.getElementById('newPassword1');
                    if (newPassword1Input) {
                        (newPassword1Input as HTMLInputElement).value = '';
                    }
                    const newPassword2Input = document.getElementById('newPassword2');
                    if (newPassword2Input) {
                        (newPassword2Input as HTMLInputElement).value = '';
                    }
                    setFlashMessageProps({
                        color: Colors.Success,
                        message: 'パスワードを変更しました。',
                        className: 'mt-0',
                        close: () => { setFlashMessageProps(undefined); }
                    });
                }}>パスワード変更</Button>
            </Form>
        </div>
    </MessageModal>;
}