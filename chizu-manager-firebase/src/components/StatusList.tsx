import '../utils/InitializeFirebase'; // comoponent中では import firebase の前に書く
import { Fragment, useEffect, useState } from 'react';
import firebase from 'firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';
import AddStatusModal from './AddStatusModal';
import EditStatusModal from './EditStatusModal';
import { Status, StatusCollectionName, StatusType } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import { getStatusMapFromQuerySnapshot } from '../utils/statusUtil';
import { ExclamationCircle } from 'react-bootstrap-icons';
import OkModal from './OkModal';
import ConfirmDeletionModal from './ConfirmDeletionModal';

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
    const [errorMessage, setErrorMessage] = useState(undefined as string | undefined);
    const [deleteStatusId, setDeleteStatusId] = useState(undefined as string | undefined);

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
            {
                statusMap.size === 0
                    ?
                    <ListGroup>
                        <ListGroupItem className="text-center">データがありません。</ListGroupItem>
                    </ListGroup>
                    :
                    <ListGroup className="mb-2">
                        {
                            Array.from(statusMap.entries()).map(([id, x]) =>
                                <ListGroupItem
                                    key={id}
                                    className="text-center"
                                >
                                    <span
                                        className="mr-1 p-3 text-dark font-weight-bold"
                                        style={{
                                            backgroundImage: `url(${getMarkerUrl(x.pin)}`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center top 13px',
                                            backgroundSize: '37px',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {x.label}
                                    </span>
                                    <a href="#" onClick={(e) => { setEditStatusId(id); e.preventDefault(); }}>
                                        {x.name}
                                        <small>（リセット後：{x.statusAfterResetingRef ? statusMap.get(id)!.name : 'なし'}）</small>
                                    </a>
                                </ListGroupItem>
                            )
                        }
                    </ListGroup>
            }
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
            {
                deleteStatusId
                &&
                <ConfirmDeletionModal
                    toggle={() => { setDeleteStatusId(undefined); }}
                    delete={() => {
                        db.collection(collectionName).doc(deleteStatusId).delete();
                        setDeleteStatusId(undefined);
                    }}
                />
            }
            {
                errorMessage
                &&
                <OkModal
                    header={<Fragment>
                        <ExclamationCircle className="mb-1 mr-2" />エラー
                    </Fragment>}
                    zIndex={2000}
                    toggle={() => { setErrorMessage(undefined); }}
                    ok={() => { setErrorMessage(undefined); }}
                >
                    <div>{errorMessage}</div>
                </OkModal>
            }
        </Fragment>
    );
}