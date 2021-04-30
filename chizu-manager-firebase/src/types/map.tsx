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

export interface NewMapBasicInfo {
    name: string;
    orderNumber: number;
    status: MapStatus;
}

export interface NewMapBasicInfoWithBorderCoords extends NewMapBasicInfo {
    borderCoords: google.maps.LatLngLiteral[]
}

export interface Building {
    name: string,
    latLng: google.maps.LatLng,
    floors: FloorInfoB[],
    statusRef: firebase.firestore.DocumentReference
}

export interface FloorInfoB {
    number: number,
    rooms: Room[]
}

export interface Room {
    number: string,
    statusRef: firebase.firestore.DocumentReference
}

export interface House {
    latLng: google.maps.LatLng,
    statusRef: firebase.firestore.DocumentReference
}