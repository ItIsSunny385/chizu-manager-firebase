import firebase from 'firebase';
import { Status } from '../types/model';

export async function getStatusMap(db: firebase.firestore.Firestore) {
    const statusesSnap = await db.collection('statuses').orderBy('number', 'asc').get();
    return new Map<string, Status>(statusesSnap.docs.map((x) => [x.id, {
        name: x.data().name,
        number: x.data().number,
        pin: x.data().pin,
        label: x.data().label,
        statusAfterResetingRef: x.data().statusAfterResetingRef,
    }]));
};

export async function getBuildingStatusMap(db: firebase.firestore.Firestore) {
    const statusesSnap = await db.collection('building_statuses').orderBy('number', 'asc').get();
    return new Map<string, Status>(statusesSnap.docs.map((x) => [x.id, {
        name: x.data().name,
        number: x.data().number,
        pin: x.data().pin,
        label: x.data().label,
        statusAfterResetingRef: x.data().statusAfterResetingRef,
    }]));
};