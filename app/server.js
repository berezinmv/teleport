var http = require("http");
var express = require("express");
var socketio = require("socket.io");

var app = express();
var server = http.createServer(app);

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static("public", {index: "index.html"}));

app.use(require("./auth"));

var io = socketio(server);
require("./socket")(io);

module.exports = server;
