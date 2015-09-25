'use strict';

var mgUser = 'postmaster@sandbox80296516be48457ca65a71e4904c28c8.mailgun.org';
var mgPassword = '936d8051b9584f1ffc47165f413fed39'
var nodemailer = require('nodemailer');

module.exports = exports = function verifier(userEmail, userName) {

  var clickBack = userName + ':' + userEmail;
  var encodedClickBack = new Buffer(clickBack).toString('base64');
  var text = 'Click on this to verify your email! http:localhost:3000/verify/' + encodedClickBack;

  var transporter = nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
          user: mgUser,
          pass: mgPassword
      }
  });

  var mailOptions = {
  from: 'noReply@knockknocks.net', // sender address
  to: userEmail,
  subject: 'Verify Your Email!',
  text: text // plaintext body
  // html: '<b>Hello world ✔</b>' // can choose to send an HTML body instead
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log('error thing', error);
    }else{
        console.log('Message sent: ' + info.response);


    };
  });
};




