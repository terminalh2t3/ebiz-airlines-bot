"use strict";
const   BaseController = require("./Base");
const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
const Flight = require('../../lib/api/models/FlightSchedule');
const Booking  = require('../../lib/api/models/Booking');
const Passenger = require('../../lib/api/models/Passenger');
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
    checkInRemind: function(req, res, recipientId, bot) {
        FlightSchedule.checkInReminder(function (error, flights) {
            // var flights = data.models;
            flights.forEach(function (flight) {
                //console.log(flight);
                var flightBooking = flight.flight_booking;
                var flightRoute   = flight.route;
                //prepare payload to send checkin message
                if(flightBooking) {
                    flightBooking.forEach(function (booking) {
                        var flight_info = [];
                        var info = {};
                        var checkinUrl = "https://www.hasterwilliam.com/checkin";
                        if(booking.is_remind == false) {
                            var passenger = booking.passenger;
                            var name = passenger.first_name + " " + passenger.last_name;
                            info.flight_number = flight.flight_code;
                            info.departure_airport = {
                                airport_code: flightRoute.depart_code,
                                city: flightRoute.depart_name,
                                terminal: flight.depart_terminal,
                                gate: flight.depart_gate
                            };
                            info.arrival_airport = {
                                airport_code: flightRoute.destination_code,
                                city: flightRoute.destination_name,
                                terminal: flight.destination_terminal,
                                gate: flight.destination_gate
                            };
                            info.flight_schedule = {
                                boarding_time: flight.boarding_time,
                                departure_time: flight.departure_time,
                                arrival_time: flight.arrival_time
                            };
                            flight_info.push(info);
                            //res.send(flight_info);
                            console.log(bot);
                            //bot.sendCheckinReminder(passenger.facebook_id, name, flight_info, checkinUrl, [])
                        }
                    })
                }
            });
        });
    }
});