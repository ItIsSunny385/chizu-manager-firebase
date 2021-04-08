import { useState, useEffect, MouseEvent } from 'react';
import { useRouter } from 'next/router';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';

export default function Index() {
    const router = useRouter();
    const [alertType, setAlertType] = useState(undefined);
    const [alertMessage, setAlertMessage] = useState(undefined);

    const onClickAddButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users/add');
    });

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ一覧"
            alertType={alertType}
            alertMessage={alertMessage}
        >
            <div className="text-left mb-2">
                <Button onClick={onClickAddButton} className="ml-1">追加</Button>
            </div>
        </AdminApp>
    );
}