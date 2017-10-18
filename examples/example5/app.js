'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'id': 'container',
    'extendRequire': true,
    'services': [
        path.resolve(__dirname, 'services')
    ]
});

container.load('foo')
    .then((foo) => {

        foo();

            const bar = require('container/bar');
            console.log(`Fetched 'bar' service via require():`);
            bar();

    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
