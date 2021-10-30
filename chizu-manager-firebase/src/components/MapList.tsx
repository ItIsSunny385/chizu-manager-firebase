import { ListGroup, ListGroupItem, Badge, PaginationItem, Pagination, PaginationLink } from 'reactstrap';
import { MapData } from '../types/map';
import { Colors } from '../types/bootstrap';
import { Fragment, useState } from 'react';
import MyPagination from './MyPagination';
import { useEffect } from 'react';

interface Props {
    data: MapData[],
}

const NumItemOfAPage = 1;

export default function MapList(props: Props) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [props.data]);

    return props.data.length === 0
        ?
        <ListGroup>
            <ListGroupItem className="text-center">データがありません。</ListGroupItem>
        </ListGroup>
        :
        <Fragment>
            <ListGroup className="mb-2">
                {
                    props.data.slice(
                        NumItemOfAPage * (currentPage - 1),
                        Math.min(NumItemOfAPage * currentPage, props.data.length)
                    ).map(mapData => {
                        return <ListGroupItem
                            key={mapData.id}
                            className="text-center"
                            tag="a"
                            href={`/maps/${mapData.id}`}
                        >
                            <Badge
                                color={mapData.using ? Colors.Primary : Colors.Secondary}
                                className="mr-2"
                            >
                                {mapData.using ? '使用中' : '不使用'}
                            </Badge>
                            {mapData.name}
                        </ListGroupItem>;
                    })
                }
            </ListGroup>
            <MyPagination
                current={currentPage}
                max={Math.ceil(props.data.length / NumItemOfAPage)}
                onClick={(pageNum) => ((e) => { e.preventDefault(); setCurrentPage(pageNum); })}
            />
        </Fragment>;
}