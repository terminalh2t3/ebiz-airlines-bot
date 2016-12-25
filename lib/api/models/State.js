'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Country = require('./State');
const ContactDetail = require('./ContactDetail');
const State = ModelBase.extend({
    tableName: 'public.State',
    idAttribute: "state_id",
    hasTimestamps: false,
    country: function() {
        return this.belongsTo(Country);
    },
    contactDetail: function () {
        return this.hasMany(ContactDetail);
    }
}, {
    findState: function (postCode, callback) {
        return this.forge().query({where:{ postal_code: postCode }}).fetch().then(callback);
    }
});

module.exports = State;