import '../utils/InitializeFirebase';
import firebase from 'firebase';
import { Fragment, useState } from "react";
import MessageModal from "./MessageModal";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import FlashMessage from "./FlashMessage";
import { Colors } from "../types/bootstrap";
import Select from 'react-select';
import { User } from '../types/model';
import { MapData } from '../types/map';

interface Props {
    userMap: Map<string, User>;
    data: MapData;
    editable: boolean;
    update: (
        managers: firebase.firestore.DocumentReference[],
        allEditable: boolean,
        editors: firebase.firestore.DocumentReference[],
        allUsable: boolean,
        users: firebase.firestore.DocumentReference[]
    ) => void;
    toggle: () => void;
}

const db = firebase.firestore();

export default function MapUsersModal(props: Props) {
    const [flashMessageProps, setFlashMessageProps] = useState(
        props.data.using ?
            props.editable ?
                undefined
                :
                {
                    color: Colors.Info,
                    message: 'ユーザ設定は管理者かマネージャにご依頼ください。',
                    className: 'mt-0',
                    close: () => { setFlashMessageProps(undefined); }
                }
            :
            {
                color: Colors.Warning,
                message: '使用中ではないため、ユーザ設定をしてもユーザは利用できません。',
                className: 'mt-0',
                close: () => { setFlashMessageProps(undefined); }
            }

    );
    const [options] = useState(
        Array.from(props.userMap.entries()).map(([id, x]) => {
            return { value: id, label: x.displayName };
        })
    );
    const [managerIds, setManagerIds] = useState(props.data.managers.map(x => x.id));
    const [allEditable, setAllEditable] = useState(props.data.allEditable);
    const [editorIds, setEditorIds] = useState(props.data.editors.map(x => x.id));
    const [allUsable, setAllUsable] = useState(props.data.allUsable);
    const [userIds, setUserIds] = useState(props.data.users.map(x => x.id));

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: 'ユーザ設定',
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>閉じる</Button>
        </Fragment >
    };

    return <MessageModal {...messageModalProps}>
        {
            flashMessageProps
            &&
            <FlashMessage {...flashMessageProps} />
        }
        <Form>
            <div className="mb-4">
                <h5>マネージャ</h5>
                <Select
                    isDisabled={!props.editable}
                    value={managerIds.map(x => ({ value: x, label: props.userMap.get(x)!.displayName }))}
                    isMulti
                    name="managers"
                    options={options}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(value) => { setManagerIds(value.map(x => x.value)); }}
                />
            </div>
            <div className="mb-4">
                <h5>編集者</h5>
                <FormGroup check className="mb-1">
                    <Label check>
                        <Input
                            type="checkbox"
                            disabled={!props.editable}
                            checked={allEditable}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setEditorIds([]);
                                    setAllUsable(false);
                                    setUserIds([]);
                                }
                                setAllEditable(e.target.checked);
                            }}
                        />{' '}全員編集可
                    </Label>
                </FormGroup>
                <Select
                    isDisabled={allEditable || !props.editable}
                    value={editorIds.map(x => ({ value: x, label: props.userMap.get(x)!.displayName }))}
                    isMulti
                    name="editors"
                    options={options}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(value) => { setEditorIds(value.map(x => x.value)); }}
                />
            </div>
            <div className="mb-4">
                <h5>利用者</h5>
                <FormGroup check className="mb-1">
                    <Label check>
                        <Input
                            disabled={allEditable || !props.editable}
                            type="checkbox"
                            checked={allUsable}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setUserIds([]);
                                }
                                setAllUsable(e.target.checked);
                            }}
                        />{' '}全員利用可
                    </Label>
                </FormGroup>
                <Select
                    isDisabled={allUsable || allEditable || !props.editable}
                    value={userIds.map(x => ({ value: x, label: props.userMap.get(x)!.displayName }))}
                    isMulti
                    name="users"
                    options={options}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(value) => { setUserIds(value.map(x => x.value)); }}
                />
            </div>
            {
                props.editable
                &&
                <Button onClick={(e) => {
                    props.update(
                        managerIds.map(x => db.collection('users').doc(x)),
                        allEditable,
                        editorIds.map(x => db.collection('users').doc(x)),
                        allUsable,
                        userIds.map(x => db.collection('users').doc(x))
                    );
                    setFlashMessageProps({
                        color: Colors.Success,
                        message: 'ユーザ設定を更新しました。',
                        className: 'mt-0',
                        close: () => { setFlashMessageProps(undefined); }
                    });
                }}>更新</Button>
            }
        </Form>
    </MessageModal>;
}