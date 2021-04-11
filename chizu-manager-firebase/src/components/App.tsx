import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'reactstrap';
import SpinnerWithBack from './SpinnerWithBack';

interface Props {
    children: any;
    loading: boolean;
}

export default function App(props: Props) {
    return (
        <main>
            <Header />
            <Container>
                <Row>
                    <Col>
                        {props.children}
                    </Col>
                </Row>
            </Container>
            {props.loading && <SpinnerWithBack />}
        </main>
    );
}
