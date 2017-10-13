'use strict';

exports = module.exports = function(bar) {

    return () => {
        console.log(`I am the 'foo' service.`);
        bar();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['bar'];
