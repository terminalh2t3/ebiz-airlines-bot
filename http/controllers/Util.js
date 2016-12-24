"use strict";
const   BaseController = require("./Base"),
        View = require("../views/Base"),
        path = require('path'),
        fs = require('fs');

module.exports = BaseController.extend({
    name: "Util",
    content: null,
    renderImage: function(req, res, next){
        const url = req.query.url;
        const webshot = require('webshot');
        const options = {
            screenSize: {
                width: 320
                , height: 480
            }
            , shotSize: {
                width: 320
                , height: 'all'
            }
            , userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
            + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
        };

        const now = new Date().getTime().valueOf().toString();
        const fileName = 'ws' + now + '.png';
        webshot(url, __dirname + '/../public/webshot/' + fileName, options, function(err){
            res.sendFile(path.join(__dirname, '../public/webshot/', fileName));
        });
    }
});
