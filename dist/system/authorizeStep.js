System.register(['aurelia-dependency-injection', './authentication', 'aurelia-router'], function (_export) {
  'use strict';

  var inject, Authentication, Router, Redirect, AuthorizeStep;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_authentication) {
      Authentication = _authentication.Authentication;
    }, function (_aureliaRouter) {
      Router = _aureliaRouter.Router;
      Redirect = _aureliaRouter.Redirect;
    }],
    execute: function () {
      AuthorizeStep = (function () {
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
                return _this.auth.isAuthenticated() && _this.auth.canAccess(auth, i.config.requiresAllRoles);
              } else {
                return auth === _this.auth.isAuthenticated();
              }
            });

            if (!canAccess) {
              if (isLoggedIn) {
                return next.cancel(new Redirect(deniedRoute));
              } else {
                return next.cancel(new Redirect(loginRoute));
              }
            }

            if (isLoggedIn && routingContext.getAllInstructions().some(function (i) {
              return i.fragment;
            }) == loginRoute) {
              var loginRedirect = this.auth.getLoginRedirect();
              return next.cancel(new Redirect(loginRedirect));
            }

            return next();
          }
        }]);

        var _AuthorizeStep = AuthorizeStep;
        AuthorizeStep = inject(Authentication)(AuthorizeStep) || AuthorizeStep;
        return AuthorizeStep;
      })();

      _export('AuthorizeStep', AuthorizeStep);
    }
  };
});