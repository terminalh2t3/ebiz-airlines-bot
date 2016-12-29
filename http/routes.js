'use strict';

const routes = [
    {url: '/home', controller:'Home', action: 'run', alias: 'home', method: 'get'},
    {url: '/util/render-flight-info', controller:'Util', action: 'renderFlightInfo', method: 'get'},
    {url: '/flight/show', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight/detail', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight', controller:'Flight', action: 'list', method: 'get'},
    //test
    {url: '/test/flightSchedule', controller:'Test', action: 'flightSchedule', method: 'get'},
    {url: '/test/getFlightById', controller:'Test', action: 'getFlightById', method: 'get'},
    {url: '/test/flightSchedule', controller:'Test', action: 'flightSchedule', method: 'get'},
    {url: '/test/reminder', controller:'Test', action: 'checkInRemind', method: 'get'},
    {url: '/test/booking', controller:'Test', action: 'bookingAll', method: 'get'},
    {url: '/test/boarding', controller:'Test', action: 'boardingPass', method: 'get'},
    {url: '/test/flightupdate', controller:'Test', action: 'flightUpdate', method: 'get'},
    {url: '/test/getPassengerByFacebookId', controller:'Test', action: 'getPassengerByFacebookId', method: 'get'},
    {url: '/test/getBookingDetail', controller:'Test', action: 'getBookingDetail', method: 'get'},

];

class Route{
    constructor(app){
        this.routes = routes;
        this.app = app;
        this.loadRoute();
    }
    loadRoute(){
        for(let routeInfo of this.routes){
            const method = routeInfo.method;
            const url = routeInfo.url;

            this.app[method](url, function(req, res, next){
                const route = getRoute(req);
                const ControllerClass = require('../http/controllers/' + route.controller);
                ControllerClass[route.action](req, res, next);
            });
        }
    }
}

function getRoute(req){
    const url = req._parsedUrl.pathname;
    const method = req.method;
    for (let routeInfo of routes){
        if(routeInfo.url == url && routeInfo.method.toLowerCase() == method.toLowerCase()) {
            return routeInfo;
        }
    }
    return null;
}

module.exports = Route;