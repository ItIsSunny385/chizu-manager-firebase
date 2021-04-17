export interface LatLng {
    lat: number,
    lng: number
}

export interface NewMapBasicInfo {
    name: string;
    orderNumber: number;
    publicFlg: boolean;
    editableFlg: boolean;
}

export interface NewMapBasicInfoWithBorderCoords extends NewMapBasicInfo {
    borderCoords: LatLng[]
}