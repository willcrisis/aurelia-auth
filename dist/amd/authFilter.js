define(['exports', 'aurelia-framework', './authentication'], function (exports, _aureliaFramework, _authentication) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AuthFilterValueConverter = (function () {
    function AuthFilterValueConverter(auth) {
      _classCallCheck(this, _AuthFilterValueConverter);

      this.auth = auth;
    }

    _createClass(AuthFilterValueConverter, [{
      key: 'toView',
      value: function toView(routes, isAuthenticated) {
        var _this = this;

        return routes.filter(function (r) {
          var auth = r.config.auth;
          if (auth === undefined) {
            return true;
          }
          if (auth.constructor == Array) {
            return _this.auth.canAccess(auth, r.config.requiresAllRoles);
          } else {
            return auth === isAuthenticated;
          }
        });
      }
    }]);

    var _AuthFilterValueConverter = AuthFilterValueConverter;
    AuthFilterValueConverter = (0, _aureliaFramework.inject)(_authentication.Authentication)(AuthFilterValueConverter) || AuthFilterValueConverter;
    return AuthFilterValueConverter;
  })();

  exports.AuthFilterValueConverter = AuthFilterValueConverter;
});