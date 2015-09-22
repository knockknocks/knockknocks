'use strict';

var express = require('express');
var User = require(__dirname + '/../models/user');
var jsonParser = require('body-parser').json();
var handleError = require(__dirname + '/../lib/handle_error');
var httpBasic = require(__dirname + '/../lib/http_basic');
var EE = require('events').EventEmitter;

var usersRouter = module.exports = exports = express.Router();

usersRouter.post('/signup', jsonParser, function(req, resp) {
  var routeEvents = new EE();
  var newUser = new User();
  newUser.basic.username = req.body.username;
  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.generateHash(req.body.password, function(err, hash) {
    if (err) {
      return resp.send("Meow!, Could not authenticat");
    }
      routeEvents.emit("hasher", hash);
  });
  routeEvents.on("hasher", function(hash) {
    newUser.save(function(err, data) {
      if (err) {
        return resp.status(400).json({err:"Meow!, Could not authenticat"});
      }
        routeEvents.emit("save", data);
    });
  });
  routeEvents.on("save", function(data) {
    newUser.generateToken(function(err, token) {
      if (err) {
        return resp.send("Meow!, Could not authenticat");
      }
        return resp.json({token: token});
    });
  });
});

usersRouter.get('/signin', httpBasic, function(req, resp) {
  var signinEvents = new EE();
  User.findOne({'basic.username': req.auth.username}, function(err, user) {
    if (err) return handleError(err, resp);
    if (!user) {
      return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
    }
    signinEvents.emit("findOne", user);
  });

  signinEvents.on("findOne", function(user) {
    user.compareHash(req.auth.password, function(err, hashresp) {
      if (err) return handleError(err, resp);
      if (!hashresp) {
        return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
      }
      signinEvents.emit("compare", user);
    });
  });

  signinEvents.on("compare", function(user) {
    user.generateToken(function(err, token) {
      if (err) return handleError(err, resp);
        resp.json({token: token});
    });
  });
});
