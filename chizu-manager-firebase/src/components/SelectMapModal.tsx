import firebase from 'firebase';
import MessageModal from "./MessageModal";
import { Badge, Button, Form, FormGroup, Input, Label, ListGroup, ListGroupItem } from "reactstrap";
import { MapData } from '../types/map';
import { PageRoleBadgeColor, PageRoles } from '../types/role';
import { useState } from 'react';

interface Props {
    staticMode: boolean;
    userRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
    mapDataArray: MapData[];
    select: (id: string) => void;
    toggle: () => void;
}

export default function SelectMapModal(props: Props) {
    const [keyword, setKeyword] = useState('');

    const messageModalProps = props.staticMode ?
        {
            modalHeaderContents: '地図選択',
            modalProps: {
                isOpen: true,
                backdrop: 'static' as (boolean | 'static'),
            }
        }
        :
        {
            modalHeaderProps: {
                toggle: props.toggle,
            },
            modalHeaderContents: '地図選択',
            modalProps: {
                isOpen: true,
                toggle: props.toggle,
            },
            modalFooterContents: <Button onClick={props.toggle}>閉じる</Button>
        };

    return <MessageModal {...messageModalProps}>
        <Form inline className="mb-2">
            <FormGroup>
                <Label className="mr-2">検索</Label>
                <Input type="text" onChange={(e) => { setKeyword(e.target.value); }} />
            </FormGroup>
        </Form>
        <ListGroup>
            {props.mapDataArray.filter(x => x.name.includes(keyword)).map(x => {
                let role = PageRoles.User;
                if (x.managers.some(x => x.isEqual(props.userRef))) {
                    role = PageRoles.Manager;
                } else if (x.allEditable || x.editors.some(x => x.isEqual(props.userRef))) {
                    role = PageRoles.Editor;
                }
                return <ListGroupItem
                    key={x.id}
                    tag="a"
                    href="#"
                    className="text-center"
                    onClick={(e) => {
                        e.preventDefault();
                        props.select(x.id);
                        props.toggle();
                    }}
                >
                    <Badge color={PageRoleBadgeColor[role]} className="mr-3">{role}</Badge>
                    {x.name}
                </ListGroupItem>;
            })}
        </ListGroup>
    </MessageModal>;
}