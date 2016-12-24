'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const Country = ModelBase.extend({
    tableName: 'public.Country',
});

module.exports = Country;