import firebase from 'firebase';
import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import SpinnerWithBack from './SpinnerWithBack';
import MessageModal, { MessageModalProps } from './MessageModal';
import Head from 'next/head';
import { PageRoles } from '../types/role';
import { User } from '../types/model';

interface Props {
    authUser: firebase.User | undefined;
    user: User | undefined;
    title: string;
    pageRole: PageRoles | undefined;
    children: any;
    loading: boolean;
    containerStyle?: React.CSSProperties;
    unsubscribes: (() => void)[] | undefined;
}

export default function App(props: Props) {
    return (
        <React.Fragment>
            <Head>
                <title>{props.title} | 地図マネージャ</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
                <link rel="manifest" href="/favicons/site.webmanifest" />
                <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#000000" />
                <link rel="shortcut icon" href="/favicons/favicon.ico" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="msapplication-config" content="/favicons/browserconfig.xml" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <main style={props.containerStyle}>
                <Header
                    pageRole={props.pageRole}
                    authUser={props.authUser}
                    user={props.user}
                    unsubscribes={props.unsubscribes}
                />
                {props.children}
                {props.loading && <SpinnerWithBack />}
            </main>
        </React.Fragment>
    );
}
