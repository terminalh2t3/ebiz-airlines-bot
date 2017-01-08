const request = require('request');
const _ = require('underscore');
const config = require('config');

exports.getAirport = function ( opts, callback ) {
    if(!process.env.DATABASE_URL){
        result = {};
        result.airports = [];
        airport = {};
        airport.iata = '';
        if(opts.term == "Hanoi"){
            airport.iata = "HAN";
        } else{
            airport.iata = "SGN";
        }
        result.airports.push(airport);
        callback(null, result);
        return;
    }
    const options = {term: opts.term, limit: 2||opts.limit, size: 2||opts.size};
    request({
        uri:"https://www.air-port-codes.com/api/v1/multi",
        headers:{
            'APC-Auth': (process.env.APC_AUTH) ? process.env.APC_AUTH : config.get('apc-auth'),
            'APC-Auth-Secret': (process.env.APC_AUTH_SECRET) ? process.env.APC_AUTH_SECRET : config.get('apc-auth-secret')
        },
        qs:options
    }, function(err,resp,body) {
        if (err) return callback(err);
        let result;
        try {
            result = JSON.parse(body);
        } catch (err) {
            callback(err);
            return;
        }
        callback(null,result);
    });
};