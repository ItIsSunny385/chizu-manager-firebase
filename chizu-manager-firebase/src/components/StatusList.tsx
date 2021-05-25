import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import { Fragment, useEffect, useState } from 'react';
import firebase from 'firebase';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button } from 'reactstrap';
import AddStatusModal from './AddStatusModal';
import EditStatusModal from './EditStatusModal';
import { Status, StatusCollectionName, StatusType } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import { getStatusMapFromQuerySnapshot } from '../utils/statusUtil';
import { Colors } from '../types/bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';

const db = firebase.firestore();

interface Props {
    type: StatusType;
    loaded: () => void;
    addUnsubscribe: (unsubscribe: () => void) => void;
}

export default function StatusList(props: Props) {
    const [statusMap, setStatusMap] = useState(new Map<string, Status>());
    const [displayAddStatusModal, setDisplayAddStatusModal] = useState(false);
    const [editStatusId, setEditStatusId] = useState(undefined as string | undefined);

    const collectionName = StatusCollectionName[props.type];
    const title = props.type === StatusType.HouseOrRoom ? '家・部屋ステータス' : '集合住宅ステータス';

    useEffect(() => {
        const unsubscribe = db.collection(collectionName).orderBy('number', 'asc').onSnapshot((snapshot) => {
            setStatusMap(getStatusMapFromQuerySnapshot(snapshot));
            props.loaded();
        });
        props.addUnsubscribe(unsubscribe);
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
                                <Button
                                    className="mr-1"
                                    size="sm"
                                    onClick={() => { setEditStatusId(id); }}
                                >
                                    <Pencil className="mb-1" /><span className="ml-1 d-none d-md-inline">編集</span>
                                </Button>
                                <Button
                                    size="sm"
                                    color={Colors.Danger}
                                >
                                    <Trash className="mb-1" /><span className="ml-1 d-none d-md-inline">削除</span>
                                </Button>
                            </Fragment>,
                    };
                })}
                columns={[
                    { dataField: 'name', text: '名前' },
                    {
                        dataField: 'pin',
                        text: 'ピン',
                        classes: 'text-center font-weight-bold',
                        style: (cell, row, rowIndex, colIndex) => {
                            return {
                                backgroundImage: `url(${getMarkerUrl(Array.from(statusMap.values())[rowIndex].pin)}`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center top 11px',
                                backgroundSize: '37px',
                                fontSize: '14px',
                            };
                        }
                    },
                    { dataField: 'statusAfterReseting', text: 'リセット後' },
                    { dataField: 'action', text: '', classes: 'p-2' },
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