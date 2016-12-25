'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');

function findFlights(from, to , date, callback) {
    FlightSchedule.query(function (qb) {
        qb.innerJoin('Route', 'FlightSchedule.route_id', 'Route.route_id');
        qb.where('Route.depart_code', '=', from);
        qb.where('Route.destination_code', '=', to);
        qb.where('FlightSchedule.flight_date', '=', date);
        qb.where('FlightSchedule.departure', '>', '00:00:00');
    }).fetchAll(
        {withRelated: ['route']}
    ).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function(e){
        callback(e, null);
    });
}

module.exports = {findFlight: findFlights};