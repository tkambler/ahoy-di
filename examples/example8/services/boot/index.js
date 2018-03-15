'use strict';

exports = module.exports = function(db, log) {

    class Boot {
        
        constructor() {
            
            log.info(`I am the 'Boot' class.`, {
                'db': db,
                'log': log
            });

        }
        
    }
    
    return new Boot();

};

exports['@singleton'] = true;
exports['@require'] = ['db', 'log'];
