'use strict';

const connectDatabase = require('../database/connect-database');

class BaseModel extends bookshelf.Model
{
    constructor(){
        super();
        this.connection = connectDatabase();
    }

    get tableName() {
        return '';
    }

    get hasTimestamps() {
        return true;
    }

    findAll(filter, options){
        return this.forge().where(filter).fetchAll(options);
    }
}