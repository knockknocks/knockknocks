'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded({extended: true});
var jsonParser = bodyParser.json();
var fs = require('fs');
//var handleError = require(__dirname + '/../lib/handle_error');

var spikeRouter = module.exports = exports = express.Router();

spikeRouter.get('/', function(req, resp) {
  resp.render('initial.ejs');
});

spikeRouter.post('/login', urlParser, function(req, resp) {
  var logStr = req.body.login;
  var passStr = req.body.password;
  var isEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  if (isEmail.test(logStr)) {
    if ('stale' === logStr.slice(0,5))
      resp.render('emailUsed.ejs');
    else
      resp.render('welcome.ejs', { emailParam: logStr });
  }
  else {
    if (!passStr)
      resp.render('userLogin.ejs', { loginParam: logStr });
    else
      resp.render('logged.ejs', { userParam: logStr });
  }
});

spikeRouter.post('/signup', urlParser, function(req, resp) {
  var emailStr = req.body.email;
  var logStr = req.body.login;
  var passStr = req.body.password;
  resp.render('logged.ejs', { userParam: logStr });
});

spikeRouter.post('/joke', urlParser, function(req, resp) {
  var userStr = req.body.user;
  var jokeID = 'joke' + (1 + fs.readdirSync('jokes').length);
  fs.writeFileSync('jokes/' + jokeID, '');  // placehold the file
  var jokeStr = userStr + '_' + jokeID;
  resp.render('whosThere.ejs', { jokeParam: jokeStr });
});

spikeRouter.post('/setup', urlParser, function(req, resp) {
  var jokeStr = req.body.jokeToken;
  var setupStr = req.body.setup;
  resp.render('punchline.ejs', { jokeParam: jokeStr, setupParam: setupStr });
})

spikeRouter.post('/punchline', urlParser, function(req, resp) {
  var jokeStr = req.body.jokeToken;
  var setupStr = req.body.setup;
  var punchStr = req.body.punchline;
  var userStr = jokeStr.split('_')[0];
  var jokeID = jokeStr.split('_')[1];
  fs.appendFileSync('jokes/' + jokeID, JSON.stringify({
    author: userStr, setup: setupStr, punchline: punchStr,
    rating: { count: 0, total: 0 }
  }));
  resp.render('goodOne.ejs', { userParam: userStr,
                               setupParam: setupStr,
                               punchParam: punchStr });
});

spikeRouter.post('/telljoke', urlParser, function(req, resp) {
  var userStr = req.body.user;
  var jokeMax = fs.readdirSync('jokes').length;
  var jokeID = 'joke' + (1 + Math.floor(Math.random() * jokeMax));
  var jokeStr = userStr + '_' + jokeID;
  var joke = JSON.parse(fs.readFileSync('jokes/' + jokeID));
  resp.render('knockKnock.ejs', { jokeParam: jokeStr,
    authorParam: joke.author, setupParam: joke.setup, punchParam: joke.punchline });
});

spikeRouter.post('/tellsetup', urlParser, function(req, resp) {
  var jokeStr = req.body.jokeToken;
  var authorStr = req.body.author;
  var setupStr = req.body.setup;
  var punchStr = req.body.punchline;
  resp.render('setupWho.ejs', { jokeParam: jokeStr,
    authorParam: authorStr, setupParam: setupStr, punchParam: punchStr });
});

spikeRouter.post('/tellpunchline', urlParser, function(req, resp) {
  var jokeStr = req.body.jokeToken;
  var userStr = jokeStr.split('_')[0];
  var jokeID = jokeStr.split('_')[1];
  var authorStr = req.body.author;
  var setupStr = req.body.setup;
  var punchStr = req.body.punchline;
  resp.render('rateJoke.ejs', { jokeParam: jokeStr, userParam: userStr,
    authorParam: authorStr, setupParam: setupStr, punchParam: punchStr });
});

spikeRouter.post('/rate', urlParser, function(req, resp) {
  var jokeStr = req.body.jokeToken;
  var userStr = jokeStr.split('_')[0];
  var jokeID = jokeStr.split('_')[1];
  var rating = Number(req.body.rating);
  var joke = JSON.parse(fs.readFileSync('jokes/' + jokeID));
  joke.rating.count++;
  joke.rating.total += rating;

  fs.writeFileSync('jokes/' + jokeID, JSON.stringify({
    author: joke.author, setup: joke.setup, punchline: joke.punchline,
    rating: { count: joke.rating.count, total: joke.rating.total }
  }));
  var ratingAvg = joke.rating.total / joke.rating.count;
  console.log (joke.rating.total, joke.rating.count, ratingAvg);
  resp.render('rateResult.ejs', { rateCount: joke.rating.count,
    ratingParam: ratingAvg, userParam: userStr,
    authorParam: joke.author, setupParam: joke.setup, punchParam: joke.punchline
  });
});

spikeRouter.post('/logout', urlParser, function(req, resp) {
  resp.render('initial.ejs');
});

// spikeRouter.get('/', function(req, resp) {
//   //we need one GET or multiple(?) to take care of back-and-forth telling of jokes
//   var jokeText =  "Knock knock.\n"; //first line to send
//   jokeText +=      "Who's there?\n"; //second line: user response
//   //when finding a joke, need to find one within the user's not_seen array
//   Joke.findOne({ID: 1}, function(err, data) {
//     if(err) {
//       return err;
//     }
//     jokeText += data.setup + ".\n";
//     jokeText += data.setup + " who?\n";
//     jokeText += data.punchline + ".";
//     resp.json({msg: jokeText});
//   });
// });

// spikeRouter.post('/joke', jsonParser, function(req, resp) {
//   var newJoke = new Joke(req.body);
//   newJoke.save(function(err, data) {
//     if(err) {
//       return resp.status(401).json({msg: "could not make joke"});
//     }
//     resp.json(data);
//   });
// });
