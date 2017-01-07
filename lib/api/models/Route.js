'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Flight = require('./Flight');
const Route = ModelBase.extend({
    tableName: 'sfebizairlines.route__c',
    idAttribute: "id",
    hasTimestamps: false,
    flights: function () {
        return this.hasMany('Flight', 'routeid__c', 'sfid');
    }
});

module.exports = bookshelf.model('Route', Route);