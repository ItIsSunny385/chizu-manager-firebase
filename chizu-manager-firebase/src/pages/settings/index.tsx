import { useState } from 'react';
import AdminApp from '../../components/AdminApp';
import StatusList from '../../components/StatusList';
import { StatusType } from '../../types/model';
import { PageRoles } from '../../types/role';
import '../../utils/InitializeFirebase';

export default function Index() {
    const [statusListLoading, setStatusListLoading] = useState(true);
    const [buildingStatusListLoading, setBuildingStatusListLoading] = useState(true);

    return (
        <AdminApp
            activeTabId={3}
            pageTitle="設定"
            pageRole={PageRoles.Administrator}
            loading={statusListLoading || buildingStatusListLoading}
        >
            <div className="mt-4">
                <StatusList loaded={() => { setStatusListLoading(false); }} type={StatusType.HouseOrRoom} />
            </div>
            <div className="mt-5">
                <StatusList loaded={() => { setBuildingStatusListLoading(false); }} type={StatusType.Building} />
            </div>
        </AdminApp>
    );
}