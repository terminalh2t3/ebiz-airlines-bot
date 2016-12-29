'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule = require('./FlightSchedule');
const Aircraft = ModelBase.extend({
    tableName: 'Aircraft',
    idAttribute: "aircraft_id",
    hasTimestamps: false,
    flightSchedule: function () {
        return this.hasMany('FlightSchedule','aircraft_id')
    }
});

module.exports = bookshelf.model('Aircraft', Aircraft);