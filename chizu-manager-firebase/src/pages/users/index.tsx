import { useState, useEffect, MouseEvent } from 'react';
import { useRouter } from 'next/router';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';
import nookies from 'nookies'

interface Props {
    alertType: string;
    alertMessage: string;
}

export default function Index(props: Props) {
    const router = useRouter();

    const onClickAddButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users/add');
    });

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ一覧"
            alertType={props.alertType}
            alertMessage={props.alertMessage}
        >
            <div className="text-left mb-2">
                <Button onClick={onClickAddButton} className="ml-1">追加</Button>
            </div>
        </AdminApp>
    );
}

export async function getServerSideProps(ctx) {
    const cookies = nookies.get(ctx);
    const alertType = cookies.alertType;
    const alertMessage = cookies.alertMessage;
    nookies.destroy(ctx, 'alertType', { path: '/' });
    nookies.destroy(ctx, 'alertMessage', { path: '/' });
    return {
        props: {
            alertType: alertType,
            alertMessage: alertMessage
        }
    };
}