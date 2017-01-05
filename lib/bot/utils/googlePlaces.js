const GooglePlaces = require('googleplaces');
const config = require('config');
const googleApi = (process.env.GOOGLE_API) ? process.env.GOOGLE_API : config.get('google-api');
const format = 'json';
module.exports = new GooglePlaces(googleApi, format);