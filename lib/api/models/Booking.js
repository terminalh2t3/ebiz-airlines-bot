'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Flight = require('./Flight');
const Route = require('./Route');
const Passenger = require('./Passenger');
const Aircraft = require('./Aircraft');

const Booking = ModelBase.extend({
    tableName: 'sfebizairlines.booking__c',
    idAttribute: "id",
    hasTimestamps: false,
    flight: function () {
        return this.belongsTo('Flight', 'flightid__c','sfid')
    },
    passenger: function () {
        return this.belongsTo('Passenger', 'passengerid__c','sfid')
    }
});

module.exports = bookshelf.model('Booking', Booking);