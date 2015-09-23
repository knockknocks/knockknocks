'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/knockknocks_dev');

var kkLog = require(__dirname + '/lib/knockknocks_log');

process.env.APP_SECRET = process.env.APP_SECRET || 'safeword';
var usersRouter = require(__dirname + '/routes/users_routes');
app.use('/', usersRouter);

var jokeRouter = require(__dirname + '/routes/jokes_routes');
app.use('/', jokeRouter);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  kkLog('knockknocks server listening on ' + port + ' at ' + new Date().toString());
});

var pubkey = 'api:key-79950cd57663d6ddced487967c96de02';


var validator = require('mailgun-validate-email')(pubkey)
validator("jallengerber@gmail.com", function (err, result){
  if(err) {
    console.log('errorrrrrrr', err);// email was not valid
  } else {
    console.log('result is', result);
    // register the person for your service etc.
  }
});
