'use strict';

const path = require('path');

exports = module.exports = function(foo) {

    class Adapter {
        
        constructor() {
            
            this.foo = foo;
            
        }
        
    }
    
    return new Adapter();

};

exports['@singleton'] = true;
exports['@require'] = ['foo'];