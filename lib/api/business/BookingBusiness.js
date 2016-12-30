"use strict";
const Booking = require('../models/Booking');
const datetime = require('node-datetime');
const RandomString = require('randomstring');
const AircraftBusiness = require('../business/AircraftBusiness');
const FlightScheduleBusiness = require('../business/FlightScheduleBusiness');
const FlightSchedule = require('../models/FlightSchedule');
const Moment = require('moment');

const listFunctions = {
    updateCheckInRemind(bookingId, callback) {
        new Booking({'booking_id': bookingId}).save({
            is_remind: true
        }).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    bookFlight(flightId, passengerId, callback){
        const status = 'paid';
        const is_remind = false;
        const is_boardingpass = false;
        const booking_number = RandomString.generate(5).trim().toUpperCase();
        const travel_class = 'economy';
        const qr_code = RandomString.generate(10);

        //get a seat number
        listFunctions.chooseASeatNumber(flightId, function(err, seatNumber){
            if(err != null){
                callback(err, null);
            } else{
                new Booking({
                    flight_id: flightId,
                    passenger_id: passengerId,
                    status: status,
                    is_remind: is_remind,
                    is_boardingpass: is_boardingpass,
                    booking_number: booking_number,
                    seat_number: seatNumber,
                    travel_class: travel_class,
                    qr_code: qr_code
                }).save().then(function(model){
                    callback(null, model.toJSON());
                }).catch(function(e){
                    callback(e, null);
                });
            }
        });
    },
    chooseASeatNumber(flightId, callback){
        //get seat_number
        listFunctions.findListSeatNumber(flightId, function(err1, seatList){
            if(err1 == null) {
                FlightScheduleBusiness.getFlightById(flightId, function (err2, flightInfo) {
                    if(err2 == null) {
                        AircraftBusiness.getAircarftById(flightInfo.aircraft_id, function (err3, aircraftInfo) {
                            let result;
                            if(err3 == null){
                                const length = aircraftInfo.length;
                                const column = aircraftInfo.column;
                                loop1:
                                    for(let i = 1; i <= length; i++){
                                        for(let j = 1; j <= column; j++){
                                            let charCode = String.fromCharCode(j+64); // A
                                            const seatName = i + charCode;
                                            //check seatName has existed on listSeat
                                            if(seatList.indexOf(seatName) < 0){//not exist
                                                result = seatName;
                                                break loop1;
                                            }
                                        }
                                    }
                                callback(null, result);
                            } else{
                                callback(err3, null);
                            }
                        });
                    } else{
                        callback(err2, null);
                    }
                });
            } else{
                callback(err1, null);
            }
        });
    },
    checkSeatStatus(seatNumber, flightId, callback){
        //get seat_number
        listFunctions.findListSeatNumber(flightId, function(err1, seatList){
            if(err1 == null) {
                FlightScheduleBusiness.getFlightById(flightId, function (err2, flightInfo) {
                    if(err2 == null) {
                        AircraftBusiness.getAircarftById(flightInfo.aircraft_id, function (err3, aircraftInfo) {
                            let result;
                            if(err3 == null){
                                //validate seat
                                
                            } else{
                                callback(err3, null);
                            }
                        });
                    } else{
                        callback(err2, null);
                    }
                });
            } else{
                callback(err1, null);
            }
        });
    },
    findListSeatNumber(flightId, callback){
        Booking.where('flight_id', '=', flightId).fetchAll()
            .then(function(model){
                const result = [];
                model.toJSON().forEach(function(booking){
                    result.push(booking.seat_number);
                });
                callback(null, result);
            })
            .catch(function(e){
                callback(e, null);
            });
    },
    checkValidSeat(flightId, seat, callback) {
        FlightScheduleBusiness.getFlightById(flightId, function (err, flightInfo) {
            if(err == null) {
                AircraftBusiness.getAircarftById(flightInfo.aircraft_id, function (err2, aircraftInfo) {
                    let seatNumber = parseInt(seat);
                    let seatColumn = seat.replace(seatNumber,'');
                    if(err2 == null) {
                        console.log(seatNumber, seatColumn);
                        const length = aircraftInfo.length;
                        const column = aircraftInfo.column;
                        const columns = [];
                        for(let i = 1; i <= column; i++){
                            const charCode = String.fromCharCode(i+64); // A
                            columns.push(charCode);
                        }
                        if(seatNumber == 'NaN') {
                            callback(null, false);
                        } else if(seatNumber > 0 && seatNumber <= length) {
                            seatColumn = seatColumn.toUpperCase();
                            if(columns.indexOf(seatColumn) >= 0) {
                                callback(null, true);
                            } else if(seatColumn == ''){
                                callback(null, false);
                            }
                        } else if(seatNumber < 0) {
                            callback(null, false);
                        }
                    }
                });
            }
        })
    },
    checkSeatStatus(flightId, seat, callback) {
        listFunctions.findListSeatNumber(flightId, function (error, seatList) {
            if(error == null) {
                console.log(seatList);
                console.log(seat);
                var status = seatList.indexOf(seat);
                console.log(status);
                if(status >= 0) {
                    callback(null, 'reserved');
                } else {
                    callback(null, 'empty');
                }
            }
        });
    },
    getBookingDetail(bookingId, callback){
        Booking.where('booking_id', '=', bookingId).fetch({
            withRelated: ['flightSchedule', 'passenger', 'route']
        }).then(function(model){
            callback(null, model ? model.toJSON() : null)
        }).catch(function(e){
            callback(e, null);
        });
    },
    getBookingDetailByBookingNumber(bookingNumber, callback){
        Booking.where('booking_number', '=', bookingNumber).fetch({
            withRelated: ['flightSchedule', 'passenger', 'route']
        }).then(function(model){
            callback(null, model ? model.toJSON() : null)
        }).catch(function(e){
            callback(e, null);
        });
    },
    getBookingByPassengerId(passengerId, callback) {
        Booking.where('passenger_id','=',passengerId)
            .orderBy('booking_id','DESC')
            .fetch({withRelated: ['flightSchedule']})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
                callback(e, null)
        })
    },
    updateBoardingPass(bookingId, callback) {
        new Booking({'booking_id': bookingId}).save({
            is_boardingpass: true
        }).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    updateCheckInStatus(passengerId, bookingId, callback) {
        const checkInTime = datetime.create().format('Y-m-d H:M:S');
        new Booking({passenger_id: passengerId, booking_id: bookingId}).save({
            is_remind: true,
            checkin_time: checkInTime
        }).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    getCheckInDetail(passengerId, bookingId, callback) {
        Booking.query(function (qb) {
            qb.where('booking_id','=', bookingId);
            qb.where('passenger_id','=', passengerId);
            qb.where('is_remind','=',true);
            qb.whereNull('checkin_time');
        }).fetch({
            withRelated: ['flightSchedule', 'passenger', 'route']
        }).then(function(model){
            callback(null, model ? model.toJSON() : null)
        }).catch(function(e){
            callback(e, null);
        });
    },
    testBoarding(bookingNumber, callback){
        listFunctions.getBookingDetailByBookingNumber(bookingNumber, function(error, bookingInfo){
            if(error == null){
                const newDepartTime = Moment().add(40, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                const newBoardingTime = Moment().format('YYYY-MM-DD HH:mm:ss');
                FlightSchedule.forge({
                    flight_id: bookingInfo.flightSchedule.flight_id,
                }).save({
                    departure_time: newDepartTime,
                    boarding_time: newBoardingTime
                }).then(function(model){
                    callback(null, model ? model.toJSON() : null);
                }).catch(function(e){
                    callback(e, null);
                });
            } else{
                callback(error, null);
            }
        });
    },
    testCheckin(bookingNumber, callback){
        listFunctions.getBookingDetailByBookingNumber(bookingNumber, function(error, bookingInfo){
            if(error == null){
                const newDepartTime = Moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss');
                FlightSchedule.forge({
                    flight_id: bookingInfo.flightSchedule.flight_id,
                }).save({
                    departure_time: newDepartTime
                }).then(function(model){
                    callback(null, model ? model.toJSON() : null);
                }).catch(function(e){
                    callback(e, null);
                });
            } else{
                callback(error, null);
            }
        });
    },
    changeSeat(bookingId, seatNumber, callback){
        Booking.forge({
            booking_id: bookingId
        }).save({
            seat_number: seatNumber
        }).then(function(model){
            callback(null ,model ? model.toJSON() : null);
        }).catch(function(e){
            callback(e, null);
        });
    }
};

module.exports = listFunctions;