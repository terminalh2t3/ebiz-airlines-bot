'use strict';

const Bookshelf = require('../database/connect-database');

module.exports = class BaseModel extends Bookshelf.Model
{
    constructor(){
        super();
    }

    get tableName() {
        return '';
    }

    get hasTimestamps() {
        return true;
    }

}