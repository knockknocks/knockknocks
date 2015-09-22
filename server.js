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

var pubkey = 'api:key-79950cd57663d6ddced487967c96de02';


var validator = require('mailgun-validate-email')(pubkey)
validator("jallengerber@gmail.com", function (err, result){
  if(err) {
    console.log('errorrrrrrr', err);// email was not valid
  } else {
    console.log('result is', result);
    // register the person for your service etc.
  }
});
