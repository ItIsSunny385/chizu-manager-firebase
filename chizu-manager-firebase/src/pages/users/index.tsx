import { useState, useEffect, MouseEvent } from 'react';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import AdminApp from '../../components/AdminApp';
import { Button } from 'reactstrap';
import Link from 'next/link'
import nookies from 'nookies';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
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
    { dataField: 'id', text: 'ID', classes: 'd-none d-md-block', headerClasses: 'd-none d-md-block' },
    { dataField: 'displayName', text: '表示名' },
    { dataField: 'role', text: '権限' },
    { dataField: 'action', text: '' },
]
const db = firebase.firestore();

export default function Index(props: Props) {
    const router = useRouter();
    const [data, setData] = useState([]);

    const onClickAddButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users/add');
    });

    useEffect(() => {
        db.collection('users').where('deleted', '!=', true).get().then((snapshot) => {
            let newData = [];
            snapshot.forEach((user) => {
                const userData = user.data();
                newData.push({
                    fullId: user.id,
                    id: user.id.substr(0, 10) + '...',
                    displayName: userData.displayName,
                    role: roles[userData.role],
                    action: <Link href={'/users/edit/' + user.id}><a>編集</a></Link>,
                });
            })
            setData(newData);
        });
    }, [])

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="ユーザ一覧"
            alertType={props.alertType}
            alertMessage={props.alertMessage}
        >
            <BootstrapTable keyField='fullId' data={data} columns={columns} />
            <div className="text-left mb-2">
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