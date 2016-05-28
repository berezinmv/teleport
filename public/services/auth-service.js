define([
  "qwest"
], function(qwest) {
  var LOCAL_STORAGE_TOKEN_KEY = "app_auth_token";

  var _token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  var _user = null;
  var _subscribers = [];

  function setToken(token) {
    _token = token;
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    if (token) {
      loadUser();
    } else {
      setUser(null);
    }
  }

  function setUser(user) {
    _user = user;
    updateSubscribers();
  }

  function updateSubscriber(sub) {
    sub.callback.call(sub.context, _user);
  }

  function updateSubscribers() {
    _subscribers.forEach(updateSubscriber);
  }

  function loadUser() {
    qwest.get("/user", {token: _token}).then(function (response) {
      var res = JSON.parse(response.responseText);
      if (res.success) {
        var user = res.user;
        setUser(user);
      }
    });
  }

  function getNewToken(username, password, path) {
    qwest.post(path, {username: username, password: password})
      .then(function (response) {
        var res = JSON.parse(response.responseText);
        if (res.success) {
          setToken(res.token);
        }
      });
  }

  loadUser();

  return {
    onUserChange: function(callback, context) {
      var subscriber = {
        callback: callback,
        context: context
      };
      _subscribers.push(subscriber);
      updateSubscriber(subscriber);
      return {
        unsubscribe: function() {
          _subscribers = _subscribers.filter(function (sub) {
            return sub !== subscriber;
          });
        }
      };
    },
    login: function(username, password) {
      getNewToken(username, password, "/authenticate")
    },
    register: function(username, password) {
      getNewToken(username, password, "/register")
    },
    logout: function () {
      setToken(null);
    }
  }
});
