'use strict';

const Container = require('../../');
const path = require('path');

const container = new Container({
    'id': 'root',
    // 'extendRequire': true,
    'services': [
        path.resolve(__dirname, 'services')
    ]
});

container.load('boot')
    .then((boot) => {
        
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });