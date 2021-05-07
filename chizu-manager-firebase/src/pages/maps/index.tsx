import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import { useState, useEffect, Fragment } from 'react';
import AdminApp from '../../components/AdminApp';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { MapData } from '../../types/map';
import { getMapDataArrayWithNoChildByQuerySnapshot } from '../../utils/mapUtil'
import Link from 'next/link';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { useRouter } from 'next/router';
import { PageRoles } from '../../types/role';

const db = firebase.firestore();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [maps, setMaps] = useState([] as Array<MapData>);
    const [keyword, setKeyword] = useState('');
    const router = useRouter();

    useEffect(() => {
        db.collection('maps').orderBy('name', 'asc').onSnapshot((snapshot) => {
            setMaps(getMapDataArrayWithNoChildByQuerySnapshot(snapshot));
            setLoading(false);
        });
    }, []);

    return (
        <AdminApp
            activeTabId={1}
            pageTitle="地図一覧"
            pageRole={PageRoles.Administrator}
            loading={loading}
        >
            <Form inline className="mb-2">
                <FormGroup>
                    <Label className="mr-2">名前検索</Label>
                    <Input type="text" onChange={(e) => { setKeyword(e.target.value); }} />
                </FormGroup>
            </Form>
            <BootstrapTable
                bootstrap4
                keyField='fullId'
                data={maps.filter(x => x.name.includes(keyword))
                    .map(x => {
                        return {
                            fullId: x.id,
                            id: x.id ? x.id.substr(0, 10) + '...' : '',
                            name: x.name,
                            using: x.using ? '使用中' : '不使用',
                            action: <Fragment>
                                <Link href={`/maps/edit?id=${x.id}`}><a className="mr-1">編集</a></Link>
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    db.collection('maps').doc(x.id).delete();
                                }}>削除</a>
                            </Fragment>
                        };
                    })}
                columns={[
                    { dataField: 'id', text: 'ID', classes: 'd-none d-md-table-cell', headerClasses: 'd-none d-md-table-cell', sort: true },
                    { dataField: 'name', text: '名前', sort: true },
                    { dataField: 'using', text: '使用状況', sort: true },
                    { dataField: 'action', text: '' }
                ]}
                pagination={paginationFactory({})}
                noDataIndication={() => (<div className="text-center">データがありません</div>)}
            />
            <div className="text-left mb-2 mt-2">
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        const newMapRef = db.collection('maps').doc();
                        router.push(`/maps/edit?id=${newMapRef.id}`);
                    }}
                    className="ml-1"
                >
                    追加
                </Button>
            </div>
        </AdminApp>
    );
}