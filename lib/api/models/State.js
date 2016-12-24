'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Country = require('./State');
const ContactDetail = require('./ContactDetail');
const State = ModelBase.extend({
    tableName: 'public.State',
    hasTimestamps: false,
    country: function() {
        return this.belongsTo(Country);
    },
    contactDetail: function () {
        return this.hasMany(ContactDetail);
    }
}, {
    findState: function (stateName, callback) {
        return this.forge().query({where:{ state_name: stateName }}).fetch().then(callback);
    }
});

module.exports = State;