import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { MapData } from '../types/map';
import Link from 'next/link';

interface Props {
    data: MapData[],
}

export default function MapList(props: Props) {
    return <ListGroup>
        {
            props.data.length === 0
                ?
                <ListGroupItem className="text-center">データがありません。</ListGroupItem>
                :
                props.data.map(mapData => {
                    return <ListGroupItem
                        key={mapData.id}
                        className="text-center"
                        tag="a"
                        href={`/maps/${mapData.id}`}
                    >
                        <Badge color={mapData.using ? 'primary' : 'secondary'} className="mr-2">
                            {mapData.using ? '使用中' : '不使用'}
                        </Badge>
                        {mapData.name}
                    </ListGroupItem>;
                })
        }
    </ListGroup>;
}