import { Fragment, useEffect, useState } from 'react';
import firebase from 'firebase';
import BootstrapTable from 'react-bootstrap-table-next';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';
import '../../utils/InitializeFirebase';
import AddStatusModal from '../../components/AddStatusModal';
import { Status } from '../../types/model';
import Link from 'next/link';

const db = firebase.firestore();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [displayAddStatusModal, setDisplayAddStatusModal] = useState(false);

    useEffect(() => {
        db.collection('statuses').orderBy('number', 'asc').onSnapshot((snapshot) => {
            const newStatusMap = new Map<string, Status>();
            snapshot.forEach((x) => {
                newStatusMap.set(x.id, {
                    name: x.data().name,
                    number: x.data().number,
                    pin: x.data().pin,
                    label: x.data().label,
                    statusAfterResetingRef: x.data().statusAfterResetingRef,
                });
            });
            setStatusMap(newStatusMap);
            setLoading(false);
        });
    }, []);

    return (
        <AdminApp
            activeTabId={3}
            pageTitle="設定"
            loading={loading}
        >
            <div>
                <h5 className="mb-3">家・部屋用ステータス</h5>
                <BootstrapTable
                    bootstrap4
                    keyField='fullId'
                    data={Array.from(statusMap.entries()).map(([id, status]) => {
                        return {
                            fullId: id,
                            id: id.substr(0, 10) + '...',
                            name: status.name,
                            pin: status.pin,
                            label: status.label,
                            statusAfterReseting: status.statusAfterResetingRef
                                ?
                                statusMap.get(status.statusAfterResetingRef.id).name
                                :
                                '',
                            action:
                                <Fragment>
                                    <Link href="#"><a className="mr-1">編集</a></Link>
                                    <Link href="#"><a>削除</a></Link>
                                </Fragment>,
                        };
                    })}
                    columns={[
                        { dataField: 'id', text: 'ID' },
                        { dataField: 'name', text: '名前' },
                        { dataField: 'pin', text: 'ピン' },
                        { dataField: 'label', text: 'ラベル' },
                        { dataField: 'statusAfterReseting', text: 'リセット後' },
                        { dataField: 'action', text: '' },
                    ]}
                    noDataIndication={() => (<div className="text-center">データがありません</div>)}
                />
                <Button onClick={(e) => { setDisplayAddStatusModal(true); }}>追加</Button>
                {
                    displayAddStatusModal
                    &&
                    <AddStatusModal
                        statusMap={statusMap}
                        toggle={() => { setDisplayAddStatusModal(false); }}
                    />
                }
            </div>
        </AdminApp>
    );
}