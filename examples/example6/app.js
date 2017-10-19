'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'id': 'container',
    'extendRequire': true,
    'services': [
        path.resolve(__dirname, 'services')
    ],
    'load': ['herp']
});

container.load('foo')
    .then((foo) => {

        foo();

        require('container/herp')();

    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
