"use strict";
const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');
const bookshelf = require('../database/connect-database');
const org = require('../database/connect-salesforce');
const nforce = require('nforce');
const DateTime = require('node-datetime');
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
        listFunctions.isHasPassenger(fbid, function(err, exist){
            //add new
            if(err == null && !exist){
                org.authenticate().then(function (res) {
                    var newPassenger = nforce.createSObject('Lead');
                    newPassenger.set('LastName', contactName);
                    newPassenger.set('facebookId__c', fbid);
                    newPassenger.set('Phone', phoneNumber);
                    newPassenger.set('Email', emailAddress);
                    newPassenger.set('Company', 'Ebizsolutions');
                    org.insert({ sobject: newPassenger }).then(function(resp){
                        //Add passenger to heroku postgres after success
                        if(resp.success == true) {
                            console.log("Insert SF Lead Success");
                            var sfId = resp.id;
                            var currentTime  = DateTime.create().format('Y-m-d\TH:M:S');
                            new Passenger({
                                sfid: sfId,
                                name: contactName,
                                facebookid__c: fbid,
                                phone: phoneNumber,
                                email: emailAddress
                            }).save().then(function(model){
                                console.log("Insert Heroku Passenger Success");
                                callback(null, model.toJSON());
                            }).catch(function(e){
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