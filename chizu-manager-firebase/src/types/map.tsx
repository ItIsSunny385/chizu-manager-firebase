import firebase from 'firebase';

export enum RoomNumberTypes {
    SerialNumber = 'SerialNumber',
    Except4 = 'Except4',
    Except4And9 = 'Except4And9',
    Other = 'Other',
}

export interface BuildingBasicInfo {
    name: string,
    numberOfFloors: number,
    roomNumberType: RoomNumberTypes,
}

export interface BasicBuilding {
    name: string,
    latLng: firebase.firestore.GeoPoint,
    statusRef: firebase.firestore.DocumentReference
}

export interface Building extends BasicBuilding {
    id: string,
    floors: Map<string, Floor>,
}

export interface BasicFloor {
    number: number,
}
export interface Floor extends BasicFloor {
    id: string,
    rooms: Map<string, Room>
}

export interface BasicRoom {
    orderNumber: number,
    roomNumber: string,
    statusRef: firebase.firestore.DocumentReference
}

export interface Room extends BasicRoom {
    id: string,
}

export interface House {
    id?: string,
    latLng: firebase.firestore.GeoPoint,
    statusRef: firebase.firestore.DocumentReference
}

export interface MapBasicData {
    name: string,
    using: boolean,
    borderCoords: firebase.firestore.GeoPoint[],
}

export interface MapData extends MapBasicData {
    id: string,
    buildings: Map<string, Building>,
    houses: Map<string, House>,
}