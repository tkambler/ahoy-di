'use strict';

exports = module.exports = function() {

    return () => {
        console.log(`I am the 'herp' service.`);
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
