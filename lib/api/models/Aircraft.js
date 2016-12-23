'use strict';
const BaseModel = require('./BaseModel');

class Aircraft extends BaseModel
{
    get tableName() {
        return "Aircraft";
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = Aircraft;