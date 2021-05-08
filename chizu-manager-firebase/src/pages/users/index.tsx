import { useState, useEffect, MouseEvent, Fragment } from 'react';
import firebase from 'firebase';
import AdminApp from '../../components/AdminApp';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import { Button, Col, Form, FormGroup, Input, Label } from 'reactstrap';
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
import { getUser } from '../../utils/userUtil';

const db = firebase.firestore();
const auth = firebase.auth();

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [userMap, setUserMap] = useState(new Map<string, User>());
    const [displayAddModal, setDisplayAddModal] = useState(false);
    const [editId, setEditId] = useState(undefined as string | undefined);
    const [flashMessageProps, setFlashMessageProps] = useState(undefined as FlashMessageProps | undefined);
    const [keyword, setKeyword] = useState('');
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const router = useRouter();

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
    }, []);

    useEffect(() => {
        if (user) {
            if (!user.isAdmin) {
                router.push('/users/login');
                return;
            }
            db.collection('users').where('deleted', '==', false).onSnapshot((snapshot) => {
                const newUserMap = new Map<string, User>();
                snapshot.forEach((x) => {
                    newUserMap.set(x.id, {
                        displayName: x.data().displayName,
                        isAdmin: x.data().isAdmin,
                        deleted: x.data().deleted,
                    });
                });
                setUserMap(newUserMap);
                setLoading(false);
            });
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
                    .filter(([id, user]) => user.displayName.includes(keyword))
                    .map(([id, user]) => {
                        const onClickDeleteLink = async (e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
                            e.preventDefault();
                            setLoading(true);
                            const batch = db.batch();
                            const userRef = db.collection('users').doc(id);
                            batch.update(userRef, { deleted: true });
                            const deleteAuthUserRef = db.collection('delete_auth_users').doc(id);
                            batch.set(deleteAuthUserRef, { uid: id });
                            try {
                                await batch.commit();
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
                            document.scrollingElement!.scrollTop = 0;
                            setLoading(false);
                        };
                        const onClickEditLink = (e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
                            e.preventDefault();
                            setEditId(id);
                        };
                        return {
                            fullId: id,
                            id: id.substr(0, 10) + '...',
                            displayName: user.displayName,
                            role: user.isAdmin ? '管理者' : '一般ユーザ',
                            action:
                                <Fragment>
                                    <a className="mr-1" href="#" onClick={onClickEditLink}>編集</a>
                                    <a href="#" onClick={onClickDeleteLink}>削除</a>
                                </Fragment>,
                        };
                    })}
                columns={[
                    { dataField: 'id', text: 'ID', classes: 'd-none d-md-table-cell', headerClasses: 'd-none d-md-table-cell', sort: true },
                    { dataField: 'displayName', text: '表示名', sort: true },
                    { dataField: 'role', text: '権限', sort: true },
                    { dataField: 'action', text: '' },
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
                <EditUserModal
                    id={editId}
                    userMap={userMap}
                    setLoading={setLoading}
                    toggle={() => {
                        setEditId(undefined);
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
        </AdminApp>
    );
}