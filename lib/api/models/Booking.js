'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule = require('./FlightSchedule');
const Route = require('./Route');
const Passenger = require('./Passenger');
const Aircraft = require('./Aircraft');

const Booking = ModelBase.extend({
    tableName: 'Booking',
    idAttribute: "booking_id",
    hasTimestamps: false,
    flightSchedule: function () {
        return this.belongsTo('FlightSchedule', 'flight_id')
    },
    passenger: function () {
        return this.belongsTo('Passenger', 'passenger_id')
    },
    route: function(){
        return this.belongsTo('Route', 'route_id').through('FlightSchedule','flight_id')
    }
});

module.exports = bookshelf.model('Booking', Booking);