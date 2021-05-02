import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import firebase from 'firebase';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button } from 'reactstrap';
import AddStatusModal from './AddStatusModal';
import EditStatusModal from './EditStatusModal';
import { Status, StatusCollectionName, StatusType } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import { getStatusMapFromQuerySnapshot } from '../utils/statusUtil';

const db = firebase.firestore();

interface Props {
    type: StatusType,
    setLoading: Dispatch<SetStateAction<boolean>>
}

export default function StatusList(props: Props) {
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [displayAddStatusModal, setDisplayAddStatusModal] = useState(false);
    const [editStatusId, setEditStatusId] = useState(undefined as string | undefined);

    const collectionName = StatusCollectionName[props.type];
    const title = props.type === StatusType.HouseOrRoom ? '家・部屋ステータス' : '集合住宅ステータス';

    useEffect(() => {
        db.collection(collectionName).orderBy('number', 'asc').onSnapshot((snapshot) => {
            setStatusMap(getStatusMapFromQuerySnapshot(snapshot));
            props.setLoading(false);
        });
    }, []);

    return (
        <Fragment>
            <h5 className="mb-3">{title}</h5>
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
                            statusMap.get(status.statusAfterResetingRef.id)!.name
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
                    type={props.type}
                    statusMap={statusMap}
                    toggle={() => { setDisplayAddStatusModal(false); }}
                />
            }
            {
                editStatusId
                &&
                <EditStatusModal
                    type={props.type}
                    id={editStatusId}
                    statusMap={statusMap}
                    toggle={() => { setEditStatusId(undefined); }}
                />
            }
        </Fragment>
    );
}