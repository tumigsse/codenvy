/*
 *  [2012] - [2017] Codenvy, S.A.
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
package com.codenvy.organization.api;

import com.codenvy.api.permission.server.SuperPrivilegesChecker;
import com.codenvy.api.permission.server.account.AccountPermissionsChecker;
import com.codenvy.api.permission.shared.model.PermissionsDomain;
import com.codenvy.organization.api.listener.MemberEventsPublisher;
import com.codenvy.organization.api.listener.OrganizationEventsWebsocketBroadcaster;
import com.codenvy.organization.api.listener.OrganizationNotificationEmailSender;
import com.codenvy.organization.api.listener.RemoveOrganizationOnLastUserRemovedEventSubscriber;
import com.codenvy.organization.api.permissions.OrganizationDomain;
import com.codenvy.organization.api.permissions.OrganizationPermissionsFilter;
import com.codenvy.organization.api.permissions.OrganizationResourceDistributionServicePermissionsFilter;
import com.codenvy.organization.api.permissions.OrganizationalAccountPermissionsChecker;
import com.codenvy.organization.api.resource.DefaultOrganizationResourcesProvider;
import com.codenvy.organization.api.resource.OrganizationResourceLockKeyProvider;
import com.codenvy.organization.api.resource.OrganizationResourcesDistributionService;
import com.codenvy.organization.api.resource.OrganizationalAccountAvailableResourcesProvider;
import com.codenvy.organization.api.resource.SuborganizationResourcesProvider;
import com.codenvy.organization.spi.impl.OrganizationImpl;
import com.codenvy.resource.api.AvailableResourcesProvider;
import com.codenvy.resource.api.ResourceLockKeyProvider;
import com.codenvy.resource.api.free.DefaultResourcesProvider;
import com.codenvy.resource.api.license.ResourcesProvider;
import com.google.inject.AbstractModule;
import com.google.inject.multibindings.MapBinder;
import com.google.inject.multibindings.Multibinder;
import com.google.inject.name.Names;

/**
 * @author Sergii Leschenko
 */
public class OrganizationApiModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(OrganizationService.class);
        bind(OrganizationPermissionsFilter.class);
        bind(RemoveOrganizationOnLastUserRemovedEventSubscriber.class).asEagerSingleton();

        Multibinder.newSetBinder(binder(), DefaultResourcesProvider.class)
                   .addBinding().to(DefaultOrganizationResourcesProvider.class);

        Multibinder.newSetBinder(binder(), ResourcesProvider.class)
                   .addBinding().to(SuborganizationResourcesProvider.class);

        MapBinder.newMapBinder(binder(), String.class, AvailableResourcesProvider.class)
                 .addBinding(OrganizationImpl.ORGANIZATIONAL_ACCOUNT).to(OrganizationalAccountAvailableResourcesProvider.class);

        Multibinder.newSetBinder(binder(), ResourceLockKeyProvider.class)
                   .addBinding().to(OrganizationResourceLockKeyProvider.class);

        Multibinder.newSetBinder(binder(), AccountPermissionsChecker.class)
                   .addBinding().to(OrganizationalAccountPermissionsChecker.class);

        bind(OrganizationResourcesDistributionService.class);
        bind(OrganizationResourceDistributionServicePermissionsFilter.class);

        bind(OrganizationEventsWebsocketBroadcaster.class).asEagerSingleton();
        bind(OrganizationNotificationEmailSender.class).asEagerSingleton();
        bind(MemberEventsPublisher.class).asEagerSingleton();

        Multibinder.newSetBinder(binder(), PermissionsDomain.class,
                                 Names.named(SuperPrivilegesChecker.SUPER_PRIVILEGED_DOMAINS))
                   .addBinding().to(OrganizationDomain.class);
    }
}
