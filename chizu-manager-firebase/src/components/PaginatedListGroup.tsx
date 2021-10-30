import { ElementType, Fragment, useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import MyPagination from './MyPagination';

interface Props<T> {
    data: T[];
    getItem: (x: T) => JSX.Element;
    noData: JSX.Element;
    getKey?: (x: T) => string | null | undefined;
    getClassName?: (x: T) => string | undefined;
    getTag?: (x: T) => ElementType<any> | undefined;
    getHref?: (x: T) => string | undefined;
}

const NumItemOfAPage = 10;

export default function PaginatedListGroup<T>(props: Props<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [props.data]);

    return props.data.length === 0
        ?
        props.noData
        :
        <Fragment>
            <ListGroup className="mb-2">
                {
                    props.data.slice(
                        NumItemOfAPage * (currentPage - 1),
                        Math.min(NumItemOfAPage * currentPage, props.data.length)
                    ).map(x =>
                        <ListGroupItem
                            key={props.getKey && props.getKey(x)}
                            className={props.getClassName && props.getClassName(x)}
                            tag={props.getTag && props.getTag(x)}
                            href={props.getHref && props.getHref(x)}
                        >
                            {props.getItem(x)}
                        </ListGroupItem>
                    )
                }
            </ListGroup>
            <MyPagination
                current={currentPage}
                max={Math.ceil(props.data.length / NumItemOfAPage)}
                onClick={(pageNum) => ((e) => { e.preventDefault(); setCurrentPage(pageNum); })}
            />
        </Fragment>;
}