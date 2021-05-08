import { useState, useEffect } from 'react';
import firebase from 'firebase';
import '../../utils/InitializeFirebase';
import App from '../../components/App';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import FlashMessage, { Props as FlashMessageProps } from '../../components/FlashMessage';
import { Colors } from '../../types/bootstrap';
import { useRouter } from 'next/router';

const auth = firebase.auth();

export default function Login() {
    const [loading, setLoading] = useState(true);
    const [flashMessageProps, setFlashMessageProps] = useState(undefined as FlashMessageProps | undefined);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <App
            authUser={undefined}
            user={undefined}
            title={'ログイン'}
            loading={loading}
            pageRole={undefined}
        >
            <Container>
                <Row xs="1" md="3">
                    <Col className="d-none d-md-block" />
                    <Col>
                        {
                            flashMessageProps
                            &&
                            <FlashMessage {...flashMessageProps} />
                        }
                        <h4 className="mb-3 mt-3">ログイン</h4>
                        <Form>
                            <FormGroup>
                                <Label for="email">メールアドレス</Label>
                                <Input type="email" name="email" onChange={(e) => { setEmail(e.target.value); }} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">パスワード</Label>
                                <Input type="password" name="password" onChange={(e) => { setPassword(e.target.value); }} />
                            </FormGroup>
                            <Button
                                onClick={async (e) => {
                                    try {
                                        setLoading(true);
                                        await auth.signInWithEmailAndPassword(email, password);
                                    } catch (error) {
                                        let message = '';
                                        switch (error.code) {
                                            case 'auth/user-not-found':
                                                message = 'メールアドレスが登録されていません。';
                                                break;
                                            case 'auth/wrong-password':
                                                message = 'パスワードが間違っています。';
                                                break;
                                            case 'auth/invalid-email':
                                                message = '不正なメールアドレスです。';
                                                break;
                                            default:
                                                message = '不明なエラーです。';
                                                break;
                                        }
                                        setFlashMessageProps({
                                            color: Colors.Danger,
                                            message: message,
                                            close: () => { setFlashMessageProps(undefined); }
                                        });
                                        setLoading(false);
                                        return;
                                    }
                                    router.push('/maps');
                                }}
                            >ログイン</Button>
                        </Form>
                    </Col>
                    <Col className="d-none d-md-block" />
                </Row>
            </Container>
        </App>
    );
}

