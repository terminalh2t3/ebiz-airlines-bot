'use strict';

const connectDatabase = require('../database/connect-database');

const config = require('config');
const knex = require('knex')({
    client: 'pg',
    connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
});

var bookshelf = require('bookshelf')(knex);

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
        return this.fetchAll(options);
    }
}
module.exports = BaseModel;