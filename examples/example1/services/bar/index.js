'use strict';

exports = module.exports = function() {

    console.log(`'bar' service is being executed.`);

    return () => {
        console.log(`I am the 'bar' service.`);
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
