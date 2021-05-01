import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import { useState, useEffect, Fragment } from 'react';
import AdminApp from '../../components/AdminApp';
import { Map } from '../../types/model';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { MapStatus } from '../../types/map';

const db = firebase.firestore();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [maps, setMaps] = useState([] as Array<Map>)

    useEffect(() => {
        db.collection('maps').orderBy('orderNumber', 'asc').onSnapshot((snapshot) => {
            const newMaps = [] as Array<Map>;
            snapshot.forEach(x => {
                newMaps.push({
                    id: x.id,
                    orderNumber: x.data().orderNumber,
                    name: x.data().name,
                    status: x.data().status,
                    borderCoords: x.data().borderCoords,
                    badgeLatLng: x.data().badgeLatLng,
                    buildings: [],
                    houses: [],
                });
            });
            setMaps(newMaps);
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
                            <a className="mr-1">詳細</a>
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
        </AdminApp>
    );
}