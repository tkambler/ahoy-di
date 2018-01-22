'use strict';

exports = module.exports = function(car, ENABLED) {

    console.log('ENABLED?', ENABLED);

    return () => {
        console.log(`I am the 'foo' service.`);
        car.start();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['car', 'ENABLED'];
