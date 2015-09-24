'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();

var mgUser = 'postmaster@sandbox80296516be48457ca65a71e4904c28c8.mailgun.org';
var mgPassword = '936d8051b9584f1ffc47165f413fed39'
var nodemailer = require('nodemailer');

var User = require(__dirname + '/../models/user');
var handleError = require(__dirname + '/../lib/handle_error');
var httpBasic = require(__dirname + '/../lib/http_basic');
var userEvents = require(__dirname + '/../events/user_events');

var usersRouter = module.exports = exports = express.Router();

usersRouter.post('/signup', jsonParser, function(req, resp) {
  var newUser = new User();
  newUser.basic.username = req.body.username;
  newUser.username = req.body.username;
  newUser.email = req.body.email;

  newUser.generateHash(req.body.password, function(err, hash) {
    if (err) {
      return resp.send("Meow!, Could not authenticat");
    }

    userEvents.emit("hash_generated", resp, newUser, hash);
  });
});

usersRouter.get('/signin', httpBasic, function(req, resp) {
  User.findOne({'basic.username': req.auth.username}, function(err, user) {
    if (err) {
      return handleError(err, resp);
    }
    if (!user) {
      return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
    }

    userEvents.emit("user_found", req, resp, user);
  });
});

usersRouter.get('/verify/:clickback', function(req, resp) {
  var decodedString = new Buffer(req.params.clickback, 'base64').toString('ascii')
  var splitString = decodedString.split(':');
  console.log(splitString[0]);
  User.findOne({'basic.username': splitString[0]}, function(err, user){
    console.log('findOne Error', err);
    console.log('findOne User', user);
    if (err) {
      return handleError(err, resp);
    }
    if (!user)  {
      return ('Meow! Could not authenticat!');
    }
    user.valid = true;
    return ('Account validated!');
  })
  resp.end();
});


