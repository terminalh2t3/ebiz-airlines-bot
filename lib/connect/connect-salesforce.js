'use strict';
const config = require('config');
const nforce = require('nforce');
const clientId = process.env.CLIENT_ID ? process.env.CLIENT_ID : config.get('clientId');
const clientSecret = process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : config.get('clientSecret');
const redirectUri  = process.env.ROOT_URL ? process.env.ROOT_URL : config.get('root-url') + '/oauth/_callback';
const username = process.env.SF_USER ? process.env.SF_USER : config.get('sf-user');
const password = process.env.SF_PASS ? process.env.SF_PASS : config.get('sf-pass');
const org = nforce.createConnection({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
    mode: "single",
    username: username,
    password: password,
});

module.exports = org;