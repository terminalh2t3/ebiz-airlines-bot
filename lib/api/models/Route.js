'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule  = require('./FlightSchedule');
const State = require('./State');
const Route = ModelBase.extend({
    tableName: 'public.Route',
    flightSchedule: function() {
        return this.hasMany(FlightSchedule);
    }
}, {
    findRoute: function (from, to) {
        State.findState(from).then(function(result) {
            var depart = result;
            State.findState(to).then(function(result) {
                var destination = result;
                return this.forge().query({where: {depart_state: depart.get('state_code'), destination_state: destination.get('state_code')}}).fetch();
            });
        });
    }
});

module.exports = Route;