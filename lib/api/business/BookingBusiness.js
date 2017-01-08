"use strict";
const Booking = require('../models/Booking');
const datetime = require('node-datetime');
const RandomString = require('randomstring');
const AircraftBusiness = require('../business/AircraftBusiness');
const FlightBusiness = require('./FlightBusiness');
const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Route = require('../models/Route');
const Moment = require('moment');

const listFunctions = {
    updateCheckInRemind(bookingSfid, callback) {
        new Booking({'sfid': bookingSfid}).save({
            ischeckin__c: true
        }).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    bookFlight(flightSfid, passengerSfid, callback){
        const status__c = 'paid';
        const ischeckin__c = false;
        const isboarding__c = false;
        const name = RandomString.generate(5).trim().toUpperCase();
        const travelclass__c = 'economy';
        const qrcode__c = RandomString.generate(10);

        //get a seat number
        listFunctions.chooseASeatNumber(flightSfid, function(err, seatNumber){
            if(err != null){
                callback(err, null);
            } else{
                new Booking({
                    flightid__c: flightSfid,
                    passengerid__c: passengerSfid,
                    status__c: status__c,
                    ischeckin__c: ischeckin__c,
                    isboarding__c: isboarding__c,
                    name: name, //booking code
                    seatnumber__c: seatNumber,
                    travelclass__c: travelclass__c,
                    qrcode__c: qrcode__c
                }).save().then(function(model){
                    callback(null, model.toJSON());
                }).catch(function(e){
                    callback(e, null);
                });
            }
        });
    },
    chooseASeatNumber(flightSfid, callback){
        //get seat_number
        listFunctions.findListSeatNumber(flightSfid, function(err1, seatList){
            if(err1 == null) {
                FlightBusiness.getFlightById(flightSfid, function (err2, flightInfo) {
                    if(err2 == null) {
                        AircraftBusiness.getAircarftById(flightInfo.aircraft_id, function (err3, aircraftInfo) {
                            let result;
                            if(err3 == null){
                                const length = aircraftInfo.length__c;
                                const column = aircraftInfo.column__c;
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
    findListSeatNumber(flightSfid, callback){
        Booking.where('flightid__c', '=', flightSfid).fetchAll()
            .then(function(model){
                const result = [];
                model.toJSON().forEach(function(booking){
                    result.push(booking.seatnumber__c);
                });
                callback(null, result);
            })
            .catch(function(e){
                callback(e, null);
            });
    },
    checkValidSeat(flightSfid, seat, callback) {
        FlightBusiness.getFlightById(flightSfid, function (err, flightInfo) {
            if(err == null) {
                AircraftBusiness.getAircarftById(flightInfo.aircraftid__c, function (err2, aircraftInfo) {
                    let seatNumber = parseInt(seat);
                    let seatColumn = seat.replace(seatNumber,'');
                    if(err2 == null) {
                        console.log(seatNumber, seatColumn);
                        const length = aircraftInfo.length__c;
                        const column = aircraftInfo.column__c;
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
    checkSeatStatus(flightSfid, seat, callback) {
        listFunctions.findListSeatNumber(flightSfid, function (error, seatList) {
            if(error == null) {
                console.log(seatList);
                console.log(seat);
                const status = seatList.indexOf(seat);
                console.log(status);
                if(status >= 0) {
                    callback(null, 'reserved');
                } else {
                    callback(null, 'empty');
                }
            }
        });
    },
    getBookingDetail(passengerSfid, flightSfid, callback){
        Booking.where({passengerid__c: passengerSfid, flightid__c: flightSfid}).fetch({
            withRelated: ['flight', 'passenger', 'route']
        }).then(function(bookingModel){
            if (bookingModel){
                let booking = bookingModel.toJSON();
                Route.where({sfid: booking.route.sfid})
                    .fetch({
                        withRelated: ['departure','destination']
                    }).then(function(routeModel){
                        const route = routeModel.toJSON();
                        booking.departure = route.departure;
                        booking.destination = route.destination;
                        callback(null, booking);
                    });
            } else{
                callback(null, null);
            }
        }).catch(function(e){
            callback(e, null);
        });
    },
    getBookingDetailByBookingNumber(bookingNumber, callback){
        Booking.where('name', '=', bookingNumber).fetch({
            withRelated: ['flight', 'passenger', 'route']
        }).then(function(bookingModel){
            if (bookingModel){
                let booking = bookingModel.toJSON();
                Route.where({sfid: booking.route.sfid})
                    .fetch({
                        withRelated: ['departure','destination']
                    }).then(function(routeModel){
                    const route = routeModel.toJSON();
                    booking.departure = route.departure;
                    booking.destination = route.destination;
                    callback(null, booking);
                });
            } else{
                callback(null, null);
            }
        }).catch(function(e){
            callback(e, null);
        });
    },
    getBookingByPassengerId(passengerId, callback) {
        Booking.where('passenger_id','=',passengerId)
            .orderBy('booking_id','DESC')
            .fetch({withRelated: ['flight']})
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
            withRelated: ['flight', 'passenger', 'route']
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
                const newArrivalTime = Moment().add(140, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                Flight.forge({
                    sfid: bookingInfo.flight.sfid,
                }).save({
                    departuretime__c: newDepartTime,
                    arrivaltime__c:newArrivalTime
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
                const newArrivalTime = Moment().add(220, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                Flight.forge({
                    sfid: bookingInfo.flight.sfid,
                }).save({
                    departuretime__c: newDepartTime,
                    arrivaltime__c: newArrivalTime
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
    changeSeat(bookingSfid, seatNumber, callback){
        Booking.forge({
            sfid: bookingSfid
        }).save({
            seatnumber__c: seatNumber
        }).then(function(model){
            callback(null ,model ? model.toJSON() : null);
        }).catch(function(e){
            callback(e, null);
        });
    },
    validateBooking(passengerSfid, flightSfid, callback){
        Booking.where({passengerid__c: passengerSfid, flightid__c: flightSfid})
            .count('sfid')
            .then(function(count){
                if(count > 0){
                    callback(null, false);
                } else{
                    callback(null, true);
                }
            })
            .catch(function(e){
                callback(e, null);
            });
    }
};

module.exports = listFunctions;