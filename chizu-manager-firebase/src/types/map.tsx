import { FloorInfoB } from "../components/BuildingRoomInfoModal";

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

export interface BuildingInfo {
    name: string,
    latLng: google.maps.LatLng,
    floors: FloorInfoB[]
}

export interface HouseInfo {
    latLng: google.maps.LatLng
}