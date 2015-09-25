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
//var User = require(__dirname + '/../models/user');
var handleError = require(__dirname + '/../lib/handle_error');
var eatAuth = require(__dirname + '/../lib/eat_auth');
var jokeEvents = require(__dirname + '/../events/joke_events');

var jokeRouter = module.exports = exports = express.Router();

/**
 * @name
    GET /knockknock
 * @method
    Logged-in users looking to be told a joke go to the /knockknock endpoint.\n
    This path finds a joke the user hasn't seen yet and responds with the joke ID and "Knock knock."\n
    It also sends back a joke token so we know which joke we're telling between requests and responses.
 */
jokeRouter.post('/knockknock', jsonParser, eatAuth, function(req, resp) {
  jokeEvents.emit('user_knocked', resp, req.user, req.body.token);
});

/**
 * @method
    Logged-in users go to the /whosthere endpoint to ask who's knocking.\n
    This path responds with the setup.\n
    It uses the joke token to find which joke we're telling and sends it back again.
 */
jokeRouter.post('/whosthere', jsonParser, eatAuth, function(req, resp) {
  Joke.findOne({ID: req.body.jtoken}, function(err, data) {
    if(err) {
      return handleError(err, resp);  //err = database error; should be shown as server error (500)
    }

    var jokeText = data.setup + ".\n";
    resp.json({msg: jokeText,
      token: req.body.token,
      jtoken: data.generateToken()});  //also send token
  });
});

/**
 * @method
    Logged-in users go to the /punchline endpoint to finish hearing the joke.\n
    This path responds with the punchline.\n
    It uses the joke token to find which joke we're telling and sends it back again.\n
    The user's unseen list will also be updated.
 */
jokeRouter.post('/punchline/', jsonParser, eatAuth, function(req, resp) {
  Joke.findOne({ID: req.body.jtoken}, function(err, data) {
    if(err) {
      return handleError(err, resp);  //err = database error; should be shown as server error (500)
    }

    req.user.unseenPop(data.ID, function(err) {
      if(err) {
        return handleError(err, resp);
      }
    });

    var jokeText = data.punchline + ".";
    resp.json({
      msg: jokeText, token: req.body.token,
      jtoken: data.generateToken()});
  });
});

/**
 * @method
    Logged in users go to the /rate endpoint after hearing a joke and rating it.\n
    This path responds with the rating of the joke, after calculating the user's input.\n
    It uses the joke token to find which joke we told and update its rating accordingly.
 */
jokeRouter.post('/rate', jsonParser, eatAuth, function(req, resp) {
  Joke.findOne({ID: req.body.jtoken}, function(err, data) {
    if(err) {
      return handleError(err, resp);  //err = database error; should be shown as server error (500)
    }

    data.updateRating(req.body.rating, resp);

    resp.json({msg: "The average rating for this joke is " + data.rating.toFixed(1) + " knocks!\n"});
  });
});

//user sends "Knock knock" so server can hear joke
jokeRouter.post('/joke', jsonParser, eatAuth, function(req, resp) {
  resp.json({msg: "Who's there?\n", token: req.body.token});
});

//user sends setup for joke:
jokeRouter.post('/joke/setup', jsonParser, eatAuth, function(req, resp) {
  resp.json({msg: req.body.setup + " who?\n", token: req.body.token});
});

//user sends punchline; joke gets saved
jokeRouter.post('/joke/punchline', jsonParser, eatAuth, function(req, resp) {
  var newJoke = new Joke(req.body);

  //see if we already heard that one
  Joke.findOne({searchableText: newJoke.indexText()}, function(err, data) {
    if(err) {
      return handleError(err, resp);  //err = database error; should be shown as server error (500)
    }

    if(data !== null) {
      return resp.json({msg: "Already heard that one!"});
    }

    //save if we haven't heard it; include username as author
    newJoke.author = req.user.username;
    newJoke.save(function(err) {
      if(err) {
        return handleError(err, resp);  //err = database error; should be shown as server error (500)
      }

      resp.json({msg: "Thanks, " + req.user.username + "! That's a new one!"});
    });
  });
});
