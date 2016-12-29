'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const ContactDetail = require('./ContactDetail');
const Passenger = ModelBase.extend({
    tableName: 'Passenger',
    idAttribute: "passenger_id",
    hasTimestamps: false,
    contactDetail: function () {
        return this.belongsTo('ContactDetail')
    }
});

module.exports = bookshelf.model('Passenger', Passenger);