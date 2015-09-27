'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);
var mongoose = require('mongoose');

var Joke = require(__dirname + '/../models/joke');
var Counter = require(__dirname + '/../models/counter');

require(__dirname + '/../server.js');
var kkPORT = (process.env.PORT || 3000);
var jokeURL = 'localhost:' + kkPORT;

describe("the joke resource", function() {
  before(function(done) {
    var jokeCounter = new Counter({_id: 'entityId'});
    jokeCounter.save(function(err, data) {
      if(err) {
        throw err;
      }
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function(err) {
      if(err) {
        throw err;
      }
      done();
    });
  });

  it("should respond to 'Knock knock.'", function(done) {
    chai.request(jokeURL)
      .get('/joke')
      .end(function(err, resp) {
        expect(err).to.eql(null);
        expect(resp.status).to.eql(200);
        expect(resp.body.msg).to.eql("Who's there?\n");
        done();
      });
  });

  it("should listen for setup", function(done) {
    chai.request(jokeURL)
      .post('/joke/setup')
      .send({setup: "Old Lady"})
      .end(function(err, resp) {
        expect(err).to.eql(null);
        expect(resp.status).to.eql(200);
        expect(resp.body.msg).to.eql("Old Lady who?\n");
        done();
      });
  });

  it("should listen for punchline and save joke", function(done) {
    chai.request(jokeURL)
      .post('/joke/punchline')
      .send({setup: "Old Lady", punchline: "I didn't know you could yodel"})
      .end(function(err, resp) {
        expect(err).to.eql(null);
        expect(resp.status).to.eql(200);
        expect(resp.body.msg).to.eql("That's a new one!");
        done();
      });
  });

  describe("routes that need a joke in the database", function() {
    before(function(done) {
      var testJoke = new Joke({
        setup: "To.",
        punchline: "To WHOM.",
        author: "admin"
      });

      testJoke.save(function(err, data) {
        if(err) {
          return err;
        }

        this.testJoke = data;
        done();
      }.bind(this));
    });
/*
"Knock knock.\n"    //ideally: server sends this on get                           (server starts a joke)
+ "Who's there?\n"  //user says this (or something)                               (user instigates joke)
+ "To.\n"           //setup: server sends in response to new GET with string      (server sends setup)
+ "To who?\n"       //user says this (or something)                               (user consents to joke)
+ "To WHOM.");      //punchline: server sends in response to new GET with string  (server completes joke: remove from user's unseen list)
*/
    it("should be able to tell a joke", function(done) {
      chai.request(jokeURL)
        .get('/knockknock')
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("Knock knock\n");
          expect(resp.body.token).to.eql(1);
          done();
        });
    });

    it("should be able to respond to set up the joke", function(done) {
      chai.request(jokeURL)
        .get('/whosthere/1')
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("To.\n");
          expect(resp.body.token).to.eql(1);
          done();
        });
    });

    it("should be able to tell the punchline", function(done) {
      chai.request(jokeURL)
        .get('/punchline/1')
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("To WHOM.");
          expect(resp.body.token).to.eql(1);
          done();
        });
    });

    it("should be able to rate a joke", function(done) {
      chai.request(jokeURL)
        .post('/rate/1')
        .send({rating: 4})
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("The average rating for this joke is 4.0 knocks!\n");
          done();
        });
    });

    it("should not save a duplicate joke", function(done) {
      chai.request(jokeURL)
        .post('/joke/punchline')
        .send({setup: "To.", punchline: "To WHOM.", author: "admin"})
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("Already heard that one!");
          done();
        });
    });
  });
});
