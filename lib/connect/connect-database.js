'use strict';
const config = require('config');

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
        }
    });
}

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports =  bookshelf;