import {inject} from 'aurelia-dependency-injection';
import {BaseConfig}  from './baseConfig';
import {Storage} from './storage';
import authUtils from './authUtils';

@inject(Storage, BaseConfig)
export class Authentication {
    constructor(storage, config) {
        this.storage = storage;
        this.config = config.current;
        this.tokenName = this.config.tokenPrefix ? this.config.tokenPrefix + '_' + this.config.tokenName : this.config.tokenName;
        this.idTokenName = this.config.tokenPrefix ? this.config.tokenPrefix + '_' + this.config.idTokenName : this.config.idTokenName;
    }

    getLoginRoute() {
        return this.config.loginRoute;
    }

    getLoginRedirect() {
        return this.initialUrl || this.config.loginRedirect;
    }

    getDeniedRoute() {
      return this.config.deniedRoute;
    }

    getLoginUrl() {
        return this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.config.loginUrl) : this.config.loginUrl;
    }

    getSignupUrl() {
        return this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.config.signupUrl) : this.config.signupUrl;
    }

    getProfileUrl() {
        return this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.config.profileUrl) : this.config.profileUrl;
    }

    getToken() {
        return this.storage.get(this.tokenName);
    }

    getPayload() {

        let token = this.storage.get(this.tokenName);

        if (token && token.split('.').length === 3) {
            let base64Url = token.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            try {
                return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
            } catch (error) {
                return null;
            }
        }
    }

    setInitialUrl(url) {
        this.initialUrl = url;
    }

    setToken(response, redirect) {


        //access token handling

            let accessToken = response && response[this.config.responseTokenProp];
            let tokenToStore;

            if (accessToken) {
                if (authUtils.isObject(accessToken) && authUtils.isObject(accessToken.data)) {
                    response = accessToken;
                } else if (authUtils.isString(accessToken)) {
                    tokenToStore = accessToken;
                }
            }

            if (!tokenToStore && response) {
                tokenToStore = this.config.tokenRoot && response[this.config.tokenRoot] ? response[this.config.tokenRoot][this.config.tokenName] : response[this.config.tokenName];
            }

            if (tokenToStore) {
                this.storage.set(this.tokenName, tokenToStore);
            }




        //id token handling

            let idToken = response && response[this.config.responseIdTokenProp];
            let idTokenToStore;

            if (idToken) {
                if (authUtils.isObject(idToken) && authUtils.isObject(idToken.data)) {
                    response = idToken;
                } else if (authUtils.isString(idToken)) {
                    idTokenToStore = idToken;
                }
            }

            if (!idTokenToStore && response) {
                idTokenToStore = this.config.tokenRoot && response[this.config.tokenRoot] ? response[this.config.tokenRoot][this.config.idTokenName] : response[this.config.IdTokenName];
            }

            if (idTokenToStore) {
              this.storage.set(this.idTokenName, idTokenToStore);
            }

            var roles = response && response[this.config.responseRolesProp];
            if (roles) {
              this.storage.set('roles', roles.toString());
            }

            if (this.config.loginRedirect && !redirect) {
                window.location.href = this.getLoginRedirect();
            } else if (redirect && authUtils.isString(redirect)) {
                window.location.href = window.encodeURI(redirect);
            }
    }

    removeToken() {
        this.storage.remove(this.tokenName);
        this.storage.remove('roles');
    }

    isAuthenticated() {

        let token = this.storage.get(this.tokenName);

        // There's no token, so user is not authenticated.
        if (!token) {
            this.removeToken();
            return false;
        }

        // There is a token, but in a different format. Return true.
        if (token.split('.').length !== 3) {
            return true;
        }

        let exp;
        try {
            let base64Url = token.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            exp = JSON.parse(window.atob(base64)).exp;
        } catch (error) {
            this.removeToken();
            return false;
        }

        if (exp) {
            let result = Math.round(new Date().getTime() / 1000) <= exp;
            if (!result) {
              this.removeToken();
            }
            return result;
        }

        return true;
    }

    getRoles() {
      var roles = this.storage.get('roles');
      if (roles) {
        return roles.split(',');
      }
      return [];
    }

    containsRole(role) {
      return this.getRoles().indexOf(role) > -1;
    }

    containsAllRoles(roles) {
      for (var i = 0; i < roles.length; i++) {
        if (!this.containsRole(roles[i])) {
          return false;
        }
      }
      return true;
    }

    canAccess(roles, requireAll) {
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

    logout(redirect) {
        return new Promise(resolve => {
            this.storage.remove(this.tokenName);
            this.storage.remove(this.config.responseRolesProp);

            if (this.config.logoutRedirect && !redirect) {
                window.location.href = this.config.logoutRedirect;
            } else if (authUtils.isString(redirect)) {
                window.location.href = redirect;
            }

            resolve();
        });
    }
}
