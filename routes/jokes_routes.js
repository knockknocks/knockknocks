/**
 * @fileOverview
    Establishes the routes to interact with the joke database.
 * @author
    Austin King
 */

'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();
var Joke = require(__dirname + '/../models/joke');
var handleError = require(__dirname + '/../lib/handle_error');

var jokeRouter = module.exports = exports = express.Router();

/**
 * @name
    GET /knockknock
 * @method
    Logged-in users looking to be told a joke go to the /knockknock endpoint.\n
    This path finds a joke the user hasn't seen yet and responds with the joke ID and "Knock knock."\n
    It also sends back a joke token so we know which joke we're telling between requests and responses.
 */
jokeRouter.get('/knockknock', function(req, resp) {
  //when finding a joke, need to find one within the user's not_seen array
  Joke.findOne({ID: 1}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }
    
    var jokeText = "Joke #" + data.ID + "\n";
    jokeText +=  "Knock knock.\n"; //first line to send

    resp.json({msg: jokeText, token: data.generateToken()});  //send token, also send joke ID?
  });
});

/**
 * @method
    Logged-in users go to the /whosthere endpoint to ask who's knocking.\n
    This path responds with the setup.\n
    It uses the joke token to find which joke we're telling and sends it back again.
 */
jokeRouter.get('/whosthere/*', function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    var jokeText = data.setup + ".\n";
    resp.json({msg: jokeText, token: data.generateToken()});  //also send token
  });
});

/**
 * @method
    Logged-in users go to the /punchline endpoint to finish hearing the joke.\n
    This path responds with the punchline.\n
    It uses the joke token to find which joke we're telling and sends it back again.\n
    The user's unseen list will also be updated.
 */
jokeRouter.get('/punchline/*', function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    //*******TODO: update user's unseen list*******

    var jokeText = data.punchline + ".";
    resp.json({msg: jokeText, token: data.generateToken()});
  });
});

/**
 * @method
    Logged in users go to the /rate endpoint after hearing a joke and rating it.\n
    This path responds with the rating of the joke, after calculating the user's input.\n
    It uses the joke token to find which joke we told and update its rating accordingly.
 */
jokeRouter.post('/rate/*', jsonParser, function(req, resp) {
  Joke.findOne({ID: req.params[0]}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    data.updateRating(req.body.rating, resp);

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
  var newJoke = new Joke(req.body);

  //see if we already heard that one
  Joke.findOne({searchableText: newJoke.indexText()}, function(err, data) {
    if(err) {
      return handleError(err, resp);
    }

    if(data !== null) {
      return resp.json({msg: "Already heard that one!"});
    }

    //save if we haven't heard it; include username as author
    newJoke.author = username;
    newJoke.save(function(err) {
      if(err) {
        return handleError(err, resp);
      }

      resp.json({msg: "That's a new one!"});
    });
  });
});
