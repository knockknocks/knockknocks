'use strict';

var express = require('express');
var jsonParser = require('body-parser').json();
var Joke = require(__dirname + '/../models/joke');
//var handleError = require(__dirname + '/../lib/handle_error');

var jokeRouter = module.exports = exports = express.Router();

//should go to login/signup screen; if login token, tell joke
jokeRouter.get('/joke', function(req, resp) {
  //we need multiple GETs and POSTs to take care of back-and-forth telling of jokes
  
  //retrieve joke for session, show ID and open with "Knock knock."
  //when finding a joke, need to find one within the user's not_seen array
  Joke.findOne({ID: 1}, function(err, data) {
    if(err) {
      return err;
    }
    
    var jokeText = "Joke #" + data.ID + "\n";
    jokeText +=  "Knock knock.\n"; //first line to send

    resp.json({msg: jokeText, meta: data.ID});  //send token, also send joke ID?
  });
});

jokeRouter.post('/joke/who', jsonParser, function(req, resp) {
  console.log('/joke/who', req.body);
  if(req.body.msg)
  {
    Joke.findOne({ID: 1}, function(err, data) {
    if(err) {
      return err;
    }

    var jokeText = data.setup + ".\n";

    resp.json({msg: req.body.msg + "\n" + jokeText, meta: data.ID});  //also send token
    });
  }
  else {
    resp.json({msg: "Knock knock.\n"});   //also send token, and joke ID?
  }
});

jokeRouter.post('/joke/punchline', jsonParser, function(req, resp) {
  Joke.findOne({ID: 1}, function(err, data) {
    if(err) {
      return err;
    }

    if(req.body.msg) {

      var jokeText = data.punchline + ".";

      resp.json({msg: req.body.msg + "\n" + jokeText, meta: data.ID});  //also send token
    }
    else {
      resp.json(data.setup + ".\n");  //also send token, and joke ID?
    }
  });
});

//jokeRouter.post('/joke/vote') -- vote for joke just heard, update user's unseen list

//we need multiple GETs and POSTs to take care of back-and-forth telling of jokes
jokeRouter.post('/joke', jsonParser, function(req, resp) {
  var newJoke = new Joke(req.body);

  newJoke.save(function(err, data) {
    if(err) {
      return resp.status(401).json({msg: "could not make joke"});
    }

    resp.json(data);
  });
});


