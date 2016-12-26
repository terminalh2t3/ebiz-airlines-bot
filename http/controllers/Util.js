"use strict";
const   BaseController = require("./Base"),
        path = require('path'),
        fs = require('fs'),
        ejs = require('ejs');
const config = require('config');
const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');

module.exports = BaseController.extend({
    name: "Util",
    content: null,
    renderFlightInfo: function(req, res, next){
        const flight_id = req.query.flight_id;
        //check this flight has image or not
        const filePath = path.join(__dirname, '../public/webshot/', flight_id + '.png');
        fs.stat(filePath, function(err, stat){
            if(err == null) {
                //If file exist -> send this file
                res.sendFile(filePath);
            } else{
                //setting webshot
                const webshot = require('webshot');
                const options = {
                    screenSize: {
                        width: 800
                        , height: 418
                    }
                    , shotSize: {
                        width: 800
                        , height: 'all'
                    }
                    , userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
                    + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g',
                    siteType: 'html'
                };

                const FlightSchedule = require('../../lib/api/business/FlightScheduleBusiness');
                FlightSchedule.getFlightById(flight_id, function(err, data){
                    // res.render('util/flightInfo', {flightInfo: data, rootUrl: rootUrl});
                    const viewFilePath = __dirname + '/../templates/util/flightInfo.ejs';
                    ejs.renderFile(viewFilePath, {flightInfo: data, rootUrl: rootUrl}, {}, function(err, str){
                        webshot(str, filePath, options, function(err){
                            res.sendFile(filePath);
                        });
                    });
                });
            }
        });
    },
});
