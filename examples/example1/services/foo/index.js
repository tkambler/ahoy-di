'use strict';

exports = module.exports = function(bar, herp) {

    return () => {
        console.log(`I am the 'foo' service.`);
        bar();
        herp();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['bar', 'herp'];
