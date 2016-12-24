'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');


function findFlights(from, to , date, price, callback) {
    Route.findRoute(from, to, function (result) {
        var routeId = result.get("route_id");
        FlightSchedule.query({where: {route: routeId, flight_date: date}}).fetchAll().then(callback);
    });
}

module.exports = {findFlight: findFlights}