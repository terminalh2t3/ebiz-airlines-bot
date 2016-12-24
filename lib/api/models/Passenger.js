'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const Passenger = ModelBase.extend({
    tableName: 'public.Passenger',
});

module.exports = Passenger;