'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var eat = require('eat');

var userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  email: {type: String, unique: true},
  basic: {
    username: String,
    password: String
  }

  // unseen_jokes: Array,  //contains IDs of unseen jokes
  // jokeIndex: Number, // keeps track of highest ID added to unseen jokes
  // adult: Boolean  //for allowing adult jokes; not in use yet
});

userSchema.methods.generateHash = function(password, callback) {
  bcrypt.hash(password, 10, function(err, hash) {
    if (err) return callback(err);
    this.basic.password = hash;
    callback(null, hash);
  }.bind(this));
};

userSchema.methods.compareHash = function(password, callback) {
  bcrypt.compare(password, this.basic.password, callback);
};

userSchema.methods.generateToken = function(callback) {
  eat.encode({id: this._id}, process.env.APP_SECRET, callback);
};

module.exports = mongoose.model('User', userSchema);

