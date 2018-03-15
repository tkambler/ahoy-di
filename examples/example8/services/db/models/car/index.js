'use strict';

const path = require('path');

exports = module.exports = function() {

    class Car {
        
        constructor() {
            
            console.log('Car is constructing.');
            
        }
        
    }
    
    return Car;

};

exports['@singleton'] = true;
exports['@require'] = [];