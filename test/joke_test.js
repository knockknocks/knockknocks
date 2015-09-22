'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);
var mongoose = require('mongoose');
//var handleError = require(__dirname + '/../lib/handle_error');

var Joke = require(__dirname + '/../models/joke');

var kkPORT = (process.env.PORT || 3000);
var jokeURL = 'localhost:' + kkPORT + '/';

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
    chai.request(jokeURL)
      .post('joke')
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
    beforeEach(function(done) {
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

    it("should be able to tell a joke", function(done) {
      chai.request(jokeURL)
        .get('joke')
        .end(function(err, resp) {
          expect(err).to.eql(null);
          expect(resp.body.msg).to.eql(
            "Knock knock.\n"    //ideally: server sends this on GET
            + "Who's there?\n"  //user says this (or something)
            + "To.\n"           //setup: server sends in response to new GET with string
            + "To who?\n"       //user says this (or something)
            + "To WHOM.");      //punchline: server sends in response to new GET with string
          done();
        })
    })
  });
});