'use strict';
const config = require('config');
const nforce = require('nforce');
const org = nforce.createConnection({
    clientId: config.get('clientId'),
    clientSecret: config.get('clientSecret'),
    redirectUri: config.get('redirectUri'),
    mode: "single"
});

const username = process.env.SF_USER ? process.env.SF_USER : config.get('sf-user');
const password = process.env.SF_PASS ? process.env.SF_PASS : config.get('sf-pass');
console.log(username, password);
org.authenticate({ username: username, password: password}, function(err, resp){
    // the oauth object was stored in the connection object
    console.log(err);
    if(!err) {
        console.log('Cached Token: ' + org.oauth.access_token)
    }
});
module.exports = org;