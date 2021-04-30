import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import { useState, useEffect, MouseEvent, Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AdminApp from '../../components/AdminApp';

export default function Index() {
    const [loading, setLoading] = useState(true);

    return (
        <AdminApp
            activeTabId={2}
            pageTitle="地図一覧"
            loading={loading}
        >
        </AdminApp>
    );
}