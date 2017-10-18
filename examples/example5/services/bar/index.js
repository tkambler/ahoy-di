'use strict';

exports = module.exports = function() {

    return () => {
        console.log(`I am the 'bar' service.`);
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
