import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import { useState, useEffect, Fragment } from 'react';
import AdminApp from '../../components/AdminApp';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { MapStatus, MapData } from '../../types/map';
import { getMapDataArrayWithNoChildByQuerySnapshot } from '../../utils/mapUtil'
import Link from 'next/link';
import { Button } from 'reactstrap';
import { useRouter } from 'next/router';

const db = firebase.firestore();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [maps, setMaps] = useState([] as Array<MapData>);
    const router = useRouter();

    useEffect(() => {
        db.collection('maps').orderBy('orderNumber', 'asc').onSnapshot((snapshot) => {
            setMaps(getMapDataArrayWithNoChildByQuerySnapshot(snapshot));
            setLoading(false);
        });
    }, []);

    return (
        <AdminApp
            activeTabId={1}
            pageTitle="地図一覧"
            loading={loading}
        >
            <BootstrapTable
                bootstrap4
                keyField='fullId'
                data={maps.map(x => {
                    let status = '';
                    switch (x.status) {
                        case MapStatus.Private: status = '非公開'; break;
                        case MapStatus.Viewable: status = '閲覧可'; break;
                        case MapStatus.Editable: status = '編集可'; break;
                    }
                    return {
                        fullId: x.id,
                        id: x.id ? x.id.substr(0, 10) + '...' : '',
                        name: x.name,
                        status: status,
                        action: <Fragment>
                            <Link href={`/maps/edit?id=${x.id}`}><a className="mr-1">編集</a></Link>
                            <a>削除</a>
                        </Fragment>
                    };
                })}
                columns={[
                    { dataField: 'id', text: 'ID', classes: 'd-none d-md-table-cell', headerClasses: 'd-none d-md-table-cell', sort: true },
                    { dataField: 'name', text: '名前', sort: true },
                    { dataField: 'status', text: 'ステータス', sort: true },
                    { dataField: 'action', text: '' }
                ]}
                pagination={paginationFactory({})}
                noDataIndication={() => (<div className="text-center">データがありません</div>)}
            />
            <div className="text-left mb-2 mt-2">
                <Button
                    onClick={async (e) => {
                        e.preventDefault();
                        const newMap = db.collection('maps').doc();
                        await newMap.set({
                            orderNumber: maps.length + 1,
                            name: `Map${maps.length + 1}`,
                            status: MapStatus.Private,
                            borderCoords: [],
                        });
                        router.push(`/maps/edit?id=${newMap.id}`);
                    }}
                    className="ml-1"
                >
                    追加
                </Button>
            </div>
        </AdminApp>
    );
}