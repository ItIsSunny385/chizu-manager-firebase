import React, { Fragment, useState } from 'react';
import { Button, Input, InputGroup, InputGroupAddon, InputGroupText, Tooltip } from 'reactstrap';
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

const DISPLAY_ROOM_NUMBER_LENGTH = 4;

export default function BuildingMarkerRoomInfo(props: Props) {
    const [displayComment, setDisipalyComment] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    return <Fragment>
        <InputGroup size="sm">
            <InputGroupAddon id={props.data.id} addonType="prepend">
                {
                    props.data.roomNumber.length <= DISPLAY_ROOM_NUMBER_LENGTH
                        ?
                        <InputGroupText>{props.data.roomNumber}</InputGroupText>
                        :
                        <InputGroupText
                            onClick={() => { setTooltipOpen(!tooltipOpen); }}
                        >
                            {props.data.roomNumber.substr(0, DISPLAY_ROOM_NUMBER_LENGTH) + '...'}
                        </InputGroupText>
                }
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
        {
            props.data.roomNumber.length > DISPLAY_ROOM_NUMBER_LENGTH
            &&
            tooltipOpen
            &&
            <Tooltip
                placement="bottom"
                isOpen={tooltipOpen}
                target={props.data.id}
                toggle={() => { setTooltipOpen(!tooltipOpen); }}
            >
                {props.data.roomNumber}
            </Tooltip>
        }
    </Fragment >;
}