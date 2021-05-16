import React, { Fragment } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';
import Link from 'next/link';

interface Props {
    activeTabId: number;
}

export default function NavTabs({ activeTabId }: Props) {
    return (
        <Nav tabs className="mt-2">
            <NavItem>
                <NavLink active={activeTabId === 1}>
                    {
                        activeTabId === 1
                            ?
                            <Fragment><MapFill className="mr-1 mb-1" />地図</Fragment>
                            :
                            <Link href="/maps"><a><MapFill className="mr-1 mb-1" />地図</a></Link>
                    }
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTabId === 2}>
                    {
                        activeTabId === 2
                            ?
                            <Fragment><PeopleFill className="mr-1 mb-1" />ユーザ</Fragment>
                            :
                            <Link href="/users"><a><PeopleFill className="mr-1 mb-1" />ユーザ</a></Link>
                    }
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTabId === 3}>
                    {
                        activeTabId === 3
                            ?
                            <Fragment><GearFill className="mr-1 mb-1" />設定</Fragment>
                            :
                            <Link href="/settings"><a><GearFill className="mr-1 mb-1" />設定</a></Link>
                    }
                </NavLink>
            </NavItem>
        </Nav >
    );
}