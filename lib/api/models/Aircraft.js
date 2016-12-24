'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule = require('./FlightSchedule');
const Aircraft = ModelBase.extend({
    tableName: 'public.Aircraft',
    flightSchedule: function () {
        return this.hasMany(FlightSchedule)
    }
});

module.exports = Aircraft;