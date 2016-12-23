'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const FlightSchedule = ModelBase.extend({
    tableName: 'public.FlightSchedule',
});

module.exports = FlightSchedule;