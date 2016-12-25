'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Aircraft = require('../models/Aircraft');
const Route    = require('../models/Route');
const FlightSchedule = ModelBase.extend({
    tableName: 'FlightSchedule',
    idAttribute: "flight_id",
    hasTimestamps: false,
    aircraft: function () {
        return this.belongsTo(Aircraft, 'aircraft_id');
    },
    route: function() {
        return this.belongsTo(Route, 'route_id');
    },
});

module.exports = FlightSchedule;