import firebase from 'firebase';
import { Building, House } from './map';

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

export interface User {
    displayName: string,
    isAdmin: boolean,
    deleted: boolean,
}

export interface Map {
    id?: string,
    orderNumber: number,
    name: string,
    status: string,
    borderCoords: firebase.firestore.GeoPoint[],
    badgeLatLng: firebase.firestore.GeoPoint,
    buildings: Building[],
    houses: House[],
}