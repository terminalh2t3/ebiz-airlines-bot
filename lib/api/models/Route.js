'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Flight = require('./Flight');
const Airport = require('./Airport');
const Route = ModelBase.extend({
    tableName: 'sfebizairlines.route__c',
    idAttribute: "id",
    hasTimestamps: false,
    flights: function () {
        return this.hasMany('Flight', 'routeid__c', 'sfid');
    },
    destination: function () {
        return this.belongsTo('Airport','destinationairportid__c','sfid')
    },
    departure: function () {
        return this.belongsTo('Airport','departureairportid__c','sfid')
    }
});

module.exports = bookshelf.model('Route', Route);