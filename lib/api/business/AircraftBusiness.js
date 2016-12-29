"use strict";
const Aircraft = require('../models/Aircraft');
module.exports = {
    getAircarftById(aircraftId, callback){
        Aircraft.where('aircraft_id', '=', aircraftId).fetch()
            .then(function(model){
                callback(null, model.toJSON());
            })
            .catch(function(e){
                callback(e, null);
            });
    }
};