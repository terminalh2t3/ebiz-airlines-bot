'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Route = require('./Route');
const Aircraft = require('./Aircraft');
const FlightSchedule = ModelBase.extend({
    tableName: 'public.FlightSchedule',
    hasTimestamps: false,
    route: function() {
        return this.belongsTo(Route);
    },
    aircraft: function () {
        return this.belongsTo(Aircraft);
    }
}, {
    findFlight: function (routeId , date) {

    }
});

module.exports = FlightSchedule;