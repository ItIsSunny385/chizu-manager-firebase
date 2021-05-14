import { InfoWindow } from '@react-google-maps/api';
import { CheckSquare, Trash } from 'react-bootstrap-icons';

export interface Props {
    latLng: google.maps.LatLng,
    displayCheck: boolean,
    toggle: () => void,
    delete: () => void,
    check: () => void,
}

export default function BorderVertexInfoWindow(props: Props) {
    return <InfoWindow position={props.latLng} onCloseClick={props.toggle}>
        <div className="h4 mt-2">
            <a href="#" className="ml-2" onClick={(e) => { e.preventDefault(); props.delete(); }}>
                <Trash />
            </a>
            {
                props.displayCheck
                &&
                <a href="#" className="ml-4" onClick={(e) => { e.preventDefault(); props.check(); }}>
                    <CheckSquare />
                </a>
            }
        </div>
    </InfoWindow>;
}