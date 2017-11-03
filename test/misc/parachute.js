'use strict';

exports = module.exports = function() {

    class Parachute {

        deploy() {
            return 'deployed';
        }

    }

    return Parachute;

};

exports['@singleton'] = true;
exports['@require'] = [];
