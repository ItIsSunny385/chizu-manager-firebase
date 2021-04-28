import App from './App';
import NavTabs from './NavTabs';
import FlashMessage, { Props as FlashMessageProps } from './FlashMessage';
import { Col, Container, Row } from 'reactstrap';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';

interface Props {
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
        <App loading={props.loading}>
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