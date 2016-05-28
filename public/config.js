require.config({
  paths: {
    "socketio": "bower/socket.io-client/socket.io",
    "qwest": "bower/qwest/qwest.min"
  }
});

Polymer.require = function (deps, callback) {
  require(deps, function () {
    Polymer(callback.apply(this, arguments));
  })
};
