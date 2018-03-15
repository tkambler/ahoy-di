'use strict';

const path = require('path');

exports = module.exports = function(log) {

    class Car {
        
        constructor() {
            
            log.info('Car is constructing.');
            
        }
        
        start() {
            
            log.info('Car is starting.');
            
        }
        
    }
    
    return Car;

};

exports['@singleton'] = true;
exports['@require'] = ['root.log'];