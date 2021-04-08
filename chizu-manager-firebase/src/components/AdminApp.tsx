import { useState, MouseEvent } from 'react';
import App from './App';
import NavTabs from './NavTabs';
import { Alert } from 'reactstrap';
import { PeopleFill } from 'react-bootstrap-icons';

interface Props {
    children: any,
    activeTabId: number,
    pageTitle: string,
    alertType: string | undefined,
    alertMessage: string | undefined,
};

export default function AdminApp(props: Props) {
    const [alertType, setAlertType] = useState(props.alertType);
    const [alertMessage, setAlertMessage] = useState(props.alertMessage);

    const onClickAlertCloseButton = ((e: MouseEvent) => {
        e.preventDefault();
        setAlertType(undefined);
        setAlertMessage(undefined);
    });

    let pageIcon = undefined;
    switch (props.activeTabId) {
        case 2:
            pageIcon = <PeopleFill className="mb-1 mr-2" />;
            break;
    }

    return (
        <App>
            <NavTabs activeTabId={2} />
            {
                alertType
                &&
                alertMessage
                &&
                <Alert id="alert" color={alertType} className="mt-3">
                    {alertMessage}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={onClickAlertCloseButton}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Alert>
            }
            <h4 className="mb-3 mt-3">{pageIcon}{props.pageTitle}</h4>
            {props.children}
        </App >
    );
}