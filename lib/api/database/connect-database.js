'use strict';
const config = require('config');

const knex = require('knex')({
    client: 'pg',
    connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
});

const bookshelf = require('bookshelf')(knex);

module.exports =  bookshelf;