"use strict";
const   BaseController = require("./Base"),
    ejs = require('ejs');

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    list: function(req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
        FlightSchedule.getAllFlight(function (error, result) {
            res.render('flight/list', {
                flights: result
            });
        });
    },
});