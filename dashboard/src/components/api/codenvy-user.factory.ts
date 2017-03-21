/*
 *  [2015] - [2017] Codenvy, S.A.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Codenvy S.A. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Codenvy S.A.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Codenvy S.A..
 */
'use strict';
import {CodenvyLicense} from './codenvy-license.factory';
import {CodenvyPermissions} from './codenvy-permissions.factory';

interface IRemoteUserAPI<T> extends ng.resource.IResourceClass<T> {
  findByID(data: {userId: string}): ng.resource.IResource<T>;
  findByAlias(data: {alias: string}): ng.resource.IResource<T>;
  findByName(data: {name: string}): ng.resource.IResource<T>;
  getUsers(data: {maxItems: number, skipCount: number}): ng.resource.IResource<T>;
  createUser(data: {password: string; name: string}): ng.resource.IResource<T>;
  setPassword(data: string): ng.resource.IResource<T>;
  removeUserById(data: {userId: string}): ng.resource.IResource<T>;
}

export interface IPageFromResponse {
  users: any;
  links?: Map<string, string>;
}

export interface IPageData {
  users: Array<any>;
  links: Map<string, string>;
}

export interface IPagesInfo {
  count?: number;
  currentPageNumber?: number;
  countOfPages?: number;
}


/**
 * This class is handling the user API retrieval
 * @author Oleksii Orel
 */
export class CodenvyUser {

  private $q: ng.IQService;
  private $resource: ng.resource.IResourceService;
  private $cookies: ng.cookies.ICookiesService;
  private codenvyLicense: CodenvyLicense;
  private codenvyPermissions: CodenvyPermissions;
  private useridMap: Map<string, any>;
  private userAliasMap: Map<string, any>;
  private userNameMap: Map<string, any>;
  private usersMap: Map<string, any>;
  private userPagesMap: Map<number, any>;
  private pageInfo: { count?: number; currentPageNumber?: number; countOfPages?: number };
  private logoutAPI: ng.resource.IResourceClass<any>;
  private remoteUserAPI: IRemoteUserAPI<any>;
  private user: any;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($q: ng.IQService, $resource: ng.resource.IResourceService, $cookies: ng.cookies.ICookiesService, codenvyLicense: CodenvyLicense, codenvyPermissions: CodenvyPermissions) {
    this.$q = $q;
    this.$resource = $resource;
    this.$cookies = $cookies;
    this.codenvyLicense = codenvyLicense;
    this.codenvyPermissions = codenvyPermissions;

    // remote call
    this.remoteUserAPI = <IRemoteUserAPI<any>>this.$resource('/api/user', {}, {
      findByID: {method: 'GET', url: '/api/user/:userId'},
      findByAlias: {method: 'GET', url: '/api/user/find?email=:alias'},
      findByName: {method: 'GET', url: '/api/user/find?name=:name'},
      setPassword: {
        method: 'POST', url: '/api/user/password', isArray: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      },
      createUser: {method: 'POST', url: '/api/user'},
      getUsers: {
        method: 'GET',
        url: '/api/admin/user?maxItems=:maxItems&skipCount=:skipCount',
        isArray: false,
        responseType: 'json',
        transformResponse: (data: any, headersGetter: any) => {
          return this._getPageFromResponse(data, headersGetter('link'));
        }
      },
      removeUserById: {method: 'DELETE', url: '/api/user/:userId'}
    });

    this.logoutAPI = this.$resource('/api/auth/logout', {});

    // users by ID
    this.useridMap = new Map();

    // users by alias
    this.userAliasMap = new Map();

    // users by name
    this.userNameMap = new Map();

    // all users by ID
    this.usersMap = new Map();

    // page users by relative link
    this.userPagesMap = new Map();

    // pages info
    this.pageInfo = {};

    // current user has to be for sure fetched:
    this.fetchUser();
  }

  /**
   * Create new user
   * @param name {string} - new user name
   * @param email {string} - new user e-mail
   * @param password {string} - new user password
   * @returns {ng.IPromise<any>}
   */
  createUser(name: string, email: string, password: string): ng.IPromise<any> {
    let data: {
      password: string;
      name: string;
      email?: string;
    };

    data = {
      password: password,
      name: name
    };

    if (email) {
      data.email = email;
    }

    let promise = this.remoteUserAPI.createUser(data).$promise;

    // check if was OK or not
    promise.then((user: any) => {
      // update users map
      // add user
      this.usersMap.set(user.id, user);
      // fetch license legality
      this.codenvyLicense.fetchLicenseLegality();
    });

    return promise;
  }

  _getPageFromResponse(data: any, headersLink: string): IPageFromResponse {
    let links: Map<string, string> = new Map();
    if (!headersLink) {
      return {users: data};
    }
    let pattern = new RegExp('<([^>]+?)>.+?rel="([^"]+?)"', 'g');
    let result;
    // look for pattern
    while (result = pattern.exec(headersLink)) {
      // add link
      links.set(result[2], result[1]);
    }
    return {
      users: data,
      links: links
    };
  }

