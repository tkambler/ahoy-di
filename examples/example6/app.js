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

container.constant('settings', {
    'vehicles': ['Jeep', 'BMW', 'Porsche']
});

function animals() {
    return ['cats', 'dogs'];
}
animals['@singleton'] = true;
animals['@require'] = [];

container.service('animals', animals);

container.load('foo')
    .then((foo) => {

        foo();

        require('container/herp')();

        const settings = require('container/settings');
        console.log('settings', settings);

    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
