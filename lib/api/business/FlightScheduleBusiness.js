'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');

function findFlights(from, to , date, price, callback) {
    Route.findRoute(from, to, function (result) {
        var routeId = result.get("route_id");
        var flightSchedules =  result.flightSchedules();
        console.log(result.toJSON());
        FlightSchedule.query({where: {route_id: routeId, flight_date: date}}).fetchAll({withRelated:['aircraft','route']}).then(callback);
    });
}

module.exports = {findFlight: findFlights}