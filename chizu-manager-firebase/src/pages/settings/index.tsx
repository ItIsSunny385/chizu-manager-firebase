import { Fragment, useEffect, useState } from 'react';
import firebase from 'firebase';
import BootstrapTable from 'react-bootstrap-table-next';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';
import '../../utils/InitializeFirebase';
import AddStatusModal from '../../components/AddStatusModal';
import EditStatusModal from '../../components/EditStatusModal';
import { Status } from '../../types/model';
import { getMarkerUrl } from '../../utils/markerUtil';

const db = firebase.firestore();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [displayAddStatusModal, setDisplayAddStatusModal] = useState(false);
    const [editStatusId, setEditStatusId] = useState(undefined as string);

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
                            pin: status.label,
                            statusAfterReseting: status.statusAfterResetingRef
                                ?
                                statusMap.get(status.statusAfterResetingRef.id).name
                                :
                                '',
                            action:
                                <Fragment>
                                    <a
                                        className="mr-1"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setEditStatusId(id);
                                        }}
                                    >
                                        編集
                                    </a>
                                    <a>削除</a>
                                </Fragment>,
                        };
                    })}
                    columns={[
                        {
                            dataField: 'id',
                            text: 'ID',
                            classes: 'd-none d-md-table-cell',
                            headerClasses: 'd-none d-md-table-cell'
                        },
                        { dataField: 'name', text: '名前' },
                        {
                            dataField: 'pin',
                            text: 'ピン',
                            classes: 'text-center font-weight-bold',
                            style: (cell, row, rowIndex, colIndex) => {
                                return {
                                    backgroundImage: `url(${getMarkerUrl(Array.from(statusMap.values())[rowIndex].pin)}`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'bottom',
                                    backgroundSize: '37px',
                                };
                            }
                        },
                        { dataField: 'statusAfterReseting', text: 'リセット後', classes: 'd-none d-md-table-cell', headerClasses: 'd-none d-md-table-cell' },
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
                {
                    editStatusId
                    &&
                    <EditStatusModal
                        id={editStatusId}
                        statusMap={statusMap}
                        toggle={() => { setEditStatusId(undefined); }}
                    />
                }
            </div>
        </AdminApp>
    );
}