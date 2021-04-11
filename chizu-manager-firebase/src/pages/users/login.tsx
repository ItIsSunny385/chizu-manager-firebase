import { useState, useEffect } from 'react';
import firebase from 'firebase';
import '../../components/InitializeFirebase';
import App from '../../components/App';

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export default function Login() {
    const [message, setMessage] = useState('wait...');
    useEffect(() => {
        auth.signInWithPopup(provider).then(result => {
            setMessage('logined!');
        });
    }, []);

    return (
        <App loading={false}>
            <h5>{message}</h5>
        </App>
    );
}

