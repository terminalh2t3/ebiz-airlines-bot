'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule = require('./FlightSchedule');
const Aircraft = ModelBase.extend({
    tableName: 'public.Aircraft',
    idAttribute: "aircraft_id",
    flightSchedule: function () {
        return this.hasMany(FlightSchedule,'aircraft_id')
    }
});

module.exports = Aircraft;