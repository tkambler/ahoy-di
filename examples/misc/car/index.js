'use strict';

exports = module.exports = function() {

    return new class {

        start() {
            console.log('Car is starting.');
        }

    };

};

exports['@singleton'] = true;
exports['@require'] = [];
