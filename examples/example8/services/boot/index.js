'use strict';

exports = module.exports = function(db, log, Car) {

    class Boot {
        
        constructor() {
            
            const car = new Car();
            car.start();
            
            log.info(`I am the 'Boot' class.`, {
                'db': db,
                'log': log,
                'car': car
            });

        }
        
    }
    
    return new Boot();

};

exports['@singleton'] = true;
exports['@require'] = ['db', 'log', 'db.car'];
