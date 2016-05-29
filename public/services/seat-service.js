define([
  "services/auth-service",
  "socketio"
], function (auth, socketio) {
  var _seats = [];
  var _io = null;
  var _subscribers = [];

  function updateSubscriber(subscriber) {
    subscriber.callback.call(subscriber.context, _seats);
  }

  function updateSubscribers() {
    _subscribers.forEach(updateSubscriber)
  }

  function updateSeats(seats) {
    _seats = seats;
    updateSubscribers();
  }

  function reserveSeat(seat) {
    _seats.push(seat);
    updateSubscribers();
  }

  function freeSeat(seat) {
    _seats = _seats.filter(function (s) {
      return !(s.row === seat.row && s.col === seat.col);
    });
    updateSubscribers();
  }

  function configureIo(io) {
    io.on("update seats", function (seats) {
      updateSeats(seats);
    });
    io.on("reserve seat", reserveSeat);
    io.on("free seat", freeSeat);
  }

  auth.onUserChange(function (user) {
    if (user) {
      _io = socketio("/?token=" + user.token);
      configureIo(_io);
    } else {
      _io = null;
      _seats = [];
    }
  }, this);

  return {
    onChange: function (callback, context) {
      var subscriber = {
        callback: callback,
        context: context
      };
      _subscribers.push(subscriber);
      updateSubscriber(subscriber);
      return {
        unsubscribe: function () {
          _subscribers = _subscribers.filter(function (sub) {
            return sub !== subscriber;
          });
        }
      };
    },
    reserve: function (row, col) {
      _io.emit("reserve", {row: row, col: col});
    },
    book: function () {
      _io.emit("book");
    },
    logout: function () {
      _io.emit("logout");
      _seats = [];
    }
  };
});
