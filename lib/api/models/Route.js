'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const FlightSchedule  = require('./FlightSchedule');
const State = require('./State');
const Route = ModelBase.extend({
    tableName: 'Route',
    idAttribute: "route_id",
    hasTimestamps: false,
    flightSchedules: function() {
        return this.hasMany('FlightSchedule','route_id');
    }
}, {
    findRoute: function (fromPostCode, toPostCode, callback) {
        var self = this;
        State.findState(fromPostCode, function (result) {
            console.log(result.get('state_code'));
            var depart = result;
            State.findState(toPostCode, function(result2) {
                console.log(result2.get('state_code'));
                var destination = result2;
                self.forge().query({where: {depart_code: depart.get('state_code'), destination_code: destination.get('state_code')}}).fetch().then(callback);
            });
        });
    }
});

module.exports = bookshelf.model('Route', Route);