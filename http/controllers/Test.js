"use strict";
const   BaseController = require("./Base"),
    View = require("../views/Base");
const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');

module.exports = BaseController.extend({
    name: "Test",
    content: null,
    flightSchedule: function(req, res, next) {
        FlightSchedule.findFlight("HAN", "SGN", "2016-12-26", function(error, data){
            res.json(data);
        });
    }
});