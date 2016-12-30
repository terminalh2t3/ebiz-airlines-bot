"use strict";
const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');
const bookshelf = require('../database/connect-database');
const listFunctions = {
    getPassengerByFacebookId(fbId, callback) {
        Passenger.where('facebook_id', '=', fbId)
            .fetch()
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            })
            .catch(function (e) {
                callback(e, null);
            });
    },
    isHasPassenger(fbId, callback){
        listFunctions.getPassengerByFacebookId(fbId, function(error, data){
            if(error != null){
                callback(error, null);
            } else{
                //check object null
                if(data != null && Object.keys(data).length !== 0){
                    callback(null, true);
                } else{
                    callback(null, false);
                }
            }
        });
    },
    createPassenger(fbid, contactName, phoneNumber, emailAddress, callback){
        listFunctions.isHasPassenger(fbid, function(error, exist){
            //add new
            if(error == null && !exist){
                new Passenger({
                    first_name: contactName,
                    facebook_id: fbid,
                    phone: phoneNumber,
                    email: emailAddress
                }).save().then(function(model){
                    callback(null, model.toJSON());
                }).catch(function(e){
                    callback(e, null);
                });
            }
        });
    },
    getNearBooking(passengerId, callback){
        Booking.query(function(qb) {
            qb.innerJoin('FlightSchedule', 'FlightSchedule.flight_id', 'Booking.flight_id');
            qb.where('passenger_id','=', passengerId);
            qb.where(bookshelf.knex.raw('"departure_time" > now()'));
            qb.where(bookshelf.knex.raw('"checkin_time" IS NOT NULL'));
            qb.orderBy('departure_time');
        }).fetch().then(function(model){
            callback(null, model ? model.toJSON() : null);
        }).catch(function(e){
            callback(e, null);
        });
    }
};

module.exports = listFunctions;