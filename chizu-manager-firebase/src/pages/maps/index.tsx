import '../../utils/InitializeFirebase';
import { useState } from 'react';
import AdminApp from '../../components/AdminApp';

export default function Index() {
    const [loading, setLoading] = useState(true);

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="地図一覧"
            loading={loading}
        >
        </AdminApp>
    );
}