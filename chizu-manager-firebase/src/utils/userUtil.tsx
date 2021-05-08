import firebase from 'firebase';
import React from 'react';
import { User } from '../types/model';

const db = firebase.firestore();

export function getUser(uid: string, setUser: (value: React.SetStateAction<User | undefined>) => void) {
    db.collection('users').doc(uid).get().then((x) => {
        const xData = x.data();
        if (!xData) {
            return;
        }
        const user: User = {
            displayName: xData.displayName,
            isAdmin: xData.isAdmin,
            deleted: xData.deleted,
        };
        setUser(user);
    });
}

export function cloneUser(data: User) {
    return JSON.parse(JSON.stringify(data)) as User;
}