'use strict';

var EE = require('events').EventEmitter;
var handleError = require(__dirname + '/../lib/handle_error');
var verifier = require(__dirname + '/../lib/verify');

var userEvents = new EE();

userEvents.on("hash_generated", function(resp, newUser) {
  newUser.save(function(err, data) {
    if (err) {
      return resp.status(400).json({err:"Meow!, Could not authenticat"});
    }
    verifier(newUser.email, newUser.username);

    userEvents.emit("user_signed_in", resp, newUser);
  });
});

userEvents.on("user_found", function(req, resp, user) {
  user.compareHash(req.auth.password, function(err, hashresp) {
    if (err) {
      return handleError(err, resp);
    }
    if (!hashresp) {
      return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
    }

    userEvents.emit("user_signed_in", resp, user);
  });
});

userEvents.on("user_signed_in", function(resp, user) {
  user.generateToken(function(err, token) {
    if (err) {
      return handleError(err, resp);
    }

    resp.json({token: token});
  });
});

module.exports = userEvents;
