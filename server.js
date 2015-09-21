var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/knockknocks_dev');
process.env.APP_SECRET = process.env.APP_SECRET || 'safeword';

var usersRouter = require(__dirname + '/routes/users_routes');
app.use('/api', usersRouter);


var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('server up on port: ' + port);
});
