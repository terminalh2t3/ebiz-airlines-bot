"use strict";
const   BaseController = require("./Base");
const FlightScheduleBusiness = require('../../lib/api/business/FlightScheduleBusiness');
const template = require('../../lib/bot/utils/airport-template');
const Route = require('../../lib/api/models/Route');
const FlightSchedule = require('../../lib/api/models/FlightSchedule');
const Booking = require('../../lib/api/models/Booking');
const datetime = require('node-datetime');
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
    bookingAll: function (req, res) {
        Booking.fetchAll().then(function (booking) {
            console.log(booking.toJSON())
        })
    },
    checkInRemind: function(req, res) {
        template.sendCheckinRemind();
    },
    boardingPass: function (req, res) {
        template.sendBoardingPass();
    },
    boardingPassPassenger: function (req, res) {
        const flightId = req.query.flight_id;
        const bookingId = req.query.booking_id;
        template.boardingPassOnePassenger(flightId, bookingId);
    },
    flightUpdate: function (req, res) {
        template.sendFlightUpdate(9, "gate_change");
    },
    addFlights: function (req, res) {
        var startDate = datetime.create();
        var endDate   = datetime.create("2017-01-15 00:00:00").getTime();
        var currentDate = new Date(startDate.getTime());
        var between = [];
        while (currentDate <= endDate) {
            between.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        Route.fetchAll().then(function (routes) {
            routes = routes.toJSON();
            routes.forEach(function (value) {
                var routeId = value.route_id;
                console.log(routeId);
                between.forEach(function (time) {
                    var departDate = datetime.create(time).format('Y-m-d');
                    for(var i = 6; i < 20; i++) {
                        var boardingTime  = datetime.create(departDate + " "+i+":00:00").format('Y-m-d H:M:S');
                        var departureTime = datetime.create(departDate + " "+i+":45:00").format('Y-m-d H:M:S');
                        var arrivalTime   = datetime.create(departDate + " "+(i+3)+":00:00").format('Y-m-d H:M:S');
                        var flightCode = Math.floor((Math.random() * 900) + 99);
                        var price = Math.floor((Math.random() * 900) + 99);
                        var depart_terminal = Math.floor((Math.random() * 3) + 1);
                        var depart_gate = Math.floor((Math.random() * 15) + 1);
                        var destination_terminal = Math.floor((Math.random() * 3) + 1);
                        var destination_gate = Math.floor((Math.random() * 15) + 1);
                        var flightInfo = {
                            aircraft_id: 1,
                            route_id: routeId,
                            flight_code: "VN"+flightCode,
                            flight_company: "Vietnam Airline",
                            ticket_price: price,
                            boarding_time: boardingTime,
                            departure_time: departureTime,
                            arrival_time: arrivalTime,
                            depart_terminal: depart_terminal,
                            depart_gate: depart_gate,
                            destination_terminal: destination_terminal,
                            destination_gate: destination_gate
                        };
                        FlightSchedule.forge(flightInfo).save().then(function (model) {
                            if(model)
                                console.log("Insert success");
                        }).catch(function (error) {
                            console.log(error);
                            console.log("Insert Fail")
                        })
                    }
                });
            });
        });
    }
});