'use strict';
const config = require('config');
const Promise = require('../../../node_modules/bluebird/js/release/bluebird');

let knex = require('knex')({
    client: 'pg',
    connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
});
if(!(process.env.DATABASE_URL)){
    knex = require('knex')({
        client: 'pg',
        connection: {
            host: "127.0.0.1",
            port: 5432,
            user: "postgres",
            password: "123456",
            database: "sfebizairlines",
            ssl: false
        },
        debug: true
    });
}

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports =  bookshelf;