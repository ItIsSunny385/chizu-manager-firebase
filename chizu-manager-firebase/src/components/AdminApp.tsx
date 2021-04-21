import { useState, MouseEvent, Dispatch } from 'react';
import App from './App';
import NavTabs from './NavTabs';
import { Alert, Button, Col, Container, Row } from 'reactstrap';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';

interface Props {
    children: any,
    activeTabId: number,
    pageTitle: string,
    alertType?: string,
    alertMessage?: string,
    loading: boolean,
    setAlertType?: Dispatch<any>,
    setAlertMessage?: Dispatch<any>,
};

export default function AdminApp(props: Props) {

    const onClickAlertCloseButton = ((e: MouseEvent) => {
        e.preventDefault();
        props.setAlertType(undefined);
        props.setAlertMessage(undefined);
    });

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
                            props.alertType
                            &&
                            props.alertMessage
                            &&
                            <Alert id="alert" color={props.alertType} className="mt-3">
                                {props.alertMessage}
                                <Button close onClick={onClickAlertCloseButton} />
                            </Alert>
                        }
                        <h4 className="mb-3 mt-3">{pageIcon}{props.pageTitle}</h4>
                        {props.children}
                    </Col>
                </Row>
            </Container>
        </App>
    );
}