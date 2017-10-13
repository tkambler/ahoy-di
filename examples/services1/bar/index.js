'use strict';

const Promise = require('bluebird');

exports = module.exports = function(car) {

    return new Promise((resolve, reject) => {

        setTimeout(() => {

            return resolve(() => {
                console.log('bar');
                car.start();
            });

        }, 3000);

    });

};

exports['@singleton'] = true;
exports['@require'] = ['car'];
