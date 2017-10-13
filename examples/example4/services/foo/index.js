'use strict';

exports = module.exports = function(db) {

    return () => {

        console.log(`I am the 'foo' service.`);

        const Car = require('../../lib/models/car');
        const car = new Car();
        console.log('car', car);

    };

};

exports['@singleton'] = true;
exports['@require'] = ['db'];
