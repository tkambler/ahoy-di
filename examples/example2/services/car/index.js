'use strict';

exports = module.exports = function(settings) {

    class Car {

        start() {

            console.log('The car has started:');
            console.log(JSON.stringify(settings.car, null, 4));

        }

    }

    return new Car();

};

exports['@singleton'] = true;
exports['@require'] = ['settings'];
