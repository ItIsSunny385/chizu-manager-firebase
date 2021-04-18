export interface NewMapBasicInfo {
    name: string;
    orderNumber: number;
    publicFlg: boolean;
    editableFlg: boolean;
}

export interface NewMapBasicInfoWithBorderCoords extends NewMapBasicInfo {
    borderCoords: google.maps.LatLngLiteral[]
}