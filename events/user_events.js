'use strict';

var EE = require('events').EventEmitter;

var handleError = require(__dirname + '/../lib/handle_error');

var userEvents = new EE();

userEvents.on("hash_generated", function(resp, newUser) {
  newUser.save(function(err) {
    if(err) {
      //this error would be a database error, should be 500?
      return resp.status(400).json({err:"Meow!, Could not authenticat"});
    }
    
    userEvents.emit("user_signed_in", resp, newUser);
  });
});

userEvents.on("user_found", function(req, resp, user) {
  user.compareHash(req.auth.password, function(err, hashresp) {
    if(err) {
      return handleError(err, resp);  //err = bcrypt compare error; would be shown as server error (500)
    }
    if(!hashresp) {
      //this error seems correct
      return resp.status(401).json({msg: 'Meow! Could not authenticat!'});
    }
    
    userEvents.emit("user_signed_in", resp, user);
  });
});

userEvents.on("user_signed_in", function(resp, user) {
  user.updateUnseenArray(function(err) {
    if(err) {
      return handleError(err, resp);  //err = database error; would be shown as server error (500)
    }
  });

  //create and send token to signed-in user
  user.generateToken(function(err, token) {
    if(err) {
      return handleError(err, resp);  //err = eat encoding error; would be shown as server error (500)
    }
    
    resp.json({token: token});
  });
});

module.exports = userEvents;
