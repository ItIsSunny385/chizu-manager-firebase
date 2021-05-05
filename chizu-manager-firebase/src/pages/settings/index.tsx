import { useState } from 'react';
import AdminApp from '../../components/AdminApp';
import StatusList from '../../components/StatusList';
import { StatusType } from '../../types/model';
import { PageRoles } from '../../types/role';
import '../../utils/InitializeFirebase';

export default function Index() {
    const [statusListLoading, setStatusListLoading] = useState(true);

    return (
        <AdminApp
            activeTabId={3}
            pageTitle="設定"
            pageRole={PageRoles.Administrator}
            loading={statusListLoading}
        >
            <div className="mt-4">
                <StatusList setLoading={setStatusListLoading} type={StatusType.HouseOrRoom} />
            </div>
            <div className="mt-5">
                <StatusList setLoading={setStatusListLoading} type={StatusType.Building} />
            </div>
        </AdminApp>
    );
}