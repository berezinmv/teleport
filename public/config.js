require.config({
  "socket": "bower/socket.io-client/socket.io"
});

Polymer.require = function (dependencies, func) {
  require(deps, function () {
    Polymer(func.apply(this, dependencies));
  })
};
