'use strict';
const Route = require('../models/Route');
const State = require('../models/State')

function findRoute(fromPostal, toPostal, callback) {
    Route.query(function(qb) {
        qb.select('r.*', 's1.state_code', 's2.state_code')
            .from('Route as r')
            .innerJoin('State as s1','r.depart_state', 's1.state_code' )
            .innerJoin('State as s2','r.destination_state','s2.state_code')
            .where('s1.postal_code', '=', fromPostal)
            .where('s2.postal_code', '=', toPostal)
    }).fetch({debug:true}).then(callback);
}

module.exports = {findRoute: findRoute()};