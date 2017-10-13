'use strict';

exports = module.exports = function() {

    return () => {
        console.log('pong');
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
