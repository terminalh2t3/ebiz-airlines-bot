"use strict";
const   BaseController = require("./Base");
const FlightScheduleBusiness = require('../../lib/api/business/FlightScheduleBusiness');
const PassengerBusiness = require('../../lib/api/business/PassengerBusiness');
const template = require('../../lib/bot/utils/airport-template');
const Booking = require('../../lib/api/models/Booking');
const BookingBusiness = require('../../lib/api/business/BookingBusiness');
module.exports = BaseController.extend({
    name: "Test",
    content: null,
    flightSchedule: function(req, res, next) {
        FlightScheduleBusiness.findFlights("HAN", "SGN", "2016-12-29 00:00:00", function(error, data){
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
    flightUpdate: function (req, res) {
        template.sendFlightUpdate(9, "gate_change");
    },
    getPassengerByFacebookId: function(req, res){
        PassengerBusiness.getPassengerByFacebookId('1367518156615879', function(error, data){
            res.json(error == null ? data : error);
        });
    },
    getBookingDetail: function(req, res){
        BookingBusiness.getBookingDetail(12, function(err, data){
            res.json(err != null ? err : data);
        });
    }
});