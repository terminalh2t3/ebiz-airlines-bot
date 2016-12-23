'use strict';
const BaseModel = require('./BaseModel');

class Route extends BaseModel
{
    get tableName() {
        return 'Route';
    }

    get hasTimestamps() {
        return false;
    }

    getAll(){
        return this.fetchAll();
    }
}
module.exports = {Route: Route};