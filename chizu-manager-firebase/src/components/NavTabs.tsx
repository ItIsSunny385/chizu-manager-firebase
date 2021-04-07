import * as React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';

interface Props {
    activeTabId: Number;
}

export default function NavTabs({ activeTabId }: Props) {
    return (
        <Nav tabs className="mt-2">
            <NavItem>
                <NavLink className={classnames({ active: activeTabId === 1 })}>
                    <MapFill className="mr-1 mb-1" />
                    地図
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink className={classnames({ active: activeTabId === 2 })}>
                    <PeopleFill className="mr-1 mb-1" />
                    ユーザ
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink className={classnames({ active: activeTabId === 3 })}>
                    <GearFill className="mr-1 mb-1" />
                    設定
                </NavLink>
            </NavItem>
        </Nav>
    );
}