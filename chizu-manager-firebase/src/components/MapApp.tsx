import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
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
    onLoadMap: (map: google.maps.Map<Element>) => void | Promise<void>;
    onRightClick: (e: google.maps.MapMouseEvent) => void;
    unsubscribes: (() => void)[] | undefined;
}

export default function MapApp(props: Props) {
    const [apiKey] = useState(process.env.googleMapsApiKey!);
    const [zoom] = useState(Number(process.env.googleMapsZoom));
    const [center] = useState({
        lat: Number(process.env.googleMapsCenterLat),
        lng: Number(process.env.googleMapsCenterLng),
    });
    const [height, setHeight] = useState(undefined as number | undefined);

    useEffect(() => {
        window.addEventListener('resize', () => {
            setHeight(window.innerHeight);
        });
    }, []);

    return (
        <App
            authUser={props.authUser}
            user={props.user}
            title={props.title}
            pageRole={props.pageRole}
            loading={props.loading}
            containerStyle={{
                width: '100%',
                height: height ? `${height}px` : '100vh',
            }}
            unsubscribes={props.unsubscribes}
        >
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={{
                        width: '100%',
                        height: height ? `${height - 57}px` : 'calc(100vh - 57px)'
                    }}
                    center={center}
                    zoom={zoom}
                    onLoad={(map) => {
                        props.onLoadMap(map);
                        setHeight(window.innerHeight);
                    }}
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