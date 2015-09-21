'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/knockknocks_dev');

//var kkRouter = require(__dirname + '/routes/lyrics_routes');
var kkLog = require(__dirname + '/lib/knockknocks_log');

//app.use('/api', kkRouter);  // this "mounts" the router at the URL

var port = process.env.PORT || 3333;
app.listen(port, function() {
  kkLog('knockknocks server listening on ' + port + ' at ' + new Date().toString());
});
