'use strict';

var express = require('express');
var User = require(__dirname + '/../models/user');
var jsonParser = require('body-parser').json();
var handleError = require(__dirname + '/../lib/handle_error');
var httpBasic = require(__dirname + '/../lib/http_basic');
var EE = require('events').EventEmitter;

var usersRouter = module.exports = exports = express.Router();

usersRouter.post('/signup', jsonParser, function(req, res) {
  var routeEvents = new EE();
  var newUser = new User();
  newUser.basic.username = req.body.username;
  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.generateHash(req.body.password, function(err, hash) {
    if (err) {
      return res.send("Meow!, Could not authenticat");
    }
      routeEvents.emit("hasher", hash);
  });
  routeEvents.on("hasher", function(hash) {
    newUser.save(function(err, data) {
      if (err) {
        return res.status(400).json({err:"Meow!, Could not authenticat"});
      }
        routeEvents.emit("save", data);
    });
  });
  routeEvents.on("save", function(data) {
    newUser.generateToken(function(err, token) {
      if (err) {
        return res.send("Meow!, Could not authenticat");
      }
        return res.json({token: token});
    });
  });
});

usersRouter.get('/signin', httpBasic, function(req, res) {
  var signinEvents = new EE();
  User.findOne({'basic.username': req.auth.username}, function(err, user) {
    if (err) return handleError(err, res);
    if (!user) {
      return res.status(401).json({msg: 'Meow! Could not authenticat!'});
    }
    signinEvents.emit("findOne", user);
  });

  signinEvents.on("findOne", function(user) {
    user.compareHash(req.auth.password, function(err, hashRes) {
      if (err) return handleError(err, res);
      if (!hashRes) {
        return res.status(401).json({msg: 'Meow! Could not authenticat!'});
      }
      signinEvents.emit("compare", user);
    });
  });

  signinEvents.on("compare", function(user) {
    user.generateToken(function(err, token) {
      if (err) return handleError(err, res);
        res.json({token: token});
    });
  });
});
