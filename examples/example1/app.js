'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'services': [
        path.resolve(__dirname, 'services')
    ]
});

container.load('foo')
    .then((foo) => {
        foo();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
