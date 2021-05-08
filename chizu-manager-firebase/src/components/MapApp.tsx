import firebase from 'firebase';
import React, { useState } from 'react';
import App from "./App";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { MessageModalProps } from './MessageModal';
import { PageRoles } from '../types/role';
import { User } from '../types/model';

interface Props {
    authUser: firebase.User | undefined;
    user: User | undefined;
    title: string;
    pageRole: PageRoles | undefined;
    loading: boolean;
    children?: any;
    onLoadMap?: (map: google.maps.Map<Element>) => void | Promise<void>;
    onRightClick?: (e: google.maps.MapMouseEvent) => void;
    messageModalProps?: MessageModalProps;
}

export default function MapApp(props: Props) {
    const [apiKey] = useState(process.env.googleMapsApiKey!);
    const [zoom] = useState(Number(process.env.googleMapsZoom));
    const [center] = useState({
        lat: Number(process.env.googleMapsCenterLat),
        lng: Number(process.env.googleMapsCenterLng),
    });

    const appStyle = {
        width: '100%',
        height: '100vh',
    }

    const containerDivStyle = {
        width: '100%',
        height: 'calc(100vh - 4rem)',
    }

    return (
        <App
            authUser={props.authUser}
            user={props.user}
            title={props.title}
            pageRole={props.pageRole}
            loading={props.loading}
            containerStyle={appStyle}
            messageModalProps={props.messageModalProps}
        >
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={containerDivStyle}
                    center={center}
                    zoom={zoom}
                    onLoad={props.onLoadMap}
                    onRightClick={props.onRightClick}
                    options={{
                        mapTypeControl: false,
                        fullscreenControl: false,
                        streetViewControl: false,
                        zoomControl: false,
                    }}
                >
                    {props.children}
                </GoogleMap>
            </LoadScript>
        </App >
    );
}