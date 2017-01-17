"use strict";
const Aircraft = require('../models/Aircraft');
module.exports = {
    getAircarftById(aircraftSfid, callback){
        Aircraft.where('sfid', '=', aircraftSfid).fetch()
            .then(function(model){
                callback(null, model.toJSON());
            })
            .catch(function(e){
                callback(e, null);
            });
    }
};