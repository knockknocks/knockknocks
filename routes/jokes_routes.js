'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();
var Joke = require(__dirname + '/../models/joke');
//var handleError = require(__dirname + '/../lib/handle_error');

var jokeRouter = module.exports = exports = express.Router();

jokeRouter.get('/joke', function(req, resp) {
  //we need one GET or multiple(?) to take care of back-and-forth telling of jokes
  var jokeText =  "Knock knock.\n"; //first line to send
  jokeText +=      "Who's there?\n"; //second line: user response

  //when finding a joke, need to find one within the user's not_seen array
  Joke.findOne({ID: 1}, function(err, data) {
    if(err) {
      return err;
    }

    jokeText += data.setup + ".\n";
    jokeText += data.setup + " who?\n";
    jokeText += data.punchline + ".";

    resp.json({msg: jokeText});
  });
});

jokeRouter.post('/joke', jsonParser, function(req, resp) {
  var newJoke = new Joke(req.body);

  newJoke.save(function(err, data) {
    if(err) {
      return resp.status(401).json({msg: "could not make joke"});
    }

    resp.json(data);
  });
});
