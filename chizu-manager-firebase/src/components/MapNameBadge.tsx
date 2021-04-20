import { Marker } from '@react-google-maps/api';

interface Props {
    position: google.maps.LatLngLiteral,
    name: string,
    draggable: boolean,
    setPosition: (value: React.SetStateAction<google.maps.LatLngLiteral>) => void | undefined,
}

export default function MapNameBadge(props: Props) {
    return <Marker
        position={props.position}
        icon={{
            url: '//:0',
            scaledSize: new google.maps.Size(100, 30),
            labelOrigin: new google.maps.Point(50, 15),
            anchor: new google.maps.Point(50, 15),
        }}
        label={{
            text: props.name,
            color: '#FF0000',
            fontWeight: 'bold',
            fontSize: '30px',
        }}
        draggable={props.draggable}
        onDragEnd={(e) => {
            props.setPosition({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            });
        }}
        zIndex={3}
    />;
}