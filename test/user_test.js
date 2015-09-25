'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);
var mongoose = require('mongoose');

var Joke = require(__dirname + '/../models/joke');
var Counter = require(__dirname + '/../models/counter');
var User = require(__dirname + '/../models/user');

describe("user schema", function() {
  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });

  before(function(done) {
    var jokeCounter = new Counter({_id: 'entityId'});
    jokeCounter.save(function(err) {
      if(err) {
        throw err;
      }
      done();
    });
  });
  before(function(done) {
    var user = new User();
    user.email = 'aak@test.com';
    user.username = 'aak';
    user.basic.username = 'aak';
    user.generateHash('aakaak', function(err) {
      if(err) {
        throw err;
      }
      user.save(function(err) {
        if(err) {
          throw err;
        }
        user.generateToken(function(err, token) {
          if(err) {
            throw err;
          }
          this.token = token;
          done();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  });

  it("should have default unseen-jokes and joke index when there are no jokes", function(done) {
    User.findOne({}, function(err, data) {
      if(err) {
        throw err;
      }
      expect(data.email).to.eql('aak@test.com');
      expect(data.unseenJokes).to.have.length(0);
      expect(data.jokeIndex).to.eql(0);
      done();
    });
  });

  describe("with jokes in database", function() {
    before(function(done) {
      var testJoke = new Joke({
        setup: "To",
        punchline: "To WHOM",
        author: "admin"
      });
      testJoke.indexText();
      testJoke.save(function(err) {
        if(err) {
          return err;
        }
        done();
      });
    });
    before(function(done) {
      var testJoke2 = new Joke({
        setup: "Old Lady",
        punchline: "I didn't know you could yodel",
        author: "admin"
      });
      testJoke2.indexText();
      testJoke2.save(function(err) {
        if(err) {
          return err;
        }
        done();
      });
    });

    it("should be able to update their unseen array and index", function(done) {
      User.findOne({}, function(err, data) {
        data.updateUnseenArray(function(err) {
          expect(err).to.eql(null);
          expect(data.email).to.eql('aak@test.com');
          expect(data.unseenJokes).to.have.length(2);
          expect(data.jokeIndex).to.eql(2);
          done();
        });
      });
    });

    it("should be able to remove a joke from the unseen array", function(done) {
      User.findOne({}, function(err, data) {
        data.unseenPop(1, function(err) {
          expect(err).to.eql(null);
          expect(data.unseenJokes).to.have.length(1);
          expect(data.unseenJokes[0]).to.eql(2);
          done();
        });
      });
    });
  });
});
