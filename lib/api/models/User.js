'use strict';
const BaseModel = require('./BaseModel');

class User extends BaseModel
{
    get tableName() {
        return 'users';
    }

    get hasTimestamps() {
        return true;
    }

    verifyPassword(password) {
        return this.get('password') === password;
    }

    static byEmail(email) {
        return this.forge().query({where:{ email: email }}).fetch();
    }
}