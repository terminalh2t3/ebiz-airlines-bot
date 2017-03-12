'use strict';
const bookshelf = require('../connect/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Flight = require('./Flight');
const Aircraft = ModelBase.extend({
    tableName: 'salesforce.aircraft__c',
    idAttribute: "id",
    hasTimestamps: false,
    flights: function () {
        return this.hasMany('Flight','aircraftid__c','sfid')
    }
});

module.exports = bookshelf.model('Aircraft', Aircraft);