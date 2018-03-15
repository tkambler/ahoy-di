'use strict';

exports = module.exports = function(db, log, Car, BEEP) {
    
    log.info('Beep', BEEP);

    class Boot {
        
        constructor() {
            
            const car = new Car();
            car.start();
            
            log.info(`I am the 'Boot' class.`, {
                'db': db,
                'log': log,
                'car': car
            });
            
            const Dog = require('containers/db/dog');
            console.log('Dog', Dog);

        }
        
    }
    
    return new Boot();

};

exports['@singleton'] = true;
exports['@require'] = ['db', 'log', 'db.car', 'BEEP'];
