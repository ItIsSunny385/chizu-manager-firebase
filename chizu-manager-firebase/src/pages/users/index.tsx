import { useState, useEffect, Fragment, useRef } from 'react';
import firebase from 'firebase';
import AdminApp from '../../components/AdminApp';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import ConfirmDeletionModal from '../../components/ConfirmDeletionModal';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import '../../utils/InitializeFirebase';
import { User } from '../../types/model';
import { Props as FlashMessageProps } from '../../components/FlashMessage';
import { Colors } from '../../types/bootstrap';
import { PageRoles } from '../../types/role';
import { useRouter } from 'next/router';
import { getUser, listeningUserMap } from '../../utils/userUtil';
import { removeMapUser } from '../../utils/mapUtil';
import { Pencil, Trash } from 'react-bootstrap-icons';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Index() {
    const [initial, _setInitial] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userMap, setUserMap] = useState(new Map<string, User>());
    const [displayAddModal, setDisplayAddModal] = useState(false);
    const [editId, setEditId] = useState(undefined as string | undefined);
    const [deleteId, setDeleteId] = useState(undefined as string | undefined);
    const [flashMessageProps, setFlashMessageProps] = useState(undefined as FlashMessageProps | undefined);
    const [keyword, setKeyword] = useState('');
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [unsubscribes, _setUnsubscribes] = useState<(() => void)[]>([]);
    const router = useRouter();

    const initialRef = useRef(initial);
    const setInitial = (data: boolean) => {
        initialRef.current = data;
        _setInitial(data);
    };

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
            const unsubscribe = listeningUserMap(
                db.collection('users').where('deleted', '==', false).orderBy('displayName', 'asc'),
                (newUserMap) => {
                    setUserMap(newUserMap);
                    if (initialRef.current) {
                        setInitial(false);
                        setLoading(false);
                    }
                }
            );
            setUnsubscribes([unsubscribe]);
        }
    }, [user]);

    return (
        <AdminApp
            authUser={authUser}
            user={user}
            activeTabId={2}
            pageTitle="ユーザ一覧"
            pageRole={PageRoles.Administrator}
            loading={loading}
            flashMessageProps={flashMessageProps}
            unsubscribes={unsubscribesRef.current}
        >
            <Form inline className="mb-2">
                <FormGroup>
                    <Label className="mr-2">表示名検索</Label>
                    <Input type="text" onChange={(e) => { setKeyword(e.target.value); }} />
                </FormGroup>
            </Form>
            <BootstrapTable
                bootstrap4
                keyField='fullId'
                data={Array.from(userMap.entries())
                    .filter(([id, x]) => x.displayName.includes(keyword))
                    .map(([id, x]) => {
                        return {
                            fullId: id,
                            id: id.substr(0, 10) + '...',
                            displayName: x.displayName,
                            role: x.isAdmin ? '管理者' : '一般ユーザ',
                            action:
                                <Fragment>
                                    <Button
                                        className="mr-1"
                                        size="sm"
                                        onClick={() => { setEditId(id); }}
                                    >
                                        <Pencil className="mb-1" /><span className="ml-1 d-none d-md-inline">編集</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={Colors.Danger}
                                        onClick={() => { setDeleteId(id); }}
                                    >
                                        <Trash className="mb-1" /><span className="ml-1 d-none d-md-inline">削除</span>
                                    </Button>
                                </Fragment>,
                        };
                    })}
                columns={[
                    { dataField: 'displayName', text: '表示名', sort: true },
                    { dataField: 'role', text: '権限', sort: true },
                    { dataField: 'action', text: '', classes: 'p-2' },
                ]}
                pagination={paginationFactory({})}
                noDataIndication={() => (<div className="text-center">データがありません</div>)}
            />
            <div className="text-left mb-2 mt-2">
                <Button onClick={() => { setDisplayAddModal(true); }} className="ml-1">追加</Button>
            </div>
            {
                displayAddModal
                &&
                <AddUserModal
                    userMap={userMap}
                    setLoading={setLoading}
                    toggle={() => {
                        setDisplayAddModal(false);
                        document.scrollingElement!.scrollTop = 0;
                        setLoading(false);
                    }}
                    setFlashMessage={(color, message) => {
                        setFlashMessageProps({
                            color: color,
                            message: message,
                            close: () => { setFlashMessageProps(undefined); }
                        });
                    }}
                />
            }
            {
                editId
                &&
                authUser
                &&
                <EditUserModal
                    authUser={authUser}
                    id={editId}
                    userMap={userMap}
                    setLoading={setLoading}
                    toggle={() => {
                        setEditId(undefined);
                        document.scrollingElement!.scrollTop = 0;
                        setLoading(false);
                    }}
                    update={async (removeMapUserFlg, newData) => {
                        const batch = db.batch();
                        batch.update(db.collection('users').doc(editId), newData);
                        if (removeMapUserFlg) {
                            const userRef = db.collection('users').doc(editId);
                            await removeMapUser(db.collection('maps'), batch, userRef);
                        }
                        await batch.commit();
                    }}
                    setFlashMessage={(color, message) => {
                        setFlashMessageProps({
                            color: color,
                            message: message,
                            close: () => { setFlashMessageProps(undefined); }
                        });
                    }}
                />
            }
            {
                deleteId
                &&
                <ConfirmDeletionModal
                    toggle={() => { setDeleteId(undefined); }}
                    delete={() => {
                        const deleteFunc = async () => {
                            const batch = db.batch();
                            const userRef = db.collection('users').doc(deleteId);
                            batch.update(userRef, { deleted: true });
                            const deleteAuthUserRef = db.collection('delete_auth_users').doc(deleteId);
                            batch.set(deleteAuthUserRef, { uid: deleteId });
                            /* 地図にユーザが設定されていた場合は地図から削除 */
                            const targetUser = userMap.get(deleteId);
                            if (!targetUser!.isAdmin) {
                                await removeMapUser(db.collection('maps'), batch, userRef);
                            }
                            try {
                                await batch.commit();
                                if (authUser && deleteId === authUser.uid) {
                                    // ログインユーザを削除した場合はログアウト
                                    auth.signOut();
                                    router.push('/users/login');
                                    return;
                                }
                                setFlashMessageProps({
                                    color: Colors.Success,
                                    message: 'ユーザを削除しました。',
                                    close: () => { setFlashMessageProps(undefined); }
                                });
                            } catch (error) {
                                console.log(error);
                                setFlashMessageProps({
                                    color: Colors.Danger,
                                    message: 'ユーザの削除に失敗しました。',
                                    close: () => { setFlashMessageProps(undefined); }
                                });
                            }
                        };
                        deleteFunc();
                        setDeleteId(undefined);
                    }}
                />
            }
        </AdminApp>
    );
}