'use strict';
const BaseModel = require('./BaseModel');

class FlightSchedule extends BaseModel
{
    get tableName() {
        return 'FlightSchedule';
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = FlightSchedule;