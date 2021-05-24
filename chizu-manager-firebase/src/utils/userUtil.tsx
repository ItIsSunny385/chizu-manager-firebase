import firebase from 'firebase';
import React, { SetStateAction } from 'react';
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

export function listeningUserMap(
    query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    setUserMap: (newUserMap: SetStateAction<Map<string, User>>) => void
) {
    return query.onSnapshot((snapshot) => {
        const newUserMap = new Map<string, User>();
        snapshot.forEach((x) => {
            newUserMap.set(x.id, {
                displayName: x.data().displayName,
                isAdmin: x.data().isAdmin,
                deleted: x.data().deleted,
            });
        });
        setUserMap(newUserMap);
    });
}