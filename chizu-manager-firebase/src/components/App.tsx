import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'reactstrap';

export default function App({ children }) {
    return (
        <main>
            <Header />
            <Container>
                <Row>
                    <Col>
                        {children}
                    </Col>
                </Row>
            </Container>
        </main>
    );
}
