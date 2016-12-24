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
    findRoute: function (from, to, callback) {
        var self = this;
        State.findState(from, function (result) {
            console.log(result.get('state_code'));
            var depart = result;
            State.findState(to, function(result2) {
                console.log(result2.get('state_code'));
                var destination = result2;
                return self.forge().query({where: {depart_state: depart.get('state_code'), destination_state: destination.get('state_code')}}).fetch().then(callback);
            });
        });
    }
});

module.exports = Route;