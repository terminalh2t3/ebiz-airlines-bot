'use strict';
const Flight = require('../models/Flight');
const Route = require('../models/Route');
const DateTime = require('node-datetime');
const bookshelf = require('../database/connect-database');
const moment = require("moment");
module.exports = {
    findFlights(from, to, date, callback) {
        const fromDateTime = date;
        const toDateTime = DateTime.create(date).format('Y-m-d 23:59:59');
        Flight.query(function (qb) {
            qb.innerJoin('sfebizairlines.route__c', 'flight__c.routeid__c', 'route__c.sfid');
            qb.join(bookshelf.knex.raw('(select sfid, code__c from sfebizairlines.airport__c adep' +
                ' where adep.code__c = \'' + from + '\') departure'), 'route__c.departureairportid__c', '=', 'departure.sfid', 'left');
            qb.join(bookshelf.knex.raw('(select sfid, code__c from sfebizairlines.airport__c ades' +
                ' where ades.code__c = \'' + to + '\') destination'), 'route__c.destinationairportid__c', '=', 'destination.sfid', 'left');
            qb.where('flight__c.departuretime__c', '>=', fromDateTime);
            qb.where('flight__c.departuretime__c', '<=', toDateTime);
        }).fetchAll(
            { withRelated: ['route', 'route.departure', 'route.destination'] }
        ).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    getFlightById(flightSfid, callback){
        Flight.where({sfid: flightSfid})
            .fetch({withRelated: ['route','route.departure','route.destination']})
            .then(function(model){
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
            });
    },
    checkInReminder(callback) {
        //Get current time
        var currentTime  = DateTime.create().format('Y-m-d H:M:S');
        //Get all flight of current date with remind
        Flight.query(function (qb) {
            qb.whereRaw("age(departuretime__c, ?) < ?",[currentTime, '02:00:00']);
            qb.whereRaw("age(departuretime__c, ?) > ?",[currentTime, '00:45:00']);
        }).fetchAll({withRelated:['route','route.destination','route.departure',{ booking: function (qb) {
            qb.where('booking__c.isremind__c','=',false);
            qb.whereNull('booking__c.checkintime__c');
        }},'booking.passenger']})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function(e){
                callback(e, null);
        });
    },
    boardingPassToPassenger(flightSfId, bookingSfId, callback){
        Flight.query({where: {sfid: flightSfId}})
            .fetch({debug: false, withRelated: ['route','route.destination','route.departure',{booking: function (qb) {
            qb.where('booking__c.sfid','=', bookingSfId);
            qb.where('booking__c.isremind__c','=',true);
            qb.whereNotNull('booking__c.checkintime__c');
        }}, "booking.passenger"]})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
                callback(e, null);
        })
    },
    boardingPass(callback) {
        //Get current time
        var currentTime  = DateTime.create().format('Y-m-d H:M');
        Flight.query(function (qb) {
            qb.whereRaw("age(departuretime__c, ?) < ?",[currentTime, '00:45:00']);
            qb.whereRaw("age(departuretime__c, ?) > ?",[currentTime, '00:15:00']);
        }).fetchAll({debug: false,withRelated: ['route','route.destination','route.departure',{booking: function (qb) {
            qb.where('booking__c.isremind__c','=',true);
            qb.whereNotNull('booking__c.checkintime__c');
            qb.where('booking__c.isboarding__c','=',false);
        }},'booking.passenger']})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
                callback(e, null);
        });
    },
    flightUpdate(flightSfId, callback) {
        Flight.query(function (qb) {
            qb.where('sfid','=',flightSfId);
        }).fetchAll({debug:false, withRelated: ['route','route.destination','route.departure', 'booking','booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON())
            }).catch(function (e) {
                callback(e, null)
        })
    },
    getAllFlight(callback) {
        var currentTime = DateTime.create().format("Y-m-d") + " 00:00:00";
        var endTime     = DateTime.create().format("Y-m-d") + " 23:59:00";
        Flight.query(function (qb) {
            qb.where("departuretime__c",">", currentTime);
            qb.where("departuretime__c","<", endTime);
        }).orderBy('departuretime__c','ASC')
        .fetchAll()
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
            callback(e, null)
        })
    },
    /**
     * Update delay time
     * @param flight_id
     * @param hour
     * @param minute
     * @param callback
     */
    updateDelayTime(flightSfid, hour, minute, callback) {
        const template = require('../../../lib/bot/utils/airport-template');
        Flight.findOne({sfid: flightSfid}).then(function (model) {
            let departure_time = moment(model.get('departuretime__c')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            let arrival_time = moment(model.get('arrivaltime__c')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            Flight.update({
                departuretime__c: departure_time,
                arrivaltime__c: arrival_time
            }, {sfid: flightSfid}).then(function (result) {
                template.sendFlightUpdate(flightSfid, "delay");
                callback(null, result)
            }).catch(function (e) {
                callback(e, null);
            });
        }).catch(function (e) {
            callback(e, null);
        });
    },

    /**
     * Update gate change
     * @param flight_id
     * @param gate
     * @param callback
     */
    updateGateChange(flightSfid, gate, callback) {
        const template = require('../../../lib/bot/utils/airport-template');
        Flight.findOne({sfid: flightSfid}).then(function (model) {
            Flight.update({
                depart_gate: gate,
            }, {sfid: flightSfid}).then(function (result) {
                template.sendFlightUpdate(flightSfid, "gate_change");
                callback(null, result)
            }).catch(function (e) {
                callback(e, null);
            });
        }).catch(function (e) {
            callback(e, null);
        });
    },
};