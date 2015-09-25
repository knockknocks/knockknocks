'use strict';

var EE = require('events').EventEmitter;

var Counter = require(__dirname + '/../models/counter');

var counterEvents = new EE();

counterEvents.on('first_joke', function(joke, next) {
  var counter = new Counter();

  counter.save(function(err) {
    if(err) {
      return next(err);
    }

    joke.save(function(err) {
      if(err) {
        return next(err);
      }
    });
  });
});

module.exports = counterEvents;
