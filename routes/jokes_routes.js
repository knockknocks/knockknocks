'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();
var Joke = require(__dirname + '/../models/joke');
var handleError = require(__dirname + '/../lib/handle_error');

var jokeRouter = module.exports = exports = express.Router();

jokeRouter.get('/knockknock', function(req, resp) {
  //we need multiple GETs and POSTs to take care of back-and-forth telling of jokes
  
  //retrieve joke for session, show ID and open with "Knock knock."
  //when finding a joke, need to find one within the user's not_seen array
  Joke.findOne({ID: 1}, function(err, joke) {
    if(err) {
      return handleError(err, resp);
    }
    
    var jokeText = "Knock knock\n"; //first line to send

    resp.json({msg: jokeText, token: joke.generateToken()});  //send token, also send joke ID?
  });
});

jokeRouter.get('/whosthere/*', function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    var jokeText = data.setup + "\n";
    resp.json({msg: jokeText, token: data.generateToken()});  //also send token
  });
});

jokeRouter.get('/punchline/*', function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    var jokeText = data.punchline;
    resp.json({msg: jokeText, token: data.generateToken()});
  });
});

jokeRouter.post('/rate/*', jsonParser, function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    data.updateRating(req.body.rating, resp);

    //*******TODO: update user's unseen list*******

    resp.json({msg: "The average rating for this joke is " + data.rating.toFixed(1) + " knocks!\n"});
  });
});

//user sends "Knock knock" so server can hear joke
jokeRouter.get('/joke', function(req, resp) {
  resp.json({msg: "Who's there?\n"});

  //will include user token
});

//user sends setup for joke:
jokeRouter.post('/joke/setup', jsonParser, function(req, resp) {
  resp.json({msg: req.body.setup + " who?\n"});
});

//user sends punchline; joke gets saved
jokeRouter.post('/joke/punchline', jsonParser, function(req, resp) {
  var username = "me";

  //see if we already heard that one
  Joke.findOne({setup: req.body.setup, punchline: req.body.punchline}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    if(data !== null) {
      return resp.json({msg: "Already heard that one!"});
    }

    //save if we haven't heard it; include username as author
    var newJoke = new Joke(req.body);
    newJoke.author = username;
    
    newJoke.save(function(err) {
      if(err) {
        return handleError(err, resp);
      }

      resp.json({msg: "That's a new one!"});
    });
  });
});


