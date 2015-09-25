'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/knockknocks_dev');

var kkLog = require(__dirname + '/lib/knockknocks_log');

process.env.APP_SECRET = process.env.APP_SECRET || 'safeword';
var usersRouter = require(__dirname + '/routes/users_routes');
app.use('/', usersRouter);

var jokeRouter = require(__dirname + '/routes/jokes_routes');
app.use('/', jokeRouter);

// var spikeRouter = require(__dirname + '/routes/spike_routes');

// app.use(express.static('assets'));
// app.set('view engine', 'ejs');

// app.use('/', spikeRouter);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  kkLog('knockknocks server listening on ' + port + ' at ' + new Date().toString());
});














