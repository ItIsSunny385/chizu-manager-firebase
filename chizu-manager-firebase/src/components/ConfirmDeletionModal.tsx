import { Fragment } from "react";
import MessageModal from "./MessageModal";
import { Button } from "reactstrap";
import { Trash } from 'react-bootstrap-icons';
import { Colors } from '../types/bootstrap';

interface Props {
    toggle: () => void;
    delete: () => void;
}

export default function ConfirmDeletionModal(props: Props) {
    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <Trash className="mb-1 mr-2" />削除の確認
        </Fragment>,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button color={Colors.Danger} onClick={props.delete}>削除</Button>
        </Fragment >
    };

    return <MessageModal {...messageModalProps}>
        <div>本当に削除してもよろしいですか？</div>
    </MessageModal>;
}