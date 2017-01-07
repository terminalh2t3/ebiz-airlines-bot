'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Passenger = ModelBase.extend({
    tableName: 'sfebizairlines.lead',
    idAttribute: "id",
    hasTimestamps: false
});

module.exports = bookshelf.model('Passenger', Passenger);