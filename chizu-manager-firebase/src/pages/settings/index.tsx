import { useState } from 'react';
import AdminApp from '../../components/AdminApp';
import StatusList from '../../components/StatusList';
import '../../utils/InitializeFirebase';

export default function Index() {
    const [statusListLoading, setStatusListLoading] = useState(true);

    return (
        <AdminApp
            activeTabId={3}
            pageTitle="設定"
            loading={statusListLoading}
        >
            <StatusList setLoading={setStatusListLoading} />
        </AdminApp>
    );
}