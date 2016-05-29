var users = require("./users");
var jwt = require("jsonwebtoken");
var randomColor = require("randomcolor");
var express = require("express");
var router = express.Router();

router.use(function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, "secret", function (err, decoded) {
      req.decoded = decoded;
      next();
    });
  } else {
    next();
  }
});

function validate(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Invalid username or password"
    });
  }

  next();
}

router.post("/register", validate, function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var newUser = {username: username, password: password};
  users.findOne(newUser, function (err, user) {
    if (err) {
      return res.json({
        success: false,
        message: "Error occurred",
        error: err
      });
    }
    if (user) {
      return res.json({
        success: false,
        message: "User already exist"
      });
    }
    newUser.color = randomColor();
    users.insert(newUser, function (err, user) {
      if (err) {
        return res.json({
          success: false,
          message: "Error occurred",
          error: err
        });
      }
      var token = jwt.sign(user, "secret", {expiresIn: "24h"});
      res.json({
        success: true,
        token: token
      });
    })
  });
});

router.post("/authenticate", validate, function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  users.findOne({username: username, password: password}, function (err, user) {
    if (err) {
      return res.json({
        success: false,
        message: "Error occurred",
        error: err
      });
    }
    if (!user) {
      return res.json({
        success: false,
        message: "Wrong combination of username and password"
      });
    }
    var token = jwt.sign(user, "secret", {expiresIn: "24h"});
    res.json({
      success: true,
      token: token
    });
  });
});

router.get("/user", function (req, res) {
  var decoded = req.decoded || {};
  users.findOne({_id: decoded._id}, function (err, user) {
    if (err) {
      return res.json({
        success: false,
        message: "Error occurred",
        error: err
      });
    }
    res.json({
      success: true,
      user: user
    });
  });
});

module.exports = router;
