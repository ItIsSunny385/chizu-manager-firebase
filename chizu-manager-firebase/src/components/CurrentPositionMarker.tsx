import { Marker } from '@react-google-maps/api';

interface Props {
    latLng: google.maps.LatLng
}

export default function CurrentPositionMarker(props: Props) {
    return <Marker
        position={props.latLng}
        icon={{
            fillColor: "#0000FF",
            fillOpacity: 0.8,
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: "#0000FF",
            strokeWeight: 1,
        }}
        zIndex={2}
    />;
}