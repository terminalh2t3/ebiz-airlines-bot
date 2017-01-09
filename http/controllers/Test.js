"use strict";
const   BaseController = require("./Base");
const FlightBusiness = require('../../lib/api/business/FlightBusiness');
const PassengerBusiness = require('../../lib/api/business/PassengerBusiness');
const template = require('../../lib/bot/utils/airport-template');
const Route = require('../../lib/api/models/Route');
const Flight = require('../../lib/api/models/Flight');
const Booking = require('../../lib/api/models/Booking');
const Passenger = require('../../lib/api/models/Passenger');
const DateTime = require('node-datetime');
const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const config = require('config');
const org = require('../../lib/api/database/connect-salesforce');
const nforce = require('nforce');
const RandomString = require('randomstring');
module.exports = BaseController.extend({
    name: "Test",
    content: null,
    findFlights: function(req, res, next) {
        const from = req.query.from;
        const to = req.query.to;
        const datetime = req.query.datetime;
        FlightBusiness.findFlights(from, to, datetime, function(error, data){
            res.json(data);
        });
    },
    getFlightById: function(req, res, next) {
        FlightBusiness.getFlightById(5, function(error, data){
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
        res.sendStatus(200);
    },
    boardingPass: function (req, res) {
        template.sendBoardingPass();
        res.sendStatus(200);
    },
    boardingPassPassenger: function (req, res) {
        const flightSfId = req.query.flightSfid;
        const bookingSfId = req.query.bookingSfid;
        template.boardingPassOnePassenger(flightSfId, bookingSfId);
    },
    flightUpdate: function (req, res) {
        template.sendFlightUpdate(9, "gate_change");
    },
    addFlights: function (req, res) {
        var startDate = DateTime.create();
        var endDate   = DateTime.create("2017-01-15 00:00:00").getTime();
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
                    var departDate = DateTime.create(time).format('Y-m-d');
                    for(var i = 6; i < 20; i++) {
                        var boardingTime  = DateTime.create(departDate + " "+i+":00:00").format('Y-m-d H:M:S');
                        var departureTime = DateTime.create(departDate + " "+i+":45:00").format('Y-m-d H:M:S');
                        var arrivalTime   = DateTime.create(departDate + " "+(i+3)+":00:00").format('Y-m-d H:M:S');
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
                        Flight.forge(flightInfo).save().then(function (model) {
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
    },
    getPassengerByFacebookId: function(req, res){
        PassengerBusiness.getPassengerByFacebookId('1367518156615879', function(error, data){
            res.json(error == null ? data : error);
        });
    },
    getBookingDetail: function(req, res){
        const passengerSfid = req.query.passengerSfid;
        const flightSfid = req.query.flightSfid;
        BookingBusiness.getBookingDetail(passengerSfid, flightSfid, function(err, data){
            res.json(err != null ? err : data);
        });
    },
    testCheckin: function(req, res){
        const bookingNumber = req.query.booking_number;
        BookingBusiness.testCheckin(bookingNumber, function(error, data){
            res.json(error == null ? data : error);
        });
    },
    testBoarding: function(req, res){
        const bookingNumber = req.query.booking_number;
        BookingBusiness.testBoarding(bookingNumber, function(error, data){
            res.json(error == null ? data : error);
        });
    },
    getAvailableSeat: function (req, res) {
        const flightSfid = req.query.flightSfid;
        BookingBusiness.findListSeatNumber(flightSfid, function (error, model) {
            res.send(model);
        })
    },
    chooseSeat: function (req, res) {
        const flightSfid = req.query.flightSfid;
        BookingBusiness.chooseASeatNumber(flightSfid, function (error, model) {
            res.send(model);
        })
    },
    getNearBooking: function(req, res){
        PassengerBusiness.getNearBooking(5, function(err, model){
            res.send(model);
        });
    },
    changeSeat: function(req, res){
        const passengerId = req.query.passenger_id;
        const seat = req.query.seat;
        PassengerBusiness.getNearBooking(passengerId, function(error, booking){
            BookingBusiness.changeSeat(booking.sfid, seat, function(error, model){
                res.json(model);
            });
        });
    },
    addPassenger: function (req, res, callback) {
        org.authenticate().then(function (res) {
            var passenger = nforce.createSObject('Lead');
            passenger.set('LastName', 'Hoang');
            passenger.set('facebookId__c', '1234567');
            passenger.set('Phone', '090962');
            passenger.set('Email', 'hoanglongps3333@yahoo.com');
            passenger.set('Company', 'Ebizsolutions');
            org.insert({ sobject: passenger }).then(function(resp){
                //Add passenger to heroku postgres after success
                if(resp.success == true) {
                    var sfId = resp.id;
                    var currentTime  = DateTime.create().format('Y-m-d\TH:M:S');
                    new Passenger({
                        sfid: sfId,
                        name: 'Hoang',
                        facebookid__c: '1234567',
                        phone: '090962',
                        email: 'hoanglongps333@yahoo.com',
                        systemmodstamp: currentTime,
                        createddate: currentTime
                    }).save().then(function(model){
                        callback(null, model.toJSON());
                    }).catch(function(e){
                        callback(e, null);
                    });
                }
            }).error(function (err1) {
                console.log(err1)
            });
        }).error(function (err2) {
            console.log(err2)
        });
    },
    addBooking : function (req, res, callback) {
        const status__c = 'paid';
        const ischeckin__c  = false;
        const isboarding__c = false;
        const isremind__c   = false;
        const name = RandomString.generate(5).trim().toUpperCase();
        const travelclass__c = 'economy';
        const qrcode__c = RandomString.generate(10);
        const flightSfid = 'a0G2800000byChVEAU';
        const passengerSfid = '00Q2800000SmTDHEA3';
        //get a seat number
        BookingBusiness.chooseASeatNumber(flightSfid, function(err, seatNumber){
            if(err != null){
                callback(err, null);
            } else{
                org.authenticate().then(function (res) {
                    var newBooking = nforce.createSObject('Booking__c');
                    newBooking.set('Name', name);
                    newBooking.set('FlightId__c', flightSfid);
                    newBooking.set('PassengerId__c', passengerSfid);
                    newBooking.set('IsCheckin__c', ischeckin__c);
                    newBooking.set('IsBoarding__c', isboarding__c);
                    newBooking.set('IsRemind__c', isremind__c);
                    newBooking.set('SeatNumber__c', seatNumber);
                    newBooking.set('TravelClass__c', travelclass__c);
                    newBooking.set('QrCode__c', qrcode__c);
                    newBooking.set('Status__c', status__c);

                    org.insert({ sobject: newBooking }).then(function(resp){
                        if(resp.success == true) {
                            console.log(resp);
                            new Booking({
                                sfid: resp.id,
                                flightid__c: flightSfid,
                                passengerid__c: passengerSfid,
                                status__c: status__c,
                                ischeckin__c: ischeckin__c,
                                isboarding__c: isboarding__c,
                                isremind__c: isremind__c,
                                name: name, //booking code
                                seatnumber__c: seatNumber,
                                travelclass__c: travelclass__c,
                                qrcode__c: qrcode__c
                            }).save().then(function (model) {
                                callback(null, model.toJSON());
                            }).catch(function (e) {
                                callback(e, null);
                            });
                        }
                    }).error(function (err1) {
                        console.log(err1);
                    })
                }).error(function (err2) {
                    console.log(err2)
                });
            }
        });
    }
});