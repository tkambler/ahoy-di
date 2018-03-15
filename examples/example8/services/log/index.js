'use strict';

exports = module.exports = function() {

    class Log {
        
        constructor() {
            console.log('Log class is constructing.');
        }
        
        info(message, data) {
            
            console.log(JSON.stringify({
                'level': 'info',
                'message': message,
                'data': data
            }, null, 4));
            
        }
        
    }
    
    return new Log();

};

exports['@singleton'] = true;
exports['@require'] = [];
