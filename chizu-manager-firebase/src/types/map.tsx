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

export interface Room {
    number: string
}

export interface Floor {
    number: number,
    rooms: Room[]
}

export interface BuildingBasicInfo {
    latLng: google.maps.LatLng,
    name: string,
    numberOfFloors: number,
    roomNumberType: RoomNumberTypes,
}

export interface BuildingBasicInfoWithFloorInfo extends BuildingBasicInfo {
    floorNumberNumberOfRoomsMap: Map<number, number>
}

export interface BuildingInfo extends BuildingBasicInfoWithFloorInfo {
    floors: Floor[]
}

export interface NewMapBasicInfo {
    name: string;
    orderNumber: number;
    status: MapStatus;
}

export interface NewMapBasicInfoWithBorderCoords extends NewMapBasicInfo {
    borderCoords: google.maps.LatLngLiteral[]
}