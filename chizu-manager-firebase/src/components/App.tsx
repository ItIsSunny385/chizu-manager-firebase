import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpinnerWithBack from './SpinnerWithBack';
import MessageModal, { MessageModalProps } from './MessageModal';
import Head from 'next/head';
import { PageRoles } from '../types/role';

interface Props {
    title: string;
    pageRole: PageRoles | undefined;
    children: any;
    loading: boolean;
    containerStyle?: React.CSSProperties;
    messageModalProps?: MessageModalProps;
}

export default function App(props: Props) {
    return (
        <React.Fragment>
            <Head>
                <title>{props.title} | 地図マネージャ</title>
            </Head>
            <main style={props.containerStyle}>
                <Header pageRole={props.pageRole} />
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
