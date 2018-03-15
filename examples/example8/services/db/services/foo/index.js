'use strict';

const path = require('path');

exports = module.exports = function() {

    class Foo {
        
        constructor() {
            
            console.log('Foo is constructing.');
            
        }
        
    }
    
    return new Foo();

};

exports['@singleton'] = true;
exports['@require'] = [];