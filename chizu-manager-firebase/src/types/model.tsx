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

export enum StatusType {
    HouseOrRoom = 'HouseOrRoom',
    Building = 'Building'
}

export const StatusCollectionName = {
    [StatusType.HouseOrRoom]: 'statuses',
    [StatusType.Building]: 'building_statuses',
}

export interface Status {
    name: string,
    number: number,
    pin: string,
    label: string,
    statusAfterResetingRef: firebase.firestore.DocumentReference | null,
}