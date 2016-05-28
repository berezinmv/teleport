define([
  "services/auth-service",
  "socketio"
], function (auth, socketio) {
  var io = null;
  var onuserchange = auth.onUserChange(function (user) {
    if (user) {
      io = socketio("/?token=" + user.token);
    } else {
      io = null;
    }
  }, this);

  return {
    onChange: function() {

    },
    setPlace: function() {

    }
  };
});
