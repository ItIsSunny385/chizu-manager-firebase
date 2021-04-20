import { Marker } from "@react-google-maps/api";
import { HouseInfo } from '../types/map';
import { getMarkerUrl } from '../utils/markerUtil'

interface Props {
    houseInfo: HouseInfo
    setHouseInfo: (newHouseInfo: HouseInfo) => void,
}

export default function HouseMarkerOfAdmin(props: Props) {
    return <Marker
        position={props.houseInfo.latLng}
        icon={{
            url: getMarkerUrl('lightblue'),
            scaledSize: new google.maps.Size(50, 50),
            labelOrigin: new google.maps.Point(25, 18),
        }}
        label={{
            text: '家',
            color: '#000000',
            fontWeight: 'bold',
        }}
        draggable={true}
        onDragEnd={(e) => {
            const newHouseInfo = { ...props.houseInfo };
            newHouseInfo.latLng = e.latLng;
            props.setHouseInfo(newHouseInfo);
        }}
        zIndex={2}
    />;
}