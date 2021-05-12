import firebase from 'firebase';
import { Fragment, useState } from "react";
import MessageModal from "./MessageModal";
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label } from "reactstrap";
import { Map as MapIcon } from 'react-bootstrap-icons';

interface Props {
    back: () => void;
    save: (name: string) => void;
}

export default function AddMapModal(props: Props) {
    const [name, setName] = useState('');
    const [displayNameError, setDisplayNameError] = useState(undefined as string | undefined);

    const messageModalProps = {
        modalHeaderContents: <Fragment>
            <MapIcon className="mb-1 mr-2" />地図追加
        </Fragment>,
        modalProps: {
            isOpen: true,
            backdrop: 'static' as (boolean | 'static'),
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.back}>戻る</Button>
            <Button onClick={() => {
                if (name.length === 0) {
                    setDisplayNameError('名前は必須です。');
                } else if (name.length > 8) {
                    setDisplayNameError('名前が長すぎます。');
                } else {
                    props.save(name);
                }
            }}>保存</Button>
        </Fragment >
    };

    return <MessageModal {...messageModalProps}>
        <Form>
            <FormGroup>
                <Label for="name">名前</Label>
                <Input id="name" type="text"
                    defaultValue={name}
                    className={displayNameError ? 'is-invalid' : ''}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                {
                    displayNameError
                    &&
                    <FormFeedback>{displayNameError}</FormFeedback>
                }
                <FormText>名前は必須です。8文字以内で入力してください。</FormText>
            </FormGroup>
        </Form>
    </MessageModal >;
}