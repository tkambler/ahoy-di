'use strict';

exports = module.exports = function(bar, animals) {

    return () => {
        console.log(`I am the 'foo' service.`);
        console.log('animals...', animals);
        bar();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['bar', 'animals'];
