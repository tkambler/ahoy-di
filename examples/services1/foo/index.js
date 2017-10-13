'use strict';

exports = module.exports = function(bar) {

    return {
        'herp': function() {
            console.log('herp');
            bar();
        }
    };

};

exports['@singleton'] = true;
exports['@require'] = ['bar'];
