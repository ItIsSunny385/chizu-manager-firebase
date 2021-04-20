import { InfoWindow, Marker } from "@react-google-maps/api";
import { useState } from "react";
import { TrashFill } from "react-bootstrap-icons";
import { HouseInfo } from '../types/map';
import { getMarkerUrl } from '../utils/markerUtil'

interface Props {
    data: HouseInfo
    set: (newHouseInfo: HouseInfo) => void,
    delete: () => void,
}

export default function HouseMarkerOfAdmin(props: Props) {
    const [openWindow, setOpenWindow] = useState(false);

    return <Marker
        position={props.data.latLng}
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
            const newHouseInfo = { ...props.data };
            newHouseInfo.latLng = e.latLng;
            props.set(newHouseInfo);
        }}
        onClick={(e) => {
            setOpenWindow(!openWindow);
        }}
        zIndex={2}
    >
        {
            openWindow
            &&
            <InfoWindow onCloseClick={() => { setOpenWindow(false); }}>
                <div className="h4 ml-1 mb-0">
                    <a
                        href='#'
                        onClick={(e) => { e.preventDefault(); props.delete(); }}
                    >
                        <TrashFill />
                    </a>
                </div>
            </InfoWindow>
        }
    </Marker >;
}