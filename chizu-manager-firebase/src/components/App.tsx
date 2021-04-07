import React from 'react';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App({ children }) {
    return (
        <main>
            <Header />
            {children}
        </main>
    );
}
