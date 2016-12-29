'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Aircraft  = require('../models/Aircraft');
const Booking   = require('./Booking');
const Route     = require('./Route');
const FlightSchedule = ModelBase.extend({
    tableName: 'FlightSchedule',
    idAttribute: "flight_id",
    hasTimestamps: false,
    aircraft: function () {
        return this.belongsTo('Aircraft', 'aircraft_id');
    },
    route: function() {
        return this.belongsTo('Route', 'route_id');
    },
    flight_booking: function () {
        return this.hasMany('Booking', 'flight_id')
    }
});

module.exports = bookshelf.model('FlightSchedule', FlightSchedule);