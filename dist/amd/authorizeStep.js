define(['exports', 'aurelia-framework', './authentication', 'aurelia-router'], function (exports, _aureliaFramework, _authentication, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AuthorizeStep = (function () {
    function AuthorizeStep(auth) {
      _classCallCheck(this, _AuthorizeStep);

      this.auth = auth;
    }

    _createClass(AuthorizeStep, [{
      key: 'run',
      value: function run(routingContext, next) {
        var _this = this;

        var isLoggedIn = this.auth.isAuthenticated();
        var loginRoute = this.auth.getLoginRoute();
        var deniedRoute = this.auth.getDeniedRoute();

        var canAccess = routingContext.getAllInstructions().some(function (i) {
          var auth = i.config.auth;

          if (auth == undefined) {
            return true;
          }

          if (auth.constructor == Array) {
            return _this.auth.canAccess(auth, i.config.requiresAllRoles);
          } else {
            return auth === _this.auth.isAuthenticated();
          }
        });

        if (!canAccess) {
          if (isLoggedIn) {
            return next.cancel(new _aureliaRouter.Redirect(deniedRoute));
          } else {
            return next.cancel(new _aureliaRouter.Redirect(loginRoute));
          }
        }

        if (isLoggedIn && routingContext.getAllInstructions().some(function (i) {
          return i.fragment;
        }) == loginRoute) {
          var loginRedirect = this.auth.getLoginRedirect();
          return next.cancel(new _aureliaRouter.Redirect(loginRedirect));
        }

        return next();
      }
    }]);

    var _AuthorizeStep = AuthorizeStep;
    AuthorizeStep = (0, _aureliaFramework.inject)(_authentication.Authentication)(AuthorizeStep) || AuthorizeStep;
    return AuthorizeStep;
  })();

  exports.AuthorizeStep = AuthorizeStep;
});