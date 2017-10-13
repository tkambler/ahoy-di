'use strict';

exports = module.exports = function() {

    class DB {

        constructor() {

            this.settings = {
                'adaptor': 'sqlite3',
                'file': 'db.sqlite'
            };

        }

    }

    return new DB();

};

exports['@singleton'] = true;
exports['@require'] = [];
