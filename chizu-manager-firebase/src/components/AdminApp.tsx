import firebase from 'firebase';
import App from './App';
import NavTabs from './NavTabs';
import FlashMessage, { Props as FlashMessageProps } from './FlashMessage';
import { Col, Container, Row } from 'reactstrap';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';
import { PageRoles } from '../types/role';
import { User } from '../types/model';

interface Props {
    authUser: firebase.User | undefined;
    user: User | undefined;
    pageRole: PageRoles | undefined;
    children: any,
    activeTabId: number,
    pageTitle: string,
    loading: boolean,
    flashMessageProps?: FlashMessageProps
};

export default function AdminApp(props: Props) {
    let pageIcon = undefined;
    switch (props.activeTabId) {
        case 1:
            pageIcon = <MapFill className="mb-1 mr-2" />;
            break;
        case 2:
            pageIcon = <PeopleFill className="mb-1 mr-2" />;
            break;
        case 3:
            pageIcon = <GearFill className="mb-1 mr-2" />;
            break;
    }

    return (
        <App
            authUser={props.authUser}
            user={props.user}
            title={props.pageTitle}
            loading={props.loading}
            pageRole={props.pageRole}
        >
            <Container>
                <Row>
                    <Col>
                        <NavTabs activeTabId={props.activeTabId} />
                        {
                            props.flashMessageProps
                            &&
                            <FlashMessage {...props.flashMessageProps} />
                        }
                        <h4 className="mb-3 mt-3">{pageIcon}{props.pageTitle}</h4>
                        {props.children}
                    </Col>
                </Row>
            </Container>
        </App>
    );
}