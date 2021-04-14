import React, { useState, MouseEvent, useEffect } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import '../../components/InitializeFirebase';
import AdminApp from '../../components/AdminApp';
import { Button, Form, FormGroup, Label, Input, FormText, FormFeedback } from 'reactstrap';
import { setCookie } from 'nookies';
import { Router } from 'express';
import MapApp from '../../components/MapApp';

const db = firebase.firestore();
const auth = firebase.auth();

export default function AddBorder() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const onLoadMap = () => {
        setLoading(false);
    };

    return (
        <MapApp loading={loading} onLoadMap={onLoadMap} />
    );
}