import '../utils/InitializeFirebase';
import firebase from 'firebase';
import React, { Fragment } from 'react';
import { useState } from 'react';
import { Nav, NavItem, Navbar, NavbarBrand, NavbarToggler, Collapse, NavLink, Badge } from 'reactstrap';
import { BoxArrowLeft, PersonCircle } from 'react-bootstrap-icons';
import { PageRoles, PageRoleBadgeColor } from '../types/role';
import { User } from '../types/model';
import AccountModal from '../components/AccountModal';
import { useRouter } from 'next/router';

export interface Props {
    authUser: firebase.User | undefined;
    user: User | undefined;
    pageRole: PageRoles | undefined;
}

const auth = firebase.auth();

export default function Header(props: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayAccountModal, setDisplayAccountModal] = useState(false);
    const router = useRouter();

    return (
        <Navbar color="light" light expand="md">
            <NavbarBrand href="#" className="mr-2">地図マネージャ</NavbarBrand>
            {
                props.pageRole
                &&
                <Badge
                    color={PageRoleBadgeColor[props.pageRole]}
                    className="mr-auto mt-1"
                >
                    {props.pageRole}
                </Badge>
            }
            {
                props.authUser
                &&
                props.user
                &&
                <Fragment>
                    <NavbarToggler onClick={() => { setIsOpen(!isOpen); }} />
                    <Collapse isOpen={isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setDisplayAccountModal(true);
                                }}>
                                    <PersonCircle className="mr-1 mb-1" />
                                    アカウント
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="#" onClick={(e) => {
                                    auth.signOut();
                                    router.push('/users/login');
                                }}>
                                    <BoxArrowLeft className="mr-1 mb-1" />
                                    ログアウト
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                    {
                        displayAccountModal
                        &&
                        <AccountModal
                            authUser={props.authUser}
                            user={props.user}
                            toggle={() => { setDisplayAccountModal(false); }}
                        />
                    }
                </Fragment>
            }
        </Navbar>
    );
}
