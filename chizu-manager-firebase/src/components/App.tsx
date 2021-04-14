import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpinnerWithBack from './SpinnerWithBack';

interface Props {
    children: any;
    loading: boolean;
    containerStyle?: React.CSSProperties;
}

export default function App(props: Props) {
    return (
        <main style={props.containerStyle}>
            <Header />
            {props.children}
            {props.loading && <SpinnerWithBack />}
        </main>
    );
}
