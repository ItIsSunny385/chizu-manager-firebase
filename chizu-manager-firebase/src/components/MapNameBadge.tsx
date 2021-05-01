import firebase from 'firebase';
import { Marker } from '@react-google-maps/api';

interface Props {
    latLng: firebase.firestore.GeoPoint,
    name: string,
    draggable: boolean,
    setLatLng?: (value: React.SetStateAction<firebase.firestore.GeoPoint>) => void,
}

export default function MapNameBadge(props: Props) {
    return <Marker
        position={{ lat: props.latLng.latitude, lng: props.latLng.longitude }}
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
            props.setLatLng && props.setLatLng(new firebase.firestore.GeoPoint(e.latLng.lat(), e.latLng.lng()));
        }}
        zIndex={3}
    />;
}