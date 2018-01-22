'use strict';

exports = module.exports = function(pet) {

    return {
        'something': true,
        'pet': pet
    };

};

exports['@singleton'] = true;
exports['@require'] = ['pet'];
