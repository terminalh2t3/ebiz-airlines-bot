"use strict";
const   BaseController = require("./Base"),
    View = require("../views/Base");

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    show: function(req, res, next) {
        const v = new View(res, 'flight/show');
        v.render({});
    }
});