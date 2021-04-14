import React, { Dispatch } from 'react';
import App from "./App";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

interface Props {
    loading: boolean;
    children?: JSX.Element;
    onLoadMap?: Dispatch<any>;
}

export default function MapApp(props: Props) {
    const appStyle = {
        width: '100%',
        height: '100vh',
    }

    const containerDivStyle = {
        width: '100%',
        height: 'calc(100vh - 4rem)',
    }

    const center = {
        lat: Number(process.env.googleMapsCenterLat),
        lng: Number(process.env.googleMapsCenterLng),
    };

    return (
        <App loading={props.loading} containerStyle={appStyle}>
            <LoadScript googleMapsApiKey={process.env.googleMapsApiKey}>
                <GoogleMap
                    mapContainerStyle={containerDivStyle}
                    center={center}
                    zoom={Number(process.env.googleMapsZoom)}
                    onLoad={props.onLoadMap}
                >
                    {props.children}
                </GoogleMap>
            </LoadScript>
        </App >
    );
}