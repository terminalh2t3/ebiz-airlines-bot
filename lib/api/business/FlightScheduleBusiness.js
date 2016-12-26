'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');

module.exports = {
    findFlights(from, to, date, callback) {
        FlightSchedule.query(function (qb) {
            qb.innerJoin('Route', 'FlightSchedule.route_id', 'Route.route_id');
            qb.where('Route.depart_state', '=', from);
            qb.where('Route.destination_state', '=', to);
            qb.where('FlightSchedule.flight_date', '=', date);
            qb.where('FlightSchedule.departure', '>', '00:00:00');
        }).fetchAll(
            { withRelated: ['route'] }
        ).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    getFlightById(flight_id, callback){
        FlightSchedule.where('flight_id', '=', flight_id)
            .fetch({withRelated: ['route']})
            .then(function(model){
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
            });
    }
};