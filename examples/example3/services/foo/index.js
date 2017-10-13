'use strict';

exports = module.exports = function(car) {

    return () => {
        console.log(`I am the 'foo' service.`);
        car.start();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['car'];
