import { useState, useEffect } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../components/InitializeFirebase';
import App from '../../components/App';
import NavTabs from '../../components/NavTabs';
import { Button, Container, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';

const auth = firebase.auth();

const Role = {
    GeneralUser: 'GeneralUser',
    Edotor: 'Editor',
    Administrator: 'Administrator',
};

export default function Add() {
    const [displayName, setDisplayName] = useState('');
    const [displayError1, setDisplayError1] = useState(false);
    const [role, setRole] = useState(Role.GeneralUser);
    const [email, setEmail] = useState('');
    const [displayError2, setDisplayError2] = useState(false);
    const [password, setPassword] = useState('');
    const [displayError3, setDisplayError3] = useState(false);

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
    })
    const onClickRegisterButton = ((e) => {
        setDisplayError1(!(0 < displayName.length && displayName.length <= 32));
        const regEmail = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;
        setDisplayError2(!(regEmail.test(email) && email.length <= 256));
        const regPassword = /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,32}$/i;
        setDisplayError3(!regPassword.test(password));
    });

    return (
        <App>
            <Container>
                <NavTabs activeTabId={2} />
                <h4 className="mb-3 mt-3">ユーザ登録</h4>
                <Form>
                    <FormGroup>
                        <Label for="displayName">表示名</Label>
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
                        <Label for="role">権限</Label>
                        <Input type="select" name="role" onChange={onChangeRole}>
                            <option value="GeneralUser">一般ユーザ</option>
                            <option value="Editor">編集者</option>
                            <option value="Administrator">管理者</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">メールアドレス</Label>
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
                        <Label for="password">パスワード</Label>
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
                    <Button onClick={onClickRegisterButton}>登録</Button>
                </Form>
            </Container>
        </App>
    );
}