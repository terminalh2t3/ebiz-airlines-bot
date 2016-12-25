'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');
const RouteBusiness = require('../business/RouteBusiness');
function findFlights(from, to , date, price, callback) {
    // Route.findRoute(from, to, function (result) {
    //     var routeId = result.get("route_id");
    //     var flightSchedules =  result.flightSchedules();
    //     console.log(result.toJSON());
    // });
    var statement = {flight_date: date};
    if(price)
        statement.ticket_price = price;
    //.query({where: statement})
    FlightSchedule.query({where: statement}).fetchAll(
        {withRelated:['route','aircraft']}).then(callback);
}

module.exports = {findFlight: findFlights};