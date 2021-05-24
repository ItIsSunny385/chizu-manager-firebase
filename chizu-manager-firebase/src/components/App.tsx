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
