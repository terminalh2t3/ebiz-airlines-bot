'use strict';
const BaseModel = require('./BaseModel');

class Passenger extends BaseModel
{
    get tableName() {
        return 'Passenger';
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = Passenger;