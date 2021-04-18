import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpinnerWithBack from './SpinnerWithBack';
import MessageModal, { MessageModalProps } from './MessageModal';

interface Props {
    children: any;
    loading: boolean;
    containerStyle?: React.CSSProperties;
    messageModalProps?: MessageModalProps;
}

export default function App(props: Props) {
    return (
        <React.Fragment>
            <main style={props.containerStyle}>
                <Header />
                {props.children}
                {props.loading && <SpinnerWithBack />}
            </main>
            {/* メッセージモーダル */}
            {
                props.messageModalProps
                &&
                <MessageModal {...props.messageModalProps} />
            }
        </React.Fragment>
    );
}
