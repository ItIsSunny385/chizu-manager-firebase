import '../../utils/InitializeFirebase';
import firebase from 'firebase';
import { useState, useEffect, Fragment, useRef } from 'react';
import AdminApp from '../../components/AdminApp';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { MapData } from '../../types/map';
import { getMapDataArrayWithNoChildByQuerySnapshot } from '../../utils/mapUtil';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { useRouter } from 'next/router';
import { PageRoles } from '../../types/role';
import { User } from '../../types/model';
import { getUser } from '../../utils/userUtil';
import Link from 'next/link';
import ConfirmDeletionModal from '../../components/ConfirmDeletionModal';
import MapList from '../../components/MapList';
import { Colors } from '../../types/bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [maps, setMaps] = useState([] as Array<MapData>);
    const [keyword, setKeyword] = useState('');
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [deleteId, setDeleteId] = useState(undefined as string | undefined);
    const [newMapRef] = useState(db.collection('maps').doc());
    const [unsubscribes, _setUnsubscribes] = useState<(() => void)[]>([]);
    const router = useRouter();

    const unsubscribesRef = useRef(unsubscribes);
    const setUnsubscribes = (data: (() => void)[]) => {
        unsubscribesRef.current = data;
        _setUnsubscribes(data);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (!authUser) {
                router.push('/users/login');
            } else {
                setAuthUser(authUser);
                getUser(authUser.uid, setUser);
            }
            unsubscribe();
        });
        return () => {
            unsubscribesRef.current.forEach(x => { x(); });
        };
    }, []);

    useEffect(() => {
        if (user) {
            if (!user.isAdmin) {
                router.push('/users/login');
                return;
            }
            const unsubscribe = db.collection('maps').orderBy('name', 'asc').onSnapshot((snapshot) => {
                setMaps(getMapDataArrayWithNoChildByQuerySnapshot(snapshot));
                setLoading(false);
            });
            setUnsubscribes([unsubscribe]);
        }
    }, [user]);

    return (
        <AdminApp
            authUser={authUser}
            user={user}
            activeTabId={1}
            pageTitle="地図一覧"
            pageRole={PageRoles.Administrator}
            loading={loading}
            unsubscribes={unsubscribesRef.current}
        >
            <Form inline className="mb-2">
                <FormGroup>
                    <Label className="mr-2">名前検索</Label>
                    <Input type="text" onChange={(e) => { setKeyword(e.target.value); }} />
                </FormGroup>
            </Form>
            <MapList data={maps.filter(x => x.name.includes(keyword))} />
            <div className="text-left mb-2 mt-2">
                <Link href="/maps/[id]" as={`/maps/${newMapRef.id}`} passHref>
                    <Button tag="a">追加</Button>
                </Link>
            </div>
            {
                deleteId
                &&
                <ConfirmDeletionModal
                    toggle={() => {
                        setDeleteId(undefined);
                    }}
                    delete={() => {
                        db.collection('maps').doc(deleteId).delete();
                        setDeleteId(undefined);
                    }}
                />
            }
        </AdminApp>
    );
}