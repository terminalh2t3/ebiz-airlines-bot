"use strict";
const   BaseController = require("./Base");
const FlightScheduleBusiness = require('../../lib/api/business/FlightScheduleBusiness');
const template = require('../../lib/bot/utils/airport-template');
module.exports = BaseController.extend({
    name: "Test",
    content: null,
    flightSchedule: function(req, res, next) {
        FlightScheduleBusiness.findFlights("HAN", "SGN", "2016-12-26", function(error, data){
            res.json(data);
        });
    },
    getFlightById: function(req, res, next) {
        FlightScheduleBusiness.getFlightById(5, function(error, data){
            res.json(data);
        });
    },
    checkInRemind: function(req, res) {
        template.sendCheckinRemind();
    },
    boardingPass: function (req, res) {
        FlightScheduleBusiness.boardingPass(function (error, boardings) {
            //console.log(boardings);
            // boardings.forEach(function (boarding) {
            //     console.log(boarding);
            // });
        })
    }
});