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

export default function AdminApp({ children, activeTabId, pageTitle, alertType, alertMessage }: Props) {
    let pageIcon = undefined;
    switch (activeTabId) {
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
                <Alert id="alert" color={alertType} className="mt-3">{alertMessage}</Alert>
            }
            <h4 className="mb-3 mt-3">{pageIcon}{pageTitle}</h4>
            {children}
        </App>
    );
}