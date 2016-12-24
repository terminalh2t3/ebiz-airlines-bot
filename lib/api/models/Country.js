'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const State = require('./State');
const Country = ModelBase.extend({
    tableName: 'public.Country',
    hasTimestamps: false,
    state: function() {
        return this.hasMany(State);
    }
});

module.exports = Country;