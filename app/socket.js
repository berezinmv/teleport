var url = require("url");
var seatCollection = require("./seats");
var jwt = require("jsonwebtoken");

function updateClient(client) {
  seatCollection.find({}, function (err, seats) {
    if (err) {
      return;
    }
    client.emit('update seats', seats);
  });
}

function checkSize(num) {
  return num > 0 && num < 6;
}

module.exports = function (io) {
  io.on("connect", function (client) {
    var request = client.client.request;
    var token = url.parse(request.url, true).query.token;
    if (!token) {
      return;
    }
    jwt.verify(token, "secret", function (err, user) {
      if (err) {
        return client.disconnect();
      }

      var userId = user._id;
      var userColor = user.color;

      client.on("reserve", function (data) {
        var row = data.row;
        var col = data.col;

        if (!checkSize(row) || !checkSize(col)) { return; }

        seatCollection.findOne({row: row, col: col}, function (err, seat) {
          if (err) {
            return;
          }
          if (seat) {
            if (seat.userId === userId) {
              seatCollection.remove({_id: seat._id}, {}, function () {
                io.emit("free seat", {row: row, col: col});
              });
            }
          } else {
            seatCollection.find({userId: userId}, function (err, seats) {
              if (err || seats && seats.length > 4) {
                return;
              }
              seatCollection.insert({
                row: row,
                col: col,
                userId: userId,
                color: userColor,
                status: "reserved"
              }, function (err, seat) {
                if (err) {
                  return;
                }
                io.emit("reserve seat", seat);
              });
            });
          }
        });
      });

      client.on("book", function () {
        seatCollection.update({userId: userId, status: "reserved"},
          {$set: {status: "booked"}}, {multi: true});
      });

      client.on("logout", function () {
        client.disconnect();
        seatCollection.remove({userId: userId, status: "reserved"}, {multi: true}, function (err, count) {
          if (count === 0) {
            return;
          }
          seatCollection.find({}, function (err, seats) {
            if (err) {
              return;
            }
            io.emit("update seats", seats);
          })
        });
      });

      client.on("disconnect", function () {
        seatCollection.remove({userId: userId, status: "reserved"}, {multi: true}, function (err, count) {
          if (count === 0) {
            return;
          }
          seatCollection.find({}, function (err, seats) {
            if (err) {
              return;
            }
            io.emit("update seats", seats);
          })
        });
      });

      updateClient(client);
    })
  })
};
