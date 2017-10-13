'use strict';

exports = module.exports = function() {

    class Parachute {

        deploy() {
            console.log('Parachute has been deployed.');
        }

    }

    return Parachute;

};

exports['@singleton'] = true;
exports['@require'] = [];
