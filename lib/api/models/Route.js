'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const Route = ModelBase.extend({
    tableName: 'public.Route',
});

module.exports = Route;