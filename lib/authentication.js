var events = require("events");
var util = require("util");
var bc = require("bcrypt-nodejs");
var assert = require("assert");
var Log = require("../models/log");

var AuthResult = function(args){
  var result = {
    creds : args,
    success : false,
    message : "Invalid email or password",
    user : null,
    log : null,
    session : null
  };
  return result;
};

var Authentication = function(db) {
  var self = this;
  var continueWith =null;
  events.EventEmitter.call(self);

  //validate creds
  var validateCredentials = function(authResult){
    if(authResult.creds.email && authResult.creds.password){
      self.emit("creds-ok", authResult);
    }else{
      self.emit("invalid", authResult);
    }
  };

  //find the user
  var findUser = function(authResult){
    db.users.first({email : authResult.creds.email}, function(err,found){
      assert.ok(err === null, err);
      if(found){
        authResult.user = found;
        self.emit("user-found", authResult);
      }else{
        self.emit("invalid", authResult);
      }
    });
  };

  //compare passwords
  var comparePassword = function(authResult){
    var matched = bc.compareSync(authResult.creds.password, authResult.user.hashedPassword);
    if(matched){
      self.emit("password-matched", authResult);
    }else{
      self.emit("invalid", authResult);
    }
  };

  //update user stats
  var updateStats = function(authResult){
    var user = authResult.user;
    user.signInCount+=1;
    user.lastLoginAt = user.currentLoginAt;
    user.currentLoginAt = new Date();

    var updates = {
      signInCount : user.signInCount,
      lastLoginAt : user.lastLoginAt,
      currentLoginAt : user.currentLoginAt
    };

    db.users.updateOnly(updates,authResult.user.id,function(err,updated){
      assert.ok(err === null, err);
      self.emit("stats-updated", authResult);
    });
  };

  //create a log entry
  var createLog = function(authResult){
    var newLog = new Log({
      subject : "Authentication",
      entry : "Successfully logged in",
      userId : authResult.user.id
    });
    db.logs.save(newLog, function(err,log){
      assert.ok(err === null, err);
      authResult.log = log;
      self.emit("log-created", authResult);
    });
  };

  var authOk = function(authResult){
    authResult.success=true;
    authResult.message = "Successfully logged in";
    if(continueWith){
      continueWith(null,authResult);
    }
  };

  var authNotOk = function(authResult){
    authResult.success=false;
    if(continueWith){
      continueWith(null,authResult);
    }
  };

  //happy path
  self.on("login-received",validateCredentials);
  self.on("creds-ok",findUser);
  self.on("user-found",comparePassword);
  self.on("password-matched",createLog);
  self.on("log-created",updateStats);
  self.on("stats-updated", authOk);

  self.on("invalid", authNotOk);


  self.authenticate = function(creds,next){
    continueWith = next;
    var authResult = new AuthResult(creds);
    self.emit("login-received",authResult);
  };

};
util.inherits(Authentication, events.EventEmitter);
module.exports = Authentication;