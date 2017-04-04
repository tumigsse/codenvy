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

interface ICodenvyPermissionsResource<T> extends ng.resource.IResourceClass<T> {
  store: any;
  remove: any;
  getSystemPermissions: any;
  getPermissionsByInstance: any;
}

interface ISystemPermissions {
  actions: Array<string>;
}

/**
 * This class is handling the permissions API
 * @author Ann Shumilova
 * @author Oleksii Orel
 */
export class CodenvyPermissions {
  /**
   * Angular promise service.
   */
  private $q: ng.IQService;
  /**
   * Angular Resource service.
   */
  private $resource: ng.resource.IResourceService;
  /**
   * Services availability to user.
   */
  private userServices: any;
  /**
   * Workspace permissions with workspace's id as a key.
   */
  private workspacePermissions: Map<string, any>;
  /**
   * Team permissions with organization's id as a key.
   */
  private organizationPermissions: Map<string, any>;
  /**
   * Available system permissions.
   */
  private systemPermissions: ISystemPermissions;
  /**
   * Client to make remote permissions API calls.
   */
  private remotePermissionsAPI: ICodenvyPermissionsResource<any>;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($q: ng.IQService, $resource: ng.resource.IResourceService) {
    this.$q = $q;
    this.$resource = $resource;

    this.workspacePermissions = new Map();
    this.organizationPermissions = new Map();
    this.systemPermissions = null;

    this.userServices = {
      hasUserService: false,
      hasUserProfileService: false,
      hasAdminUserService: false,
      hasInstallationManagerService: false,
      hasLicenseService: false
    };

    this.remotePermissionsAPI = <ICodenvyPermissionsResource<any>>this.$resource('/api/permissions', {}, {
      store: {method: 'POST', url: '/api/permissions'},
      remove: {method: 'DELETE', url: '/api/permissions/:domain?instance=:instance&user=:user'},
      getSystemPermissions: {method: 'GET', url: '/api/permissions/system'},
      getPermissionsByInstance: {method: 'GET', url: '/api/permissions/:domain/all?instance=:instance', isArray: true}
    });
  }

  /**
   * Stores permissions data.
   *
   * @param data - permissions data
   * @returns {ng.IPromise<any>}
   */
  storePermissions(data: any): ng.IPromise<any> {
     return this.remotePermissionsAPI.store(data).$promise;
  }

  /**
   * Fetch organization permissions by organizations's id.
   *
   * @param organizationId organization id
   * @returns {ng.IPromise<any>}
   */
  fetchOrganizationPermissions(organizationId: string): ng.IPromise<any> {
    let promise = this.remotePermissionsAPI.getPermissionsByInstance({domain: 'organization', instance: organizationId}).$promise;
    let resultPromise = promise.then((permissions: any) => {
      this.organizationPermissions.set(organizationId, permissions);
      return permissions;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationPermissions.get(organizationId);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns the list of organization's permissions by organization's id
   *
   * @param organizationId organization id
   * @returns {*} list of organization permissions
   */
  getOrganizationPermissions(organizationId: string): any {
    return this.organizationPermissions.get(organizationId);
  }

  /**
   * Remove permissions for pointed user in pointed organization.
   *
   * @param organizationId organization id
   * @param userId user id
   * @returns {ng.IPromise<any>} request promise
   */
  removeOrganizationPermissions(organizationId: string, userId: string): ng.IPromise<any> {
    let promise = this.remotePermissionsAPI.remove({domain: 'organization', instance: organizationId, user: userId}).$promise;
    return promise;
  }

  /**
   * Fetch workspace permissions by workspace's id.
   *
   * @param workspaceId {string} workspace id
   * @returns {ng.IPromise<any>}
   */
  fetchWorkspacePermissions(workspaceId: string): ng.IPromise<any> {
    let promise: ng.IPromise<any> = this.remotePermissionsAPI.getPermissionsByInstance({
      domain: 'workspace',
      instance: workspaceId
    }).$promise;
    promise.then((permissions: any) => {
      this.workspacePermissions.set(workspaceId, permissions);
    });
    return promise;
  }

  /**
   * Returns permissions data by workspace id
   *
   * @param workspaceId workspace id
   * @returns {any} list of workspace permissions
   */
  getWorkspacePermissions(workspaceId: string): any {
    return this.workspacePermissions.get(workspaceId);
  }

  /**
   * Remove permissions for pointed user in pointed workspace.
   *
   * @param workspaceId {string} workspace id
   * @param userId {string} user id
   * @returns {ng.IPromise<any>} request promise
   */
  removeWorkspacePermissions(workspaceId: string, userId: string): ng.IPromise<any> {
    let promise = this.remotePermissionsAPI.remove({domain: 'workspace', instance: workspaceId, user: userId}).$promise;
    promise.then(() => {
      this.fetchWorkspacePermissions(workspaceId);
    });

    return promise;
  }

  /**
   * Fetch system permissions
   *
   * @returns {ng.IPromise<any>}
   */
  fetchSystemPermissions(): ng.IPromise<any> {
    let promise: ng.IPromise<any> = this.remotePermissionsAPI.getSystemPermissions().$promise;
    promise.then((systemPermissions: ISystemPermissions) => {
      this.updateUserServices(systemPermissions);
      this.systemPermissions = systemPermissions;
    });

    return promise;
  }

  getSystemPermissions(): ISystemPermissions {
    return this.systemPermissions;
  }

  getUserServices(): codenvy.IUserServices {
    return this.userServices;
  }

  private updateUserServices(systemPermissions: ISystemPermissions): void {
    let isManageUsers: boolean = systemPermissions && systemPermissions.actions.includes('manageUsers');
    let isManageSystem: boolean = systemPermissions && systemPermissions.actions.includes('manageSystem');

    this.userServices.hasUserService = isManageUsers;
    this.userServices.hasUserProfileService = isManageUsers;
    this.userServices.hasAdminUserService = isManageUsers;
    this.userServices.hasInstallationManagerService = isManageSystem;
    this.userServices.hasLicenseService = isManageSystem;
  }
}
