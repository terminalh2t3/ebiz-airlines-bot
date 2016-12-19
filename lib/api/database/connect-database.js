'use strict';
const config = require('config');

module.exports = () => {
    const bookshelf = require('bookshelf');
    const knex = require('knex')({
        client: 'pg',
        connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
    });

    return bookshelf(knex);
};
