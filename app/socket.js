var url = require("url");
var users = require("./users");
var jwt = require("jsonwebtoken");

function configureClient(client) {
  client.on("mark", function (data) {
    console.log(data, client.user);
  });
}

module.exports = function (io) {
  io.on("connect", function (client) {
    var request = client.client.request;
    var token = url.parse(request.url, true).query.token;
    if (!token) { return; }
    jwt.verify(token, "secret", function (err, decoded) {
      if (err) { return; }

      client.user = decoded;
      configureClient(client);
    })
  })
};
