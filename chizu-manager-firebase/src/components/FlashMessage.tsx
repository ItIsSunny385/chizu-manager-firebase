import { Alert, Button } from 'reactstrap';
import { Colors } from '../types/bootstrap';

export interface Props {
    color: Colors,
    message: any,
    close: () => void,
}

export default function FlashMessage(props: Props) {
    return (
        <Alert id="alert" color={props.color} className="mt-3">
            {props.message}
            <Button close onClick={props.close} />
        </Alert>
    );
}