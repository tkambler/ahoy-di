'use strict';

exports = module.exports = function(settings, Parachute) {

    class Car {

        start() {

            console.log('The car has started:');
            console.log(JSON.stringify(settings.car, null, 4));

            this.parachute = new Parachute();
            this.parachute.deploy();

        }

    }

    return new Car();

};

exports['@singleton'] = true;
exports['@require'] = ['settings', 'parachute'];
