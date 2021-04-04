import { useState, useEffect } from 'react';
import firebase from 'firebase';
import '../../components/InitializeFirebase';

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
        <h5>{message}</h5>
    );
}

