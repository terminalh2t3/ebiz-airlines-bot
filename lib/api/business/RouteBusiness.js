'use strict';
const Route = require('../models/Route');
const State = require('../models/State')

function findRoute(fromPostal, toPostal, callback) {
    Route.query(function(qb) {
        qb.select('r.*', 's1.airport_code', 's2.airport_code')
            .from('Route as r')
            .innerJoin('State as s1','r.depart_code', 's1.airport_code' )
            .innerJoin('State as s2','r.destination_code','s2.airport_code')
            .where('s1.postal_code', '=', fromPostal)
            .where('s2.postal_code', '=', toPostal)
    }).fetch().then(function(model) {
        callback(null, model.toJSON())
    }).catch(function(e){
        callback(e, null)
    });
}

module.exports = {findRoute: findRoute()};