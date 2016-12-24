"use strict";
const   BaseController = require("./Base"),
        View = require("../views/Base");

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    run: function(req, res, next){
        const v = new View(res, 'home');
        v.render({'content': 'Hello world!!'});
    }
});