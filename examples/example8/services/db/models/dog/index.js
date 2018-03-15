'use strict';

const path = require('path');

exports = module.exports = function(log) {
    
    console.log('WOOF');

    class Dog {
        
        constructor() {
            
            log.info('Dog is constructing.');
            
        }
        
        bark() {
            
            log.info('Dog is barking.');
            
        }
        
    }
    
    return Dog;

};

exports['@singleton'] = true;
exports['@require'] = ['root.log'];
exports['@autoload'] = true;