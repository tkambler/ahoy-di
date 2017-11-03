'use strict';

exports = module.exports = function(bar) {

    return () => {
        return bar();
    };

};

exports['@singleton'] = true;
exports['@require'] = ['bar'];
