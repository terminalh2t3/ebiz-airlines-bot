'use strict';
const bookshelf = require('../connect/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Airport = ModelBase.extend({
    tableName: 'salesforce.airport__c',
    idAttribute: "id",
    hasTimestamps: false
});

module.exports = bookshelf.model('Airport', Airport);