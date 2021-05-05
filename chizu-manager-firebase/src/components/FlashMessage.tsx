import { Alert, Button } from 'reactstrap';
import { Colors } from '../types/bootstrap';

export interface Props {
    color: Colors,
    message: any,
    close: () => void,
    className?: string,
}

export default function FlashMessage(props: Props) {
    const className = props.className ? props.className : 'mt-3';
    return (
        <Alert id="alert" color={props.color} className={className}>
            {props.message}
            <Button close onClick={props.close} />
        </Alert>
    );
}