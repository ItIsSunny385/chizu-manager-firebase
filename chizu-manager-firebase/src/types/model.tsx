import firebase from 'firebase';

export enum Pins {
    yellow = 'yellow',
    blue = 'blue',
    green = 'green',
    lightblue = 'lightblue',
    orange = 'orange',
    pink = 'pink',
    red = 'red',
}

export interface Status {
    name: string,
    number: number,
    pin: string,
    label: string,
    statusAfterResetingRef: firebase.firestore.DocumentReference | null,
}