  _getPageParamByLink(pageLink: string): any {
    let lastPageParamMap = new Map();
    let pattern = new RegExp('([_\\w]+)=([\\w]+)', 'g');
    let result;
    while (result = pattern.exec(pageLink)) {
      lastPageParamMap.set(result[1], result[2]);
    }
    let skipCount = lastPageParamMap.get('skipCount');
    let maxItems = lastPageParamMap.get('maxItems');
    if (!maxItems || maxItems === 0) {
      return null;
    }
    return {
      maxItems: maxItems,
      skipCount: skipCount ? skipCount : 0
    };
  }

  _updateCurrentPage(): void {
    let pageData = this.userPagesMap.get(this.pageInfo.currentPageNumber);
    if (!pageData) {
      return;
    }
    this.usersMap.clear();
    if (!pageData.users) {
      return;
    }
    pageData.users.forEach((user: any) => {
      // add user
      this.usersMap.set(user.id, user);
    });
  }

  _updateCurrentPageUsers(users: Array<any>): void {
    this.usersMap.clear();
    if (!users) {
      return;
    }
    users.forEach((user: any) => {
      // add user
      this.usersMap.set(user.id, user);
    });
  }

  /**
   * Update user page links by relative direction ('first', 'prev', 'next', 'last')
   * @param data {IPageData}
   */
  _updatePagesData(data: IPageData): void {
    if (!data.links) {
      return;
    }
    let firstPageLink = data.links.get('first');
    if (firstPageLink) {
      let firstPageData: { users?: Array<any>; link?: string; } = {link: firstPageLink};
      if (this.pageInfo.currentPageNumber === 1) {
        firstPageData.users = data.users;
      }
      if (!this.userPagesMap.get(1) || firstPageData.users) {
        this.userPagesMap.set(1, firstPageData);
      }
    }
    let lastPageLink = data.links.get('last');
    if (lastPageLink) {
      let pageParam = this._getPageParamByLink(lastPageLink);
      this.pageInfo.countOfPages = pageParam.skipCount / pageParam.maxItems + 1;
      this.pageInfo.count = pageParam.skipCount;
      let lastPageData: { users?: Array<any>; link?: string; } = {link: lastPageLink};
      if (this.pageInfo.currentPageNumber === this.pageInfo.countOfPages) {
        lastPageData.users = data.users;
      }
      if (!this.userPagesMap.get(this.pageInfo.countOfPages) || lastPageData.users) {
        this.userPagesMap.set(this.pageInfo.countOfPages, lastPageData);
      }
    }
    let prevPageLink = data.links.get('prev');
    let prevPageNumber = this.pageInfo.currentPageNumber - 1;
    if (prevPageNumber > 0 && prevPageLink) {
      let prevPageData = {link: prevPageLink};
      if (!this.userPagesMap.get(prevPageNumber)) {
        this.userPagesMap.set(prevPageNumber, prevPageData);
      }
    }
    let nextPageLink = data.links.get('next');
    let nextPageNumber = this.pageInfo.currentPageNumber + 1;
    if (nextPageNumber) {
      let lastPageData = {link: nextPageLink};
      if (!this.userPagesMap.get(nextPageNumber)) {
        this.userPagesMap.set(nextPageNumber, lastPageData);
      }
    }
  }

  /**
   * Gets the pageInfo
   * @returns {IPagesInfo}
   */
  getPagesInfo(): IPagesInfo {
    return this.pageInfo;
  }

  /**
   * Ask for loading the users in asynchronous way
   * If there are no changes, it's not updated
   * @param maxItems {number} - the number of max items to return
   * @param skipCount {number} - the number of items to skip
   * @returns {ng.IPromise<any>} the promise
   */
  fetchUsers(maxItems: number, skipCount: number): ng.IPromise<any> {
    let promise = this.remoteUserAPI.getUsers({maxItems: maxItems, skipCount: skipCount}).$promise;

    promise.then((data: any) => {
      this.pageInfo.currentPageNumber = skipCount / maxItems + 1;
      this._updateCurrentPageUsers(data.users);
      this._updatePagesData(data);
    });

    return promise;
  }

  /**
   * Ask for loading the users page in asynchronous way
   * If there are no changes, it's not updated
   * @param pageKey {string} - the key of page ('first', 'prev', 'next', 'last'  or '1', '2', '3' ...)
   * @returns {ng.IPromise<any>} the promise
   */
  fetchUsersPage(pageKey: string): ng.IPromise<any> {
    let deferred = this.$q.defer();
    let pageNumber;
    if ('first' === pageKey) {
      pageNumber = 1;
    } else if ('prev' === pageKey) {
      pageNumber = this.pageInfo.currentPageNumber - 1;
    } else if ('next' === pageKey) {
      pageNumber = this.pageInfo.currentPageNumber + 1;
    } else if ('last' === pageKey) {
      pageNumber = this.pageInfo.countOfPages;
    } else {
      pageNumber = parseInt(pageKey, 10);
    }
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > this.pageInfo.countOfPages) {
      pageNumber = this.pageInfo.countOfPages;
    }
    let pageData = this.userPagesMap.get(pageNumber);
    if (pageData.link) {
      this.pageInfo.currentPageNumber = pageNumber;
      let promise = this.remoteUserAPI.getUsers(this._getPageParamByLink(pageData.link)).$promise;
      promise.then((data: any) => {
        this._updatePagesData(data);
        pageData.users = data.users;
        this._updateCurrentPage();
        deferred.resolve(data);
      }, (error: any) => {
        if (error && error.status === 304) {
          this._updateCurrentPage();
        }
        deferred.reject(error);
      });
    } else {
      deferred.reject({data: {message: 'Error. No necessary link.'}});
    }
    return deferred.promise;
  }

  /**
   * Gets the users
   * @returns {Map}
   */
  getUsersMap() {
    return this.usersMap;
  }

  /**
   * Performs user deleting by the given user ID.
   * @param userId {string} the user id
   * @returns {ng.IPromise<any>} the promise
   */
  deleteUserById(userId: string): ng.IPromise<any> {
    let promise = this.remoteUserAPI.removeUserById({userId: userId}).$promise;

    // check if was OK or not
    promise.then(() => {
      // update users map
      // remove user
      this.usersMap.delete(userId);
      // fetch license legality
      this.codenvyLicense.fetchLicenseLegality();
    });

    return promise;
  }

  /**
   * Performs current user deletion.
   * @returns {ng.IPromise<any>} the promise
   */
  deleteCurrentUser(): ng.IPromise<any> {
    let userId = this.user.id;
    let promise = this.remoteUserAPI.removeUserById({userId: userId}).$promise;
    return promise;
  }

  /**
   * Performs logout of current user.
   * @returns {ng.IPromise<any>}
   */
  logout(): ng.IPromise<any> {
    let data = {token: this.$cookies['session-access-key']};
    let promise = this.logoutAPI.save(data).$promise;
    return promise;
  }

  /**
   * Gets the user.
   * @return {any}
   */
  getUser(): any {
    return this.user;
  }

  /**
   * Fetch the user.
   * @returns {ng.IPromise<codenvy.IUser>}
   */
  fetchUser(): ng.IPromise<codenvy.IUser> {
    let promise = this.remoteUserAPI.get().$promise;
    // check if if was OK or not
    return promise.then((user: codenvy.IUser) => {
      this.user = user;
      return user;
    }, (error: any) => {
      if (error && error.status === 304) {
        return this.user;
      }
      this.$q.reject(error);
    });
  }

  /**
   * Fetch the user by Id.
   * @param userId {string} the user id
   *
   * @returns {ng.IPromise<any>}
   */
  fetchUserId(userId: string): ng.IPromise<any> {
    let promise = this.remoteUserAPI.findByID({userId: userId}).$promise;
    let parsedResultPromise = promise.then((user: any) => {
      this.useridMap.set(userId, user);
    });

    return parsedResultPromise;
  }

  /**
   * Gets the user by Id.
   * @returns {any}
   */
  getUserFromId(userId: string): any {
    return this.useridMap.get(userId);
  }

  /**
   * Fetch the user by Alias.
   * @param alias {string} the user alias
   *
   * @returns {ng.IPromise<any>}
   */
  fetchUserByAlias(alias: string) {
    let promise = this.remoteUserAPI.findByAlias({alias: alias}).$promise;
    let parsedResultPromise = promise.then((user: any) => {
      this.useridMap.set(user.id, user);
      this.userAliasMap.set(alias, user);
    });

    return parsedResultPromise;
  }

  /**
   * Gets the user by Alias.
   * @param alias {string} the user alias
   *
   * @returns {any}
   */
  getUserByAlias(alias: string) {
    return this.userAliasMap.get(alias);
  }

  /**
   * Fetch the user by Name.
   * @param name {string} the user name
   *
   * @returns {ng.IPromise<any>}
   */
  fetchUserByName(name: string): ng.IPromise<any> {
    let promise = this.remoteUserAPI.findByName({name: name}).$promise;
    let resultPromise = promise.then((user: any) => {
      this.userNameMap.set(name, user);
      return user;
    }, (error: any) => {
      if (error.status === 304) {
        return this.userNameMap.get(name);
      }
      return this.$q.reject(error);
    });

    return resultPromise;
  }

  /**
   * Gets the user by Name.
   * @param name {string} the user name
   *
   * @returns {any}
   */
  getUserByName(name: string): any {
    return this.userNameMap.get(name);
  }

  /**
   * Sets user's password.
   * @param password {string} the user password
   *
   * @returns {ng.IPromise<any>}
   */
  setPassword(password: string): ng.IPromise<any> {
    return this.remoteUserAPI.setPassword('password=' + password).$promise;
  }
}
