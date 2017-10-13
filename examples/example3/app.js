'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'services': [
        path.resolve(__dirname, 'services')
    ]
});

container.constant('settings', {
    'car': {
        'make': 'Jeep',
        'model': 'Grand Cherokee',
        'year': '2017'
    }
});

container.service('parachute', require('./misc/parachute'));

container.load('foo')
    .then((foo) => {
        foo();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
