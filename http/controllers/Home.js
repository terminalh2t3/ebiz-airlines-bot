"use strict";
const   BaseController = require("./Base"),
        ejs = require('ejs');

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    run: function(req, res, next){
        const html = ejs.renderFile(__dirname + '/../templates/home.ejs', { content: 'Hello world!' }, {}, function(err, str){
            console.log(str);
            res.render('home', { content: 'Hello world!' })
        });
    }
});