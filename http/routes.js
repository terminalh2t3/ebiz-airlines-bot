'use strict';
const bodyParser = require('body-parser');

const routes = [
    {url: '/home', controller:'Home', action: 'run', alias: 'home', method: 'get'},
    {url: '/util/render-flight-info', controller:'Util', action: 'renderFlightInfo', method: 'get'},
    {url: '/flight/show', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight/detail', controller:'Flight', action: 'show', method: 'get'},
    {url: '/flight', controller:'Flight', action: 'list', method: 'get'},
    {url: '/flight/update/departure', controller:'Flight', action: 'updateDelay', method: 'post'},
    {url: '/flight/update/gate', controller:'Flight', action: 'updateGateChange', method: 'post'},
    {url: '/checkin', controller: 'Booking', action: 'checkinPage', method: 'get'},
    {url: '/checkin', controller: 'Booking', action: 'updateCheckin', method: 'post'},
    {url: '/checkin/success', controller: 'Booking', action: 'checkinSuccess', method: 'get'},

    //SF API
    {url: '/oauth/_callback.', controller: 'Util', action: 'callBackSuccess', method: 'get'},
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