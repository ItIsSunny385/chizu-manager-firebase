import { Fragment } from "react";
import MessageModal from "./MessageModal";
import { Button } from "reactstrap";
import { ArrowRepeat } from 'react-bootstrap-icons';
import { Colors } from '../types/bootstrap';

interface Props {
    toggle: () => void;
    reset: () => void;
}

export default function ConfirmResetingModal(props: Props) {
    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <ArrowRepeat className="mb-1 mr-2" />リセットの確認
        </Fragment>,
        modalProps: {
            isOpen: true,
            zIndex: 2000,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>キャンセル</Button>
            <Button color={Colors.Danger} onClick={props.reset}>リセット</Button>
        </Fragment >
    };

    return <MessageModal {...messageModalProps}>
        <div>本当にリセットしてもよろしいですか？</div>
    </MessageModal>;
}