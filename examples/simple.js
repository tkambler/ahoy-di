'use strict';

const Container = require('../');
const path = require('path');

const container = new Container({
    'services': [
        path.resolve(__dirname, 'services1'),
        path.resolve(__dirname, 'services2')
    ]
});

container.addService('car', require('./misc/car'));

// container.load('foo')
//     .then((foo) => {
//         console.log('foo', foo);
//         foo.herp();
//     })
//     .catch((err) => {
//         console.log(err);
//         process.exit(1);
//     });

// container.load('ping')
//     .then((ping) => {
//         console.log('ping', ping);
//         ping();
//     })
//     .catch((err) => {
//         console.log(err);
//         process.exit(1);
//     });

container.load('car')
    .then((car) => {
        console.log('car', car);
        car.start();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
