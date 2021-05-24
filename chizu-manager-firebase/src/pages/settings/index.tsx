import firebase from 'firebase';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import AdminApp from '../../components/AdminApp';
import StatusList from '../../components/StatusList';
import { StatusType, User } from '../../types/model';
import { PageRoles } from '../../types/role';
import '../../utils/InitializeFirebase';
import { getUser } from '../../utils/userUtil';

const auth = firebase.auth();

export default function Index() {
    const [statusListLoading, setStatusListLoading] = useState(true);
    const [buildingStatusListLoading, setBuildingStatusListLoading] = useState(true);
    const [authUser, setAuthUser] = useState(undefined as firebase.User | undefined);
    const [user, setUser] = useState(undefined as User | undefined);
    const [unsubscribes, _setUnsubscribes] = useState<(() => void)[]>([]);
    const router = useRouter();

    const unsubscribesRef = useRef(unsubscribes);
    const setUnsubscribes = (unsubscribes: (() => void)[]) => {
        unsubscribesRef.current = unsubscribes;
        _setUnsubscribes(unsubscribes);
    };
    const addUnsubscribe = (unsubscribe: () => void) => {
        const newUnsubscribes = [...unsubscribesRef.current, unsubscribe];
        setUnsubscribes(newUnsubscribes);
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
        if (user && !user.isAdmin) {
            router.push('/users/login');
        }
    }, [user])

    return (
        <AdminApp
            authUser={authUser}
            user={user}
            activeTabId={3}
            pageTitle="設定"
            pageRole={PageRoles.Administrator}
            loading={statusListLoading || buildingStatusListLoading}
            unsubscribes={unsubscribesRef.current}
        >
            {
                authUser
                &&
                user
                &&
                user.isAdmin
                &&
                <Fragment>
                    <div className="mt-4">
                        <StatusList
                            loaded={() => { setStatusListLoading(false); }}
                            type={StatusType.HouseOrRoom}
                            addUnsubscribe={addUnsubscribe}
                        />
                    </div>
                    <div className="mt-5">
                        <StatusList
                            loaded={() => { setBuildingStatusListLoading(false); }}
                            type={StatusType.Building}
                            addUnsubscribe={addUnsubscribe}
                        />
                    </div>
                </Fragment>
            }
        </AdminApp>
    );
}