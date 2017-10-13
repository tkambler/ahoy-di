'use strict';

const app = require('../../../app.js');
const db = app.service('db');

class Car {

    constructor() {
        this.db = db;
    }

}

module.exports = Car;
