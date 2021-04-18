import { Children } from 'react';
import { Modal, ModalHeader, ModalHeaderProps, ModalBodyProps, ModalBody, ModalFooter, ModalFooterProps, ModalProps } from 'reactstrap';

export interface MessageModalProps {
    modalProps?: ModalProps;
    modalHeaderContents?: any;
    modalHeaderProps?: ModalHeaderProps;
    modalBodyProps?: ModalBodyProps;
    children: any;
    modalFooterProps?: ModalFooterProps;
    modalFooterContents?: any;
}

export default function MessageModal(props: MessageModalProps) {
    return (
        <Modal {...props.modalProps}>
            {
                props.modalHeaderProps
                &&
                <ModalHeader {...props.modalHeaderProps}>{props.modalHeaderContents}</ModalHeader>
            }
            <ModalBody {...props.modalBodyProps}>{props.children}</ModalBody>
            {
                props.modalFooterContents
                &&
                <ModalFooter {...props.modalFooterProps}>{props.modalFooterContents}</ModalFooter>
            }
        </Modal>
    );
}