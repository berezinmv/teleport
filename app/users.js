var DB = require("nedb");
var users = new DB({filename: "data/users.db", autoload: true});

module.exports = users;