"use strict";
const   BaseController = require("./Base"),
    View = require("../views/Base");

module.exports = BaseController.extend({
    name: "Test",
    content: null,
    flightSchedule: function(req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
        FlightSchedule.findFlight("100000", "700000", "2016-12-26", null, function(data){
            const v = new View(res, 'test');
            v.render({content: data});
        });
    }
});