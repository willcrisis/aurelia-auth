import {inject} from 'aurelia-framework';
import {Authentication} from './authentication';

@inject(Authentication)
export class AuthFilterValueConverter {

  constructor(auth) {
    this.auth = auth;
  }

  toView(routes, isAuthenticated) {
    return routes.filter(r => {
      var auth = r.config.auth;
      if (auth === undefined) {
        return true;
      }
      if (auth.constructor == Array) {
        return this.auth.canAccess(auth, r.config.requiresAllRoles);
      } else {
        return auth === isAuthenticated
      }
    });
  }
}
