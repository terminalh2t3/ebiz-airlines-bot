'use strict';
const BaseModel = require('./BaseModel');

class Country extends BaseModel
{
    get tableName() {
        return 'Country';
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = Country;