'use strict';

exports = module.exports = function() {

    return () => {
        return 'derp';
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
