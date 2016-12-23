'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const Aircraft = ModelBase.extend({
    tableName: 'public.Aircraft',
});

module.exports = Aircraft;