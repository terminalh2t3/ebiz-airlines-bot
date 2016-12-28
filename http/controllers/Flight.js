"use strict";
const   BaseController = require("./Base"),
    ejs = require('ejs');

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    show: function(req, res, next) {
        const flight_id = req.query.flight_id;
        const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
        FlightSchedule.getFlightById(flight_id, function(err, data){
            const DateTime = require('node-datetime')
            res.render('flight/show', {flightInfo: data, DateTime: DateTime});
        });
    },
    list: function(req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
        FlightSchedule.getAllFlight(function (error, result) {
            res.render('flight/list', {
                flights: result
            });
        });
    },
});