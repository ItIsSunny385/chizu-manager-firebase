import { Fragment } from 'react';
import { Spinner } from 'reactstrap';

export default function SpinnerWithBack() {
    return (
        <Fragment>
            <div style={
                {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    margin: 0,
                    zIndex: 1,
                    background: 'white'
                }}
            />
            <Spinner color="primary" style={
                {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    margin: 'auto',
                    zIndex: 2
                }}
            />
        </Fragment>
    );
}