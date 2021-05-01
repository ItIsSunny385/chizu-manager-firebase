import firebase from 'firebase';

export enum MapStatus {
    Private = 'Private',
    Viewable = 'Viewable',
    Editable = 'Editable',
}

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

export interface MapBasicInfo {
    name: string;
    orderNumber: number;
    status: MapStatus;
}

export interface MapBasicInfoWithBorderCoords extends MapBasicInfo {
    borderCoords: firebase.firestore.GeoPoint[]
}

export interface Building {
    name: string,
    latLng: firebase.firestore.GeoPoint,
    floors: Floor[],
    statusRef: firebase.firestore.DocumentReference
}

export interface Floor {
    number: number,
    rooms: Room[]
}

export interface Room {
    orderNumber: number,
    roomNumber: string,
    statusRef: firebase.firestore.DocumentReference
}

export interface House {
    id?: string,
    latLng: firebase.firestore.GeoPoint,
    statusRef: firebase.firestore.DocumentReference
}