var Registration = require("../lib/registration");
var should = require("should");
var db = require("secondthought");
var Auth = require("../lib/authentication");
var assert = require("assert");

describe("Authentication", function () {
  var reg = {};
  var auth = {};
  var regUser = {};
  var authUser = {email : "test@test.com", password: "password", confirm : "password"};
  before(function(done) {
    db.connect({db : "membership"}, function(err,db){
      reg = new Registration(db);
      auth = new Auth(db);

      db.users.destroyAll(function(err,users){
        assert.ok(err === null, err);
        reg.applyForMembership(authUser, function(err,regResult){
          assert.ok(err === null, err);
          assert.ok(regResult.success,"Problem registering");
          regUser = regResult.user;
          done();
        });
      });
    });
  });
  describe("Valid login", function () {
    var authResult = {};
    before(function (done) {
      auth.authenticate(authUser,function(err,result){
        authResult = result;
        done();
      });
    });
    it("returns success", function(){
      authResult.success.should.equal(true);
    });
    it("returns a user", function(){
      authResult.user.should.be.defined;
    });
    it("logs the event", function(){
      authResult.log.should.be.defined;
    });
    it("updates the signin count", function(){
      authResult.user.signInCount.should.equal(2);
    });
    it("updates the signon dates", function(){
      authResult.user.lastLoginAt.should.be.defined;
      authResult.user.currentLoginAt.should.be.defined;
    });
  });

  describe("Empty email", function () {
    var authResult = {};
    before(function (done) {
      auth.authenticate({email : null, password : "thing"},function(err,result){
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns invalid login message", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("Empty password", function () {
    var authResult = {};
    before(function (done) {
      auth.authenticate({email : "test@test.com", password : null},function(err,result){
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns invalid login message", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("Email not found", function () {
    var authResult = {};
    before(function (done) {
      auth.authenticate({email : "dogboy@test.com", password : null},function(err,result){
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns invalid login message", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("Password doesn't match", function () {
    var authResult = {};
    before(function (done) {
      auth.authenticate({email : "test@test.com", password : "stuff"},function(err,result){
        authResult = result;
        done();
      });
    });
    it("is not successful", function(){
      authResult.success.should.equal(false);
    });
    it("returns invalid login message", function(){
      authResult.message.should.equal("Invalid email or password");
    });
  });

  describe("Valid login with token", function () {
    it("returns success");
    it("returns a user");
    it("logs the event");
    it("creates a session");
    it("updates the signin count");
    it("updates the signon dates");
  });

  describe("Login with invalid token", function () {
    it("is not successful");
    it("returns message saying login is invalid");
  });

});