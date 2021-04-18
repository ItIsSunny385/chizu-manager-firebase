export enum MapStatus {
    Private = 'Private',
    Viewable = 'Viewable',
    Editable = 'Editable',
}

export interface NewMapBasicInfo {
    name: string;
    orderNumber: number;
    status: MapStatus;
}

export interface NewMapBasicInfoWithBorderCoords extends NewMapBasicInfo {
    borderCoords: google.maps.LatLngLiteral[]
}