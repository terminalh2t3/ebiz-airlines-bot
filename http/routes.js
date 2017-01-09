'use strict';
const bodyParser = require('body-parser');

const routes = [
    {url: '/home', controller:'Home', action: 'run', alias: 'home', method: 'get'},
    {url: '/util/render-flight-info', controller:'Util', action: 'renderFlightInfo', method: 'get'},
    {url: '/flight/show', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight/detail', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight', controller:'Flight', action: 'list', method: 'get'},
    // {url: '/flight/update-delay', controller:'Flight', action: 'updateDelayList', method: 'get'},
    // {url: '/flight/update-delay', controller:'Flight', action: 'updateDelay', method: 'post'},
    // {url: '/flight/update-gate', controller:'Flight', action: 'updateGateChange', method: 'post'},
    // {url: '/flight/update-gate', controller:'Flight', action: 'updateGateChangeList', method: 'get'},
    {url: '/flight/update/departure', controller:'Flight', action: 'updateDelay', method: 'post'},
    {url: '/flight/update/gate', controller:'Flight', action: 'updateGateChange', method: 'post'},
    {url: '/checkin', controller: 'Booking', action: 'checkinPage', method: 'get'},
    {url: '/checkin', controller: 'Booking', action: 'updateCheckin', method: 'post'},
    {url: '/checkin/success', controller: 'Booking', action: 'checkinSuccess', method: 'get'},

    //SF API
    {url: '/oauth/_callback.', controller: 'Util', action: 'callBackSuccess', method: 'get'},
    //test
    {url: '/test/findFlights', controller:'Test', action: 'findFlights', method: 'get'},
    {url: '/test/getFlightById', controller:'Test', action: 'getFlightById', method: 'get'},
    {url: '/test/flightSchedule', controller:'Test', action: 'flightSchedule', method: 'get'},

    {url: '/test/reminder/checkin', controller:'Test', action: 'checkInRemind', method: 'get'},
    {url: '/test/reminder/boarding', controller:'Test', action: 'boardingPass', method: 'get'},

    {url: '/test/booking', controller:'Test', action: 'bookingAll', method: 'get'},
    {url: '/test/flightupdate', controller:'Test', action: 'flightUpdate', method: 'get'},
    {url: '/test/getPassengerByFacebookId', controller:'Test', action: 'getPassengerByFacebookId', method: 'get'},
    {url: '/test/getBookingDetail', controller:'Test', action: 'getBookingDetail', method: 'get'},
    {url: '/test/testCheckin', controller:'Test', action: 'testCheckin', method: 'get'},
    {url: '/test/testBoarding', controller:'Test', action: 'testBoarding', method: 'get'},

    {url: '/test/boarding/passenger', controller:'Test', action: 'boardingPassPassenger', method: 'get'},
    {url: '/test/flightupdate', controller:'Test', action: 'flightUpdate', method: 'get'},
    {url: '/test/add/flights', controller: 'Test', action: 'addFlights', method:'get'},
    {url: '/test/seat', controller: 'Test', action: 'getAvailableSeat', method:'get'},
    {url: '/test/allseat', controller: 'Test', action: 'chooseSeat', method:'get'},
    {url: '/test/getNearBooking', controller: 'Test', action: 'getNearBooking', method:'get'},
    {url: '/test/changeSeat', controller: 'Test', action: 'changeSeat', method:'get'},
    {url: '/test/sf/passenger', controller: 'Test', action: 'addPassenger', method:'get'},
    {url: '/test/sf/booking', controller: 'Test', action: 'addBooking', method:'get'},
];

class Route{
    constructor(app){
        this.routes = routes;
        this.app = app;
        app.use(bodyParser.urlencoded({ extended: true }));
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