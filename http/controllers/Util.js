"use strict";
const BaseController = require("./Base");
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const config = require('config');
const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');
const FlightBusiness = require('../../lib/business/FlightBusiness');

module.exports = BaseController.extend({
    name: "Util",
    content: null,
    renderFlightInfo: function(req, res, next){
        const flightSfid = req.query.flightSfid;
        //check this flight has image or not
        const filePath = path.join(__dirname, '../public/webshot/', flightSfid + '.png');
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
                        , height: 416
                    }
                    , shotSize: {
                        width: 800
                        , height: 416
                    }
                    , userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
                    + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g',
                    siteType: 'html'
                };

                FlightBusiness.getFlightById(flightSfid, function(err, data){
                    // res.render('util/flightInfo', {flightInfo: data, rootUrl: rootUrl, DateTime: require('node-datetime')});
                    const viewFilePath = __dirname + '/../templates/util/flightInfo.ejs';
                    ejs.renderFile(viewFilePath, {flightInfo: data, rootUrl: rootUrl, DateTime: require('node-datetime')}, {},
                        function(err, str){
                        webshot(str, filePath, options, function(err){
                            res.sendFile(filePath);
                        });
                    });
                });
            }
        });
    },
    callBackSuccess: function (req, res) {
        console.log(req);
    }
});
