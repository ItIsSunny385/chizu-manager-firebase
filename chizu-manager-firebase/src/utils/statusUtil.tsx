import firebase from 'firebase';
import { Status } from '../types/model';

export function getStatusMap(
    db: firebase.firestore.Firestore,
    collectionName: string,
    setStatusMap: (value: React.SetStateAction<Map<string, Status>>) => void,
) {
    db.collection(collectionName).orderBy('number', 'asc').get().then((snapshot) => {
        setStatusMap(getStatusMapFromQuerySnapshot(snapshot));
    });
};

export function getStatusMapFromQuerySnapshot(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>): Map<string, Status> {
    return new Map<string, Status>(snapshot.docs.map((x) => [x.id, {
        name: x.data().name,
        number: x.data().number,
        pin: x.data().pin,
        label: x.data().label,
        statusAfterResetingRef: x.data().statusAfterResetingRef,
    }]));
}