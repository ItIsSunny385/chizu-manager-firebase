import { Fragment, useState } from "react";
import MessageModal from "./MessageModal";
import { Button, Form, FormFeedback, FormGroup, FormText, Input, Label } from "reactstrap";
import FlashMessage, { Props as FlashMessageProps } from "./FlashMessage";
import { Colors } from "../types/bootstrap";
import { ArrowRepeat, InfoCircle } from "react-bootstrap-icons";

interface Props {
    name: string,
    using: boolean,
    updateNameAndUsing: (name: string, using: boolean) => void
    reset: () => void,
    toggle: () => void,
}

export default function MapSettingModal(props: Props) {
    const [name, setName] = useState(props.name);
    const [displayNameError, setDisplayNameError] = useState(undefined as string | undefined);
    const [using, setUsing] = useState(props.using);
    const [flashMessageProps, setFlashMessageProps] = useState(undefined as FlashMessageProps | undefined);

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: '地図設定',
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
        <div className="mb-5">
            <h4 className="mb-3"><InfoCircle className="mb-1 mr-2" />地図情報</h4>
            <Form>
                <FormGroup>
                    <Label>名前</Label>
                    <Input type="text"
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
                <FormGroup>
                    <Label>使用状況</Label>
                    <Input
                        type="select"
                        defaultValue={using ? 'true' : 'false'}
                        onChange={(e) => {
                            setUsing(e.target.value === 'true');
                        }}
                    >
                        <option value="false">不使用</option>
                        <option value="true">使用中</option>
                    </Input>
                    <FormText>使用中から不使用に更新すると一般ユーザは使用できなくなります。</FormText>
                </FormGroup>
                <Button onClick={(e) => {
                    e.preventDefault();
                    if (name.length === 0) {
                        setDisplayNameError('名前は必須です。');
                    } else if (name.length > 8) {
                        setDisplayNameError('名前が長すぎます。');
                    } else {
                        setDisplayNameError(undefined);
                        if (props.name !== name || props.using !== using) {
                            props.updateNameAndUsing(name, using);
                        }
                        setFlashMessageProps({
                            color: Colors.Success,
                            message: '地図情報を更新しました。',
                            className: 'mt-0',
                            close: () => { setFlashMessageProps(undefined); }
                        });
                    }
                }}>更新</Button>
            </Form>
        </div>
        <div>
            <h4 className="mb-3"><ArrowRepeat className="mb-1 mr-2" />ステータスリセット  </h4>
            <div className="mb-3">家・建物・部屋のステータスをリセットします。</div>
            <Button onClick={() => {
                props.reset();
                setFlashMessageProps({
                    color: Colors.Success,
                    message: '家・建物・部屋のステータスをリセットしました。',
                    className: 'mt-0',
                    close: () => { setFlashMessageProps(undefined); }
                });
            }}>リセット</Button>
        </div>
    </MessageModal>;
}