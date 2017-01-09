'use strict';
const config = require('config');
const nforce = require('nforce');
const org = nforce.createConnection({
    clientId: config.get('clientId'),
    clientSecret: config.get('clientSecret'),
    redirectUri: config.get('redirectUri')
});

org.authenticate({ username: process.env.SF_USER, password: process.env.SF_PASS}, function(err, resp){
    // the oauth object was stored in the connection object
    if(!err) console.log('Cached Token: ' + org.oauth.access_token)
});

module.exports = org;