'use strict';

const path = require('path');

exports = module.exports = function(adapter, foo, Car, log) {

    class DB {
        
        constructor() {
            
            this.adapter = adapter;
            this.foo = foo;
            this.Car = Car;
            this.car = new Car();
            this.log = log;
            
            log.info('This is a message from the DB service.');
            
        }
        
    }
    
    return new DB();

};

exports['@singleton'] = true;
exports['@require'] = ['adapter', 'foo', 'car', 'root.log'];
exports['@ns'] = {
    'services': [
        path.resolve(__dirname, 'services'),
        path.resolve(__dirname, 'models'),
    ]
};