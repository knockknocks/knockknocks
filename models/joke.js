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
  jokeText: {
    setup: {type: String, trim: true},
    punchline: {type: String, trim: true},
    searchable: {type: String, unique: true}
  },
  author: String,
  rating: {
    average: {type: Number, min: 1, max: 5, default: 1},
    count: {type: Number, min: 0, default: 0}
  }
  //, adult_only: Boolean {default: true} //not in use right away
});

//validation: make setup and punchline initial capped; case-insensitive, no-punctuation validation

jokeSchema.pre('save', function(next) {
  Counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: {seq: 1}}, function(err, counter) {
    if(err) {
      return next(err);
    }

    this.ID = counter.seq + 1;
    next();
  }.bind(this));
});

/************** METHODS ******************/
jokeSchema.methods.generateToken = function() {
  return this.ID;
};

jokeSchema.methods.updateRating = function(latestRating, resp) {
  var oldTotalRating = this.rating.average * this.rating.count;
  this.rating.count++;
  this.rating.average = (oldTotalRating + latestRating) / this.rating.count;
  this.save(function(err) {
    if(err) {
      return handleError(err, resp, 500);  //err = database error; show as server error (500)
    }
  });
};

jokeSchema.methods.indexText = function() {
  return this.jokeText.searchable = (this.jokeText.setup.toLowerCase().split(/[^a-z0-9]/).join('')
    + this.jokeText.punchline.toLowerCase().split(/[^a-z0-9]/).join(''));
};

module.exports = mongoose.model('Joke', jokeSchema);
