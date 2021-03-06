import { Fragment, useEffect, useState } from "react";
import firebase from 'firebase';
import { Button, Form, FormFeedback, FormGroup, FormText, Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";
import MessageModal from "./MessageModal";
import { Status, Pins, StatusType, StatusCollectionName } from '../types/model';
import { getMarkerUrl } from '../utils/markerUtil';
import { ExclamationCircle, Gear } from "react-bootstrap-icons";
import OkModal from "./OkModal";

interface Props {
    type: StatusType,
    statusMap: Map<string, Status>,
    toggle: () => void
}

const db = firebase.firestore();

export default function AddStatusModal(props: Props) {
    const [data, setData] = useState({
        name: '',
        number: props.statusMap.size + 1,
        pin: Pins.yellow,
        label: '',
        statusAfterResetingRef: null
    } as Status);
    const [displayNameError, setDisplayNameError] = useState(false);
    const [displayLabelError, setDisplayLabelError] = useState(false);
    const [displayErrorModal, setDisplayErrorModal] = useState(false);

    useEffect(() => {
        setDisplayNameError(data.name.length > 8);
        setDisplayLabelError(data.label.length > 4);
    }, [data]);

    const collectionName = StatusCollectionName[props.type];

    const onClickSaveButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (displayNameError || displayLabelError) {
            setDisplayErrorModal(true);
            return;
        }
        const batch = firebase.firestore().batch();
        Array.from(props.statusMap.entries()).forEach(([id, status]) => {
            if (status.number >= data.number) {
                batch.update(db.collection(collectionName).doc(id), {
                    number: firebase.firestore.FieldValue.increment(1)
                });
            }
        });
        const newStatusRef = db.collection(collectionName).doc();
        batch.set(newStatusRef, data);
        batch.commit();
        props.toggle();
    };

    const messageModalProps = {
        modalHeaderProps: {
            toggle: props.toggle,
        },
        modalHeaderContents: <Fragment>
            <Gear className="mb-1 mr-2" />
            {props.type === StatusType.HouseOrRoom ? '?????????????????????????????????' : '?????????????????????????????????'}
        </Fragment>,
        modalProps: {
            isOpen: true,
            toggle: props.toggle,
        },
        modalFooterContents: <Fragment>
            <Button onClick={props.toggle}>???????????????</Button>
            <Button onClick={onClickSaveButton}>??????</Button>
        </Fragment>
    };

    return <MessageModal {...messageModalProps}>
        <Form>
            <FormGroup>
                <Label for="name">??????</Label>
                <Input id="name" type="text"
                    defaultValue={data.name}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.name = e.target.value;
                        setData(newData);
                    }}
                    className={displayNameError ? 'is-invalid' : ''}
                />
                {
                    displayNameError
                    &&
                    <FormFeedback>???????????????????????????</FormFeedback>
                }
                <FormText>8??????????????????????????????????????????</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="number">??????</Label>
                <Input id="number" type="select"
                    defaultValue={data.number}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.number = Number(e.target.value);
                        setData(newData);
                    }}
                >
                    {
                        Array.from({ length: props.statusMap.size + 1 }, (v, i) => i + 1)
                            .map(x => <option key={x} value={x}>{x}</option>)
                    }
                </Input>
                <FormText>???????????????????????????????????????1??????????????????????????????????????????????????????????????????????????????????????????????????????</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="pin">??????</Label>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                            <img src={getMarkerUrl(data.pin)} height="24px" />
                        </InputGroupText>
                    </InputGroupAddon>
                    <Input id="pin" type="select"
                        defaultValue={data.pin}
                        onChange={(e) => {
                            const newData = { ...data };
                            newData.pin = e.target.value;
                            setData(newData);
                        }}
                    >
                        {
                            Object.keys(Pins).map((x, i) => <option key={i} value={x}>{x}</option>)
                        }
                    </Input>
                </InputGroup>
                <FormText>?????????????????????????????????????????????</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="label">?????????</Label>
                <Input id="label" type="text"
                    defaultValue={data.label}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.label = e.target.value;
                        setData(newData);
                    }}
                    className={displayLabelError ? 'is-invalid' : ''}
                />
                {
                    displayLabelError
                    &&
                    <FormFeedback>??????????????????????????????</FormFeedback>
                }
                <FormText>4???????????????????????????????????????????????????????????????????????????</FormText>
            </FormGroup>
            <FormGroup>
                <Label for="statusAfterReseting">??????????????????????????????</Label>
                <Input id="statusAfterReseting" type="select"
                    defaultValue={data.statusAfterResetingRef ? data.statusAfterResetingRef.id : ''}
                    onChange={(e) => {
                        const newData = { ...data };
                        newData.statusAfterResetingRef = e.target.value ?
                            db.collection(collectionName).doc(e.target.value)
                            :
                            null;
                        setData(newData);
                    }}
                >
                    <option value=''></option>
                    {
                        Array.from(props.statusMap).map(([id, x]) => <option key={id} value={id}>{x.name}</option>)
                    }
                </Input>
                <FormText>??????????????????????????????????????????????????????????????????????????????????????????????????????</FormText>
            </FormGroup>
        </Form>
        {
            displayErrorModal
            &&
            <OkModal
                header={<Fragment>
                    <ExclamationCircle className="mb-1 mr-2" />?????????
                    </Fragment>}
                zIndex={2000}
                toggle={() => { setDisplayErrorModal(false); }}
                ok={() => { setDisplayErrorModal(false); }}
            >
                <div>?????????????????????????????????</div>
            </OkModal>
        }
    </MessageModal>;
}