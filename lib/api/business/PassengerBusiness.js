"use strict";
const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');
const bookshelf = require('../database/connect-database');
const listFunctions = {
    getPassengerByFacebookId(fbId, callback) {
        Passenger.where('facebookid__c', '=', fbId)
            .fetch()
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            })
            .catch(function (e) {
                callback(e, null);
            });
    },
    isHasPassenger(fbId, callback){
        listFunctions.getPassengerByFacebookId(fbId, function(error, passenger){
            if(error != null){
                callback(error, null);
            } else{
                //check object null
                if(passenger != null && Object.keys(passenger).length !== 0){
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
                    name: contactName,
                    facebookdid__c: fbid,
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
    getNearBooking(passengerSfid, callback){
        Booking.query(function(qb) {
            qb.innerJoin('sfebizairlines.flight__c', 'flight__c.sfid', 'booking__c.flightid__c');
            qb.where('passengerid__c','=', passengerSfid);
            qb.where(bookshelf.knex.raw('"departuretime__c" > now()'));
            qb.where(bookshelf.knex.raw('"checkintime__c" IS NOT NULL'));
            qb.orderBy('departuretime');
        }).fetch().then(function(model){
            callback(null, model ? model.toJSON() : null);
        }).catch(function(e){
            callback(e, null);
        });
    }
};

module.exports = listFunctions;