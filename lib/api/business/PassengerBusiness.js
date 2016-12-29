"use strict";
const Passenger = require('../models/Passenger');
const listFunctions = {
    getPassengerByFacebookId(fbId, callback) {
        Passenger.where('facebook_id', '=', fbId)
            .fetch()
            .then(function (model) {
                callback(null, model != null ? model.toJSON() : null);
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
    }
};

module.exports = listFunctions;