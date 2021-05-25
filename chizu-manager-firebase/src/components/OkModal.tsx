import MessageModal from "./MessageModal";
import { Button } from "reactstrap";

interface Props {
    header: any;
    children?: any;
    zIndex: number;
    toggle: () => void;
    ok: () => void;
}

export default function ConfirmDeletionModal(props: Props) {
    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: props.header,
        modalProps: {
            isOpen: true,
            zIndex: props.zIndex,
            toggle: props.toggle,
        },
        modalFooterContents: <Button onClick={props.toggle}>OK</Button>
    };

    return <MessageModal {...messageModalProps}>
        {props.children}
    </MessageModal>;
}