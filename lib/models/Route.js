'use strict';
const bookshelf = require('../connect/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Flight = require('./Flight');
const Airport = require('./Airport');
const Route = ModelBase.extend({
    tableName: 'salesforce.route__c',
    idAttribute: "id",
    hasTimestamps: false,
    flights: function () {
        return this.hasMany('Flight', 'routeid__c', 'sfid');
    },
    departure: function(){
        return this.belongsTo('Airport', 'departureairportid__c', 'sfid');
    },
    destination: function(){
        return this.belongsTo('Airport', 'destinationairportid__c', 'sfid');
    }
});

module.exports = bookshelf.model('Route', Route);