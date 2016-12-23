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

    public findFlight(time, from, to) {

    }
}
module.exports = FlightSchedule;