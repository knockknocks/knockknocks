'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();

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
    if(err) {
      return handleError(err, resp); //err = bcrypt hashing error; would be shown as server error (500)
    }
    
    userEvents.emit("hash_generated", resp, newUser, hash);
  });
});

usersRouter.get('/signin', httpBasic, function(req, resp) {  
  User.findOne({'basic.username': req.auth.username}, function(err, user) {
    if(err) {
      return handleError(err, resp);  //err = database error; would be shown as server error (500)
    }
    if(!user) {
      return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
    }

    userEvents.emit("user_found", req, resp, user);
  });
});
