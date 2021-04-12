import { useState, useEffect, MouseEvent, Fragment } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';
import Link from 'next/link'
import nookies from 'nookies';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import '../../components/InitializeFirebase';

interface Props {
    alertType: string;
    alertMessage: string;
}

const roles = {
    'GeneralUser': '一般ユーザ',
    'Editor': '編集者',
    'Administrator': '管理者',
}
const columns = [
    { dataField: 'id', text: 'ID', classes: 'd-none d-md-block', headerClasses: 'd-none d-md-block', sort: true },
    { dataField: 'displayName', text: '表示名', sort: true },
    { dataField: 'role', text: '権限', sort: true },
    { dataField: 'action', text: '' },
]
const db = firebase.firestore();

interface UserRow {
    fullId: string;
    id: string;
    displayName: string;
    role: string;
    action: JSX.Element;
}

export default function Index(props: Props) {
    const router = useRouter();
    const [alertType, setAlertType] = useState(props.alertType);
    const [alertMessage, setAlertMessage] = useState(props.alertMessage);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([] as UserRow[]);

    const onClickAddButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users/add');
    });

    const onClickDeleteLink = ((e: MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        const targetId = (e.target as HTMLAnchorElement).dataset.id;
        const batch = db.batch();
        const userRef = db.collection('users').doc(targetId);
        batch.update(userRef, { deleted: true });
        const deleteAuthUserRef = db.collection('delete_auth_users').doc(targetId);
        batch.set(deleteAuthUserRef, { uid: targetId });
        batch.commit().then(ref => {
            setAlertType('success');
            setAlertMessage('削除しました。');
            /* ローディングアニメーションは リアルタイムリスナーで消去 */
        }).catch(error => {
            console.log(error);
            setAlertType('danger');
            setAlertType('削除に失敗しました。');
            setLoading(false);
        });
    });

    const createNewData = (snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => {
        let newData = [];
        snapshot.forEach((user) => {
            const userData = user.data();
            newData.push({
                fullId: user.id,
                id: user.id.substr(0, 10) + '...',
                displayName: userData.displayName,
                role: roles[userData.role],
                action:
                    <Fragment>
                        <Link href={'/users/edit/' + user.id}><a className="mr-1">編集</a></Link>
                        <Link href="#alert"><a onClick={onClickDeleteLink} data-id={user.id}>削除</a></Link>
                    </Fragment>,
            });
        });
        return newData;
    }

    useEffect(() => {
        db.collection('users').where('deleted', '!=', true).get().then((snapshot) => {
            setData(createNewData(snapshot));
            setLoading(false);
        });
        db.collection('users').where('deleted', '!=', true).onSnapshot((snapshot) => {
            setData(createNewData(snapshot));
            setLoading(false);
        });
    }, [])

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ一覧"
            alertType={alertType}
            alertMessage={alertMessage}
            loading={loading}
            setAlertType={setAlertType}
            setAlertMessage={setAlertMessage}
        >
            <BootstrapTable
                bootstrap4
                keyField='fullId'
                data={data}
                columns={columns}
                pagination={paginationFactory()}
            />
            <div className="text-left mb-2 mt-2">
                <Button onClick={onClickAddButton} className="ml-1">追加</Button>
            </div>
        </AdminApp>
    );
}

export async function getServerSideProps(ctx) {
    const cookies = nookies.get(ctx);
    const alertType = cookies.alertType;
    const alertMessage = cookies.alertMessage;
    nookies.destroy(ctx, 'alertType', { path: '/' });
    nookies.destroy(ctx, 'alertMessage', { path: '/' });
    return {
        props: {
            alertType: alertType,
            alertMessage: alertMessage
        }
    };
}