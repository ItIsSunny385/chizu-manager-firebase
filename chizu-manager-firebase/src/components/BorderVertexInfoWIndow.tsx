import { InfoWindow } from '@react-google-maps/api';
import { Button } from 'reactstrap';
import { CheckSquareFill, TrashFill } from 'react-bootstrap-icons';
import { Fragment } from 'react';

export interface Props {
    latLng: google.maps.LatLng,
    displayCheck: boolean,
    toggle: () => void,
    delete: () => void,
    check: () => void,
}

export default function BorderVertexInfoWindow(props: Props) {
    return <InfoWindow position={props.latLng} onCloseClick={props.toggle}>
        <Fragment>
            <Button onClick={props.delete}><TrashFill /></Button>
            {
                props.displayCheck
                &&
                <Button onClick={props.check} className="ml-1"><CheckSquareFill /></Button>
            }
        </Fragment>
    </InfoWindow>;
}