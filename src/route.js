import React from 'react';
import Home from './modules/home/Home';
import Preview from './modules/preview/Preview';

const routes = [
    {
        path: '/',
        exact: true,
        main: () => <Home />
    },
    {
        path: '/showroom',
        exact: true,
        main: () => <Preview />
    }
];

export default routes;

