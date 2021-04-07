import { useState, useEffect, MouseEvent } from 'react';
import { useRouter } from 'next/router';
import App from '../../components/App';
import NavTabs from '../../components/NavTabs';
import { Container, Breadcrumb, BreadcrumbItem, Button } from 'reactstrap';
import { PeopleFill } from 'react-bootstrap-icons';

export default function Index() {
    const router = useRouter();

    const onClickAddButton = ((e: MouseEvent) => {
        e.preventDefault();
        router.push('/users/add');
    });

    return (
        <App>
            <NavTabs activeTabId={2} />
            <h4 className="mb-3 mt-3"><PeopleFill className="mb-1 mr-2" />ユーザ一覧</h4>
            <div className="text-left mb-2">
                <Button onClick={onClickAddButton} className="ml-1">追加</Button>
            </div>
        </App>
    );
}