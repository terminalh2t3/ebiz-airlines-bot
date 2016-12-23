'use strict';
const BaseModel = require('./BaseModel');

class State extends BaseModel
{
    get tableName() {
        return 'State';
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = State;