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
            pageTitle="????????????"
            pageRole={PageRoles.Administrator}
            loading={loading}
            unsubscribes={unsubscribesRef.current}
        >
            <Form inline className="mb-2">
                <FormGroup>
                    <Label className="mr-2">????????????</Label>
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
                            using: x.using ? '?????????' : '?????????',
                            action: <Fragment>
                                <Link
                                    href='/maps/[id]'
                                    as={`/maps/${x.id}`}
                                    passHref
                                >
                                    <Button className="mr-1" size="sm">
                                        <Pencil className="mb-1" /><span className="ml-1 d-none d-md-inline">??????</span>
                                    </Button>
                                </Link>
                                <Button color={Colors.Danger} size="sm" onClick={() => {
                                    setDeleteId(x.id);
                                }}>
                                    <Trash className="mb-1" /><span className="ml-1 d-none d-md-inline">??????</span>
                                </Button>
                            </Fragment>
                        };
                    })}
                columns={[
                    { dataField: 'name', text: '??????', sort: true },
                    { dataField: 'using', text: '????????????', sort: true },
                    { dataField: 'action', text: '', classes: 'p-2' }
                ]}
                pagination={paginationFactory({})}
                noDataIndication={() => (<div className="text-center">???????????????????????????</div>)}
            />
            <div className="text-left mb-2 mt-2">
                <Link href="/maps/[id]" as={`/maps/${newMapRef.id}`} passHref>
                    <Button tag="a">??????</Button>
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