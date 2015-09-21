'use strict';

var nev = require('email-verification'),
    User = require('./app/userModel'),
    mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/YOUR_DB');

