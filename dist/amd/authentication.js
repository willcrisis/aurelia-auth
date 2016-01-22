define(['exports', 'aurelia-framework', './baseConfig', './storage', './authUtils'], function (exports, _aureliaFramework, _baseConfig, _storage, _authUtils) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _authUtils2 = _interopRequireDefault(_authUtils);

  var Authentication = (function () {
    function Authentication(storage, config) {
      _classCallCheck(this, _Authentication);

      this.storage = storage;
      this.config = config.current;
      this.tokenName = this.config.tokenPrefix ? this.config.tokenPrefix + '_' + this.config.tokenName : this.config.tokenName;
    }

    _createClass(Authentication, [{
      key: 'getLoginRoute',
      value: function getLoginRoute() {
        return this.config.loginRoute;
      }
    }, {
      key: 'getDeniedRoute',
      value: function getDeniedRoute() {
        return this.config.deniedRoute;
      }
    }, {
      key: 'getLoginRedirect',
      value: function getLoginRedirect() {
        return this.config.loginRedirect;
      }
    }, {
      key: 'getLoginUrl',
      value: function getLoginUrl() {
        return this.config.baseUrl ? _authUtils2['default'].joinUrl(this.config.baseUrl, this.config.loginUrl) : this.config.loginUrl;
      }
    }, {
      key: 'getSignupUrl',
      value: function getSignupUrl() {
        return this.config.baseUrl ? _authUtils2['default'].joinUrl(this.config.baseUrl, this.config.signupUrl) : this.config.signupUrl;
      }
    }, {
      key: 'getProfileUrl',
      value: function getProfileUrl() {
        return this.config.baseUrl ? _authUtils2['default'].joinUrl(this.config.baseUrl, this.config.profileUrl) : this.config.profileUrl;
      }
    }, {
      key: 'getToken',
      value: function getToken() {
        return this.storage.get(this.tokenName);
      }
    }, {
      key: 'getPayload',
      value: function getPayload() {
        var token = this.storage.get(this.tokenName);

        if (token && token.split('.').length === 3) {
          var base64Url = token.split('.')[1];
          var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        }
      }
    }, {
      key: 'setToken',
      value: function setToken(response, redirect) {

        var tokenName = this.tokenName;
        var accessToken = response && response[this.config.responseTokenProp];
        var token;

        if (accessToken) {
          if (_authUtils2['default'].isObject(accessToken) && _authUtils2['default'].isObject(accessToken.data)) {
            response = accessToken;
          } else if (_authUtils2['default'].isString(accessToken)) {
            token = accessToken;
          }
        }

        if (!token && response) {
          token = this.config.tokenRoot && response[this.config.tokenRoot] ? response[this.config.tokenRoot][this.config.tokenName] : response[this.config.tokenName];
        }

        if (!token) {
          var tokenPath = this.config.tokenRoot ? this.config.tokenRoot + '.' + this.config.tokenName : this.config.tokenName;

          throw new Error('Expecting a token named "' + tokenPath + '" but instead got: ' + JSON.stringify(response));
        }

        this.storage.set(tokenName, token);

        var roles = response && response[this.config.responseRolesProp];
        if (roles) {
          this.storage.set('roles', roles.toString());
        }

        if (this.config.loginRedirect && !redirect) {
          window.location.href = this.config.loginRedirect;
        } else if (redirect && _authUtils2['default'].isString(redirect)) {
          window.location.href = window.encodeURI(redirect);
        }
      }
    }, {
      key: 'removeToken',
      value: function removeToken() {
        this.storage.remove(this.tokenName);
      }
    }, {
      key: 'isAuthenticated',
      value: function isAuthenticated() {
        var token = this.storage.get(this.tokenName);

        if (!token) {
          return false;
        }

        if (token.split('.').length !== 3) {
          return true;
        }

        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var exp = JSON.parse(window.atob(base64)).exp;

        if (exp) {
          return Math.round(new Date().getTime() / 1000) <= exp;
        }

        return true;
      }
    }, {
      key: 'getRoles',
      value: function getRoles() {
        var roles = this.storage.get('roles');
        if (roles) {
          return roles.split(',');
        }
        return [];
      }
    }, {
      key: 'containsRole',
      value: function containsRole(role) {
        return this.getRoles().indexOf(role) > -1;
      }
    }, {
      key: 'containsAllRoles',
      value: function containsAllRoles(roles) {
        for (var i = 0; i < roles.length; i++) {
          if (!this.containsRole(roles[i])) {
            return false;
          }
        }
        return true;
      }
    }, {
      key: 'canAccess',
      value: function canAccess(roles, requireAll) {
        if (requireAll) {
          return this.containsAllRoles(roles);
        } else {
          for (var i = 0; i < roles.length; i++) {
            if (this.containsRole(roles[i])) {
              console.log('User have privileges.');
              return true;
            }
          }
          console.log('User does not have privileges.');
          return false;
        }
      }
    }, {
      key: 'logout',
      value: function logout(redirect) {
        var _this = this;

        return new Promise(function (resolve) {
          _this.storage.remove(_this.tokenName);
          _this.storage.remove(_this.config.responseRolesProp);

          if (_this.config.logoutRedirect && !redirect) {
            window.location.href = _this.config.logoutRedirect;
          } else if (_authUtils2['default'].isString(redirect)) {
            window.location.href = redirect;
          }

          resolve();
        });
      }
    }]);

    var _Authentication = Authentication;
    Authentication = (0, _aureliaFramework.inject)(_storage.Storage, _baseConfig.BaseConfig)(Authentication) || Authentication;
    return Authentication;
  })();

  exports.Authentication = Authentication;
});