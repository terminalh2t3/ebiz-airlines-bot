'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Aircraft = require('./Aircraft');
const Route = require('./Route');
const FlightSchedule = ModelBase.extend({
    tableName: 'public.FlightSchedule',
    hasTimestamps: false,
    route: function() {
        return this.belongsTo(Route);
    },
    aircraft: function () {
        return this.belongsTo(Aircraft);
    }
});

module.exports = FlightSchedule;