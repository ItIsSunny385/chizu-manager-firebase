import { Fragment, useEffect, useState } from "react";
import MessageModal from "./MessageModal";
import { Button, ButtonGroup, Form, FormFeedback, FormGroup, FormText, Input, Label } from "reactstrap";
import { PencilSquare, Save, Trash } from 'react-bootstrap-icons';

interface Props {
    data: string | null;
    save: (newData: string | null) => void;
    toggle: () => void;
}

export default function CommentModal(props: Props) {
    const [data, setData] = useState(props.data);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState(undefined as string | undefined);

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: 'コメント',
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>閉じる</Button>
        </Fragment>
    };

    return <MessageModal {...messageModalProps}>
        <Form>
            <ButtonGroup size="sm" className="text-right d-block mb-1"      >
                {
                    editMode
                        ?
                        <Button onClick={(e) => {
                            if (data && data.length > 256) {
                                setError('長すぎます。');
                                return;
                            }
                            setError(undefined);
                            setEditMode(false);
                            props.save(data);
                        }}>
                            <Save className="mb-1 mr-1" />保存
                        </Button>
                        :
                        <Button onClick={(e) => { setEditMode(true); }}>
                            <PencilSquare className="mb-1 mr-1" />編集
                        </Button>
                }
                <Button onClick={(e) => { props.save(null); setEditMode(false); }}>
                    <Trash className="mb-1 mr-1" />削除
                </Button>
            </ButtonGroup>
            <Input
                type="textarea"
                value={data ? data : undefined}
                readOnly={!editMode}
                className={error ? 'is-invalid' : ''}
                onChange={(e) => { setData(e.target.value ? e.target.value : null); }}
            />
            {
                error
                &&
                <FormFeedback>{error}</FormFeedback>
            }
            <FormText>256文字以内で入力してください。</FormText>
        </Form>
    </MessageModal>;
}