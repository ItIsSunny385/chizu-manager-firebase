import React, { Fragment, useState } from 'react';
import { Button, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Room } from '../types/map';
import { Status } from '../types/model';
import { ChatTextFill } from 'react-bootstrap-icons';
import CommentModal from './CommentModal';
import { Colors } from '../types/bootstrap';

interface Props {
    data: Room;
    statusMap: Map<string, Status>;
    updateStatus: (statusId: string) => void;
    updateComment: (comment: string | null) => void;
}

export default function BuildingMarkerRoomInfo(props: Props) {
    const [displayComment, setDisipalyComment] = useState(false);

    return <Fragment>
        <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
                <InputGroupText>{props.data.roomNumber}</InputGroupText>
            </InputGroupAddon>
            <Input
                type="select"
                value={props.data.statusRef.id}
                onChange={(e) => { props.updateStatus(e.target.value); }}
            >
                {
                    Array.from(props.statusMap.entries())
                        .map(([id, status]) => <option key={id} value={id}>{status.name}</option>)
                }
            </Input>
            <InputGroupAddon addonType="append">
                <Button
                    color={props.data.comment ? Colors.Danger : Colors.Secondary}
                    onClick={(e) => { setDisipalyComment(true); }}
                >
                    <ChatTextFill />
                </Button>
            </InputGroupAddon>
        </InputGroup>
        {
            displayComment
            &&
            <CommentModal
                data={props.data.comment}
                save={(newData) => { props.updateComment(newData); }}
                toggle={() => { setDisipalyComment(false); }}
            />
        }
    </Fragment>;
}