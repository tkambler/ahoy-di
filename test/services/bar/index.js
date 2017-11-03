'use strict';

exports = module.exports = function() {

    return () => {
        return 'bar';
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
