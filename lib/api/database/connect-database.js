'use strict';
const config = require('config');

let knex = require('knex')({
    client: 'pg',
    connection: (process.env.HEROKU_POSTGRESQL_MAROON_URL) ? process.env.HEROKU_POSTGRESQL_MAROON_URL : config.get('database_url'),
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