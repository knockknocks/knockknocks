'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);
var mongoose = require('mongoose');

var Joke = require(__dirname + '/../models/joke');
var Counter = require(__dirname + '/../models/counter');
var User = require(__dirname + '/../models/user');
var eatauth = require(__dirname + '/../lib/eat_auth');

process.env.MONGO_URL = 'mongodb://localhost/knockknocks_dev';
require(__dirname + '/../server.js');
var kkPORT = (process.env.PORT || 3000);
var url = 'localhost:' + kkPORT;

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

  it("should have default values for unseen-jokes array and joke index after sign-in when there are no jokes", function(done) {
    User.findOne({}, function(err, data) {
      if(err) {
        throw err;
      }
      expect(data.email).to.eql('aak@test.com')
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
      testJoke.save(function(err, data) {
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
      testJoke2.save(function(err, data) {
        if(err) {
          return err;
        }
        done();
      });
    });

    it("should be able to update their unseen array and index", function(done) {
      User.findOne({}, function(err, data) {
        data.updateUnseenArray(function(err) {
          expect(data.email).to.eql('aak@test.com');
          expect(data.unseenJokes).to.have.length(2);
          expect(data.jokeIndex).to.eql(2);
          done();
        });
      });
    });
  });
});
