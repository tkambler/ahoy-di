'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'id': 'root',
    'extendRequire': true,
    'prefix': 'containers',
    'services': [
        path.resolve(__dirname, 'services')
    ]
});

container.load('boot')
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });