import { PaginationItem, Pagination, PaginationLink } from 'reactstrap';

interface Props {
    current: number;
    max: number;
    onClick: (pageNum: number) => (() => void);
}

export default function MyPagination(props: Props) {
    return <Pagination>
        <PaginationItem disabled={props.current === 1}>
            <PaginationLink first href="#" />
        </PaginationItem>
        <PaginationItem disabled={props.current === 1}>
            <PaginationLink previous href="#" />
        </PaginationItem>
        {
            props.current >= Math.max(props.max, 5)
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current - 4)}>
                    {props.current - 4}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current >= Math.max(props.max - 1, 4)
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current - 3)}>
                    {props.current - 3}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current - 2 >= 1
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current - 2)}>
                    {props.current - 2}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current - 1 >= 1
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current - 1)}>
                    {props.current - 1}
                </PaginationLink>
            </PaginationItem>
        }
        <PaginationItem active>
            <PaginationLink href="#">
                {props.current}
            </PaginationLink>
        </PaginationItem>
        {
            props.current + 1 <= props.max
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current + 1)}>
                    {props.current + 1}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current + 2 <= props.max
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current + 2)}>
                    {props.current + 2}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current <= Math.min(2, props.max - 3)
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current + 3)}>
                    {props.current + 3}
                </PaginationLink>
            </PaginationItem>
        }
        {
            props.current <= Math.min(1, props.max - 4)
            &&
            <PaginationItem>
                <PaginationLink href="#" onClick={props.onClick(props.current + 4)}>
                    {props.current + 4}
                </PaginationLink>
            </PaginationItem>
        }
        <PaginationItem disabled={props.current === props.max}>
            <PaginationLink next href="#" />
        </PaginationItem>
        <PaginationItem disabled={props.current === props.max}>
            <PaginationLink last href="#" />
        </PaginationItem>
    </Pagination >
}