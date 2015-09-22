'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);
var mongoose = require('mongoose');
//var handleError = require(__dirname + '/../lib/handle_error');

var Joke = require(__dirname + '/../models/joke');

var url = 'localhost:3333/';

describe("the joke resource", function() {
  after(function(done) {
    mongoose.connection.db.dropDatabase(function(err) {
      if(err) {
        throw err;
      }
      done();
    });
  });

  it("should be able to create a joke", function(done) {
    chai.request(url)
      .post('tell-joke')
      .send({setup: "To", punchline: "To WHOM", author: "admin"})
      .end(function(err, resp) {
        expect(err).to.eql(null);
        expect(resp.status).to.eql(200);
        expect(resp.body.setup).to.eql("To");
        expect(resp.body.punchline).to.eql("To WHOM");
        expect(resp.body.author).to.eql("admin");
        done();
      });
  });

  describe("routes that need a joke in the database", function() {
    before(function(done) {
      var testJoke = new Joke({
        ID: 1,
        setup: "To",
        punchline: "To WHOM",
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
    it("should be able to start a joke", function(done) {
      chai.request(url)
        .get('joke')
        .end(function(err, resp) {
          expect(err).to.eql(null);
         expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("Joke #1\nKnock knock.\n");
          expect(resp.body.meta).to.eql(1);
          done();
        });
    });

    it("should be able to respond to set up the joke", function(done) {
      chai.request(url)
        .post('joke/who')
        .send({msg: "Who's there?"})
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("Who's there?\nTo.\n");
          expect(resp.body.meta).to.eql(1);
          done();
        });
    });

    it("should be able to tell the punchline", function(done) {
      chai.request(url)
        .post('joke/punchline')
        .send({msg: "To who?"})
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.status).to.eql(200);
          expect(resp.body.msg).to.eql("To who?\nTo WHOM.");
          expect(resp.body.meta).to.eql(1);
          done();
        })
    });
  });
});