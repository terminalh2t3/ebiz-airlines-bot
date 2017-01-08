'use strict';
const config = require('config');
const Promise = require('../../../node_modules/bluebird/js/release/bluebird');

let knex = require('knex')({
    client: 'pg',
    connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
});
if(!(process.env.DATABASE_URL)){
    console.log('abc');
    knex = require('knex')({
        client: 'pg',
        connection: {
            host: "127.0.0.1",
            port: 5432,
            user: "postgres",
            password: "ngochoang",
            database: "Airbot",
            ssl: false
        },
        debug: true
    });
}

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

module.exports =  bookshelf;