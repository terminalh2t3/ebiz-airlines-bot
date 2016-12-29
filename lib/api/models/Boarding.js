'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Booking = require('./Booking');
const Passenger = require('./Passenger');
const Boarding = ModelBase.extend({
    tableName: 'Boarding',
    idAttribute: "boarding_id",
    hasTimestamps: false,
    booking: function () {
        return this.belongsTo('Booking', 'booking_id')
    },
    passenger: function () {
        return this.belongsTo('Passenger', 'passenger_id');
    }
});

module.exports = bookshelf.model('Boarding', Boarding);