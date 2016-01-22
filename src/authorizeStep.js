import {inject} from 'aurelia-framework';
import {Authentication} from './authentication';
import {Router, Redirect} from 'aurelia-router';

@inject(Authentication)
export class AuthorizeStep {
  constructor(auth) {
    this.auth = auth;
  }
  run(routingContext, next) {
    var isLoggedIn = this.auth.isAuthenticated();
    var loginRoute = this.auth.getLoginRoute();
    var deniedRoute = this.auth.getDeniedRoute();

    var canAccess = routingContext.getAllInstructions().some(i => {
      var auth = i.config.auth;

      if (auth == undefined) {
        return true;
      }

      if (auth.constructor == Array) {
        if (!this.auth.isAuthenticated() || !this.auth.canAccess(auth, i.config.requiresAllRoles)) {
          console.log("Cannot access! Doesn't have the required roles : " + auth);
          return false;
        }
      } else {
        if (auth) {
          return this.auth.isAuthenticated();
        } else {
          return !this.auth.isAuthenticated();
        }
      }
      return true;
    });

    if (!canAccess) {
      if (isLoggedIn) {
        return next.cancel(new Redirect(deniedRoute));
      } else {
        return next.cancel(new Redirect(loginRoute));
      }
    }

    if (isLoggedIn && routingContext.getAllInstructions().some(i => i.fragment) == loginRoute) {
      var loginRedirect = this.auth.getLoginRedirect();
      return next.cancel(new Redirect(loginRedirect));
    }

    return next();
  }
}
