import * as React from 'react';
import { useState, useEffect } from 'react';
import { Nav, NavItem, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink } from 'reactstrap';
import { BoxArrowLeft, PersonCircle } from 'react-bootstrap-icons';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = (() => setIsOpen(!isOpen));

    return (
        <Navbar color="light" light expand="md">
            <NavbarBrand href="#">地図マネージャ</NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
                <Nav className="ml-auto" navbar>
                    <NavItem>
                        <NavLink href="#">
                            <PersonCircle className="mr-1 mb-1" />
                            アカウント
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink href="#">
                            <BoxArrowLeft className="mr-1 mb-1" />
                            ログアウト
                        </NavLink>
                    </NavItem>
                </Nav>
            </Collapse>
        </Navbar>
    );
}
