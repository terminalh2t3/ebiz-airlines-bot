'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule = require('./FlightSchedule');
const Passenger = require('./Passenger');

const Booking = ModelBase.extend({
    tableName: 'Booking',
    idAttribute: "booking_id",
    hasTimestamps: false,
    flightSchedule: function () {
        return this.belongsTo(FlightSchedule, 'flight_id')
    },
    passenger: function () {
        return this.belongsTo(Passenger, 'passenger_id')
    }
}, {
    testBook: function () {
        console.log('Flight:');
        console.log(FlightSchedule);
        console.log('Passenger:');
        console.log(Passenger);
    }
});

module.exports = Booking;