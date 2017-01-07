'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Aircraft  = require('../models/Aircraft');
const Booking   = require('./Booking');
const Route     = require('./Route');
const FlightSchedule = ModelBase.extend({
    tableName: 'sfebizairlines.flight__c',
    idAttribute: "id",
    hasTimestamps: false,
    aircraft: function () {
        return this.belongsTo('Aircraft', 'aircraftid__c', 'sfid');
    },
    route: function() {
        return this.belongsTo('Route', 'routeid__c', 'sfid');
    },
    booking: function () {
        return this.hasMany('Booking', 'flightid__c', 'sfid')
    }
});

module.exports = bookshelf.model('FlightSchedule', FlightSchedule);