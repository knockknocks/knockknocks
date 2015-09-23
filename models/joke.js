/**
 * @fileOverview
    Defines the joke schema.
 * @author
    Austin King
  */

'use strict';

var mongoose = require('mongoose');

var handleError = require(__dirname + '/../lib/handle_error');
var Counter = require(__dirname + '/counter');

/**
 * The joke schema is used to store jokes given by users.
 * @prop  {string}  setup       
    The line after "Who's there?"
 * @prop  {string}  punchline   
    The line after "_____ who?"
 * @prop  {string}  author      
    The author (user) who submitted the joke.
 * @prop  {boolean} adult_only  
    A flag to indicate the joke is explict and meant for users marked "adult."
 */
var jokeSchema = new mongoose.Schema({
  ID: {type: Number, unique: true},
  setup: {type: String, trim: true},
  punchline: {type: String, trim: true},
  author: String,
  rating: {type: Number, min: 1, max: 5, default: 1}, //one of the first stretch goals
  numberOfRatings: {type: Number, default: 0}
  //, adult_only: Boolean {default: true} //not in use right away
});

//validation: make setup and punchline initial capped; case-insensitive, no-punctuation validation

jokeSchema.pre('save', function(next) {
  Counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, function(err, counter)   {
    debugger;
    if(err) {
      return next(err);
    }

    this.ID = counter.seq;
    next();
  }.bind(this));
});

/************** METHODS ******************/
//respond with setups and punchlines, include author?
//respond to setups and punchlines
jokeSchema.methods.generateToken = function() {
  return this.ID;
};

jokeSchema.methods.updateRating = function(latestRating, resp) {
  var oldTotalRating = this.rating * this.numberOfRatings;
  this.numberOfRatings++;
  this.rating = (oldTotalRating + latestRating) / this.numberOfRatings;
  this.save(function(err) {
    if(err) {
      return handleError(err, resp);
    }
  });
};

module.exports = mongoose.model('Joke', jokeSchema);
