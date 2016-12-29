"use strict";
const Booking = require('../models/Booking');
const datetime = require('node-datetime');
const RandomString = require('randomstring');
const AircraftBusiness = require('../business/AircraftBusiness');
const FlightScheduleBusiness = require('../business/FlightScheduleBusiness');

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
        const booking_number = RandomString.generate(8).trim().toUpperCase();
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
                                    for(let j = 1; j <= column; j++){
                                        for(let i = 1; i <= length; i++){
                                            const charCode = String.fromCharCode(i+64); // A
                                            const seatName = j + charCode;
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
    getBookingDetail(bookingId, callback){
        Booking.where('booking_id', '=', bookingId).fetch({
            withRelated: ['flightSchedule', 'passenger', 'route']
        }).then(function(model){
            callback(null, model ? model.toJSON() : null)
        }).catch(function(e){
            callback(e, null);
        });
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
            qb.select('b.*', 'p.*', 'f.*','r.*')
                .from('Booking as b')
                .innerJoin('Passenger as p','p.passenger_id','b.passenger_id')
                .innerJoin('FlightSchedule as f', 'f.flight_id','b.flight_id')
                .innerJoin('Route as r','r.route_id','f.route_id')
                .where('b.passenger_id','=',passengerId)
                .where('b.booking_id','=',bookingId)
                .whereNull('b.checkin_time')
        }).fetch().then(function (model) {
            callback(null, model);
        }).catch(function (e) {
            callback(e, null);
        });
    }
};

module.exports = listFunctions;