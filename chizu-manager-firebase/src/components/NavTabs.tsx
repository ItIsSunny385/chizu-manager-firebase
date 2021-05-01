import * as React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { GearFill, MapFill, PeopleFill } from 'react-bootstrap-icons';

interface Props {
    activeTabId: Number;
}

export default function NavTabs({ activeTabId }: Props) {
    return (
        <Nav tabs className="mt-2">
            <NavItem>
                <NavLink active={activeTabId === 1} href="/maps">
                    <MapFill className="mr-1 mb-1" />
                    地図
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTabId === 2} href="/users">
                    <PeopleFill className="mr-1 mb-1" />
                    ユーザ
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink active={activeTabId === 3} href="/settings">
                    <GearFill className="mr-1 mb-1" />
                    設定
                </NavLink>
            </NavItem>
        </Nav >
    );
}