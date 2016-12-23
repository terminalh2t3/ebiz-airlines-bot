'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const State = ModelBase.extend({
    tableName: 'public.State',
});

module.exports = State;