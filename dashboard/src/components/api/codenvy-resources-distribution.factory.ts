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

import {CodenvyResourceLimits} from './codenvy-resource-limits';

interface ICodenvyResourcesResource<T> extends ng.resource.IResourceClass<T> {
  distribute: any;
  getResources: any;
  getTotalResources: any;
  getUsedResources: any;
  getAvailableResources: any;
  updateFreeResources: any;
}

const RAM_RESOURCE_TYPE: string = 'RAM';

/**
 * This class is handling the organization's resources management API.
 *
 * @author Ann Shumilova
 */
export class CodenvyResourcesDistribution {
  /**
   * Angular promise service.
   */
  private $q: ng.IQService;
  /**
   * Lodash library.
   */
  private lodash: any;
  /**
   * Angular Resource service.
   */
  private $resource: ng.resource.IResourceService;
  /**
   * Client to make remote distribution resources API calls.
   */
  private remoteResourcesAPI: ICodenvyResourcesResource<any>;
  /**
   * Organization distributed resources with organization's id as a key.
   */
  private organizationResources: Map<string, any>;
  /**
   * Organization total resources with organization's id as a key.
   */
  private organizationTotalResources: Map<string, any>;
  /**
   * Organization used resources with organization's id as a key.
   */
  private organizationUsedResources: Map<string, any>;
  /**
   * Organization available resources with organization's id as a key.
   */
  private organizationAvailableResources: Map<string, any>;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($q: ng.IQService, $resource: ng.resource.IResourceService, lodash: any) {
    this.$q = $q;
    this.$resource = $resource;
    this.lodash = lodash;

    this.organizationResources = new Map();
    this.organizationTotalResources = new Map();
    this.organizationUsedResources = new Map();
    this.organizationAvailableResources = new Map();

    this.remoteResourcesAPI = <ICodenvyResourcesResource<any>>this.$resource('/api/organization/resource', {}, {
      distribute: {method: 'POST', url: '/api/organization/resource/:organizationId/cap'},
      getResources: {method: 'GET', url: '/api/organization/resource/:organizationId/cap', isArray: true},
      getTotalResources: {method: 'GET', url: '/api/resource/:organizationId', isArray: true},
      getUsedResources: {method: 'GET', url: '/api/resource/:organizationId/used', isArray: true},
      getAvailableResources: {method: 'GET', url: '/api/resource/:organizationId/available', isArray: true},
      updateFreeResources: {method: 'POST', url: '/api/resource/free'}
    });
  }

  /**
   * Distributes resources for pointed organization.
   *
   * @param organizationId id of organization to distribute resources
   * @param resources resources to distribute
   * @returns {ng.IPromise<T>}
   */
  distributeResources(organizationId: string, resources: Array<any>): ng.IPromise<any> {
     return this.remoteResourcesAPI.distribute({'organizationId': organizationId}, resources).$promise;
  }

  /**
   * Update total resources for pointed root organization.
   * This method updates the provided free resources for the organization.
   *
   * @param organizationId id of organization to update resources
   * @param resources resources to update
   * @returns {ng.IPromise<T>}
   */
  updateTotalResources(organizationId: string, resources: Array<any>): ng.IPromise<any> {
    return this.remoteResourcesAPI.updateFreeResources({'accountId': organizationId, 'resources': resources}).$promise;
  }

  /**
   * Fetch distributed resources by organization's id.
   *
   * @param organizationId organization id
   * @returns {ng.IPromise<any>}
   */
  fetchOrganizationResources(organizationId: string): ng.IPromise<any> {
    let promise = this.remoteResourcesAPI.getResources({'organizationId': organizationId}).$promise;
    let resultPromise = promise.then((resources: any) => {
      this.organizationResources.set(organizationId, resources);
      return resources;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationResources.get(organizationId);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns the list of organization's resources by organization's id
   *
   * @param organizationId organization id
   * @returns {*} list of organization resources
   */
  getOrganizationResources(organizationId: string): any {
    return this.organizationResources.get(organizationId);
  }

  /**
   * Fetch total resources by organization's id.
   *
   * @param organizationId organization's id
   * @returns {ng.IPromise<any>}
   */
  fetchTotalOrganizationResources(organizationId: string): ng.IPromise<any> {
    let promise = this.remoteResourcesAPI.getTotalResources({'organizationId': organizationId}).$promise;
    let resultPromise = promise.then((resources: Array<any>) => {
      this.organizationTotalResources.set(organizationId, resources);
      return resources;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationTotalResources.get(organizationId);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns the list of organization's total resources by organization's id
   *
   * @param organizationId organization's id
   * @returns {*} list of organization used resources
   */
  getTotalOrganizationResources(organizationId: string): any {
    return this.organizationTotalResources.get(organizationId);
  }

  /**
   * Fetch used resources by organization's id.
   *
   * @param organizationId organization id
   * @returns {ng.IPromise<any>}
   */
  fetchUsedOrganizationResources(organizationId: string): ng.IPromise<any> {
    let promise = this.remoteResourcesAPI.getUsedResources({'organizationId': organizationId}).$promise;
    let resultPromise = promise.then((resources: Array<any>) => {
      this.organizationUsedResources.set(organizationId, resources);
      return resources;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationUsedResources.get(organizationId);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns the list of organization's used resources by organization's id
   *
   * @param organizationId organization id
   * @returns {*} list of organization used resources
   */
  getUsedOrganizationResources(organizationId: string): any {
    return this.organizationUsedResources.get(organizationId);
  }

  /**
   * Fetch available resources by organization's id.
   *
   * @param organizationId organization id
   * @returns {ng.IPromise<any>}
   */
  fetchAvailableOrganizationResources(organizationId: string): ng.IPromise<any> {
    let promise = this.remoteResourcesAPI.getAvailableResources({'organizationId': organizationId}).$promise;
    let resultPromise = promise.then((resources: Array<any>) => {
      this.organizationAvailableResources.set(organizationId, resources);
      return resources;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationAvailableResources.get(organizationId);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns the list of organization's available resources by organization's id
   *
   * @param organizationId organization id
   * @returns {*} list of organization used resources
   */
  getAvailableOrganizationResources(organizationId: string): any {
    return this.organizationAvailableResources.get(organizationId);
  }

  /**
   * Returns organization's total resource limits by resource type.
   *
   * @param organizationId id of organization
   * @param type type of resource
   * @returns {any} resource limit
   */
  getOrganizationTotalResourceByType(organizationId: string, type: CodenvyResourceLimits): any {
    let resources = this.organizationTotalResources.get(organizationId);
    if (!resources) {
      return null;
    }

    return this.lodash.find(resources, (resource: any) => {
      return resource.type === type.valueOf();
    });
  }

  /**
   * Returns organization's available resource limits by resource type.
   *
   * @param organizationId id of organization
   * @param type type of resource
   * @returns {any} resource limit
   */
  getOrganizationAvailableResourceByType(organizationId: string, type: CodenvyResourceLimits): any {
    let resources = this.organizationAvailableResources.get(organizationId);
    if (!resources) {
      return null;
    }

    return this.lodash.find(resources, (resource: any) => {
      return resource.type === type.valueOf();
    });
  }

  /**
   * Returns organization's resource limits by resource type.
   *
   * @param organizationId id of organization
   * @param type type of resource
   * @returns {any} resource limit
   */
  getOrganizationResourceByType(organizationId: string, type: CodenvyResourceLimits): any {
    let resources = this.organizationResources.get(organizationId);
    if (!resources) {
      return null;
    }

    return this.lodash.find(resources, (resource: any) => {
      return resource.type === type.valueOf();
    });
  }

  /**
   * Returns the modified organization's resources with pointed type and value.
   *
   * @param resources resources
   * @param type type of resource
   * @param value value to be set
   * @returns {any} modified
   */
  setOrganizationResourceLimitByType(resources: any, type: CodenvyResourceLimits, value: string): any {
    resources = resources || [];


    let resource = this.lodash.find(resources, (resource: any) => {
      return resource.type === type.valueOf();
    });

    if (!resource) {
      resource = {};
      resource.type = type.valueOf();
      resources.push(resource);
    }

    resource.amount = value;
    return resources;
  }
}
