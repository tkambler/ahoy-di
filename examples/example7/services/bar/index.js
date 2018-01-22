'use strict';

const DI = require('../../../../');

exports = module.exports = function() {

    function bar() {
        console.log(`I am the 'bar' service.`);
    }

    const di = DI.byId('container');

    di.constant('pet', 'Zelda');

    return di.load('something')
        .then((something) => {
            console.log('something', something);
            return bar;
        });

};

exports['@singleton'] = true;
exports['@require'] = [];
