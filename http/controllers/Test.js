"use strict";
const   BaseController = require("./Base");
const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');

module.exports = BaseController.extend({
    name: "Test",
    content: null,
    flightSchedule: function(req, res, next) {
        FlightSchedule.findFlights("HAN", "SGN", "2016-12-26", function(error, data){
            res.json(data);
        });
    },
    getFlightById: function(req, res, next) {
        FlightSchedule.getFlightById(5, function(error, data){
            res.json(data);
        });
    },
});