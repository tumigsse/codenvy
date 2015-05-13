/*
 * CODENVY CONFIDENTIAL
 * __________________
 *
 *  [2012] - [2015] Codenvy, S.A.
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
package com.codenvy.analytics.metrics.users;

import com.codenvy.analytics.metrics.AbstractActiveEntities;
import com.codenvy.analytics.metrics.Context;
import com.codenvy.analytics.metrics.MetricFilter;
import com.codenvy.analytics.metrics.MetricType;
import com.codenvy.analytics.metrics.OmitFilters;

import javax.annotation.security.RolesAllowed;
import java.io.IOException;

/** @author <a href="mailto:abazko@codenvy.com">Anatoliy Bazko</a> */
@RolesAllowed({"system/admin", "system/manager"})
@OmitFilters({MetricFilter.WS_ID, MetricFilter.PERSISTENT_WS})
public class UsersLoggedInWithSysldap extends AbstractActiveEntities {
    public static final String SYSLDAP = "sysldap";

    public UsersLoggedInWithSysldap() {
        super(MetricType.USERS_LOGGED_IN_WITH_SYSLDAP, MetricType.USERS_LOGGED_IN_TYPES, USER);
    }

    /** {@inheritDoc} */
    @Override
    public Context applySpecificFilter(Context clauses) throws IOException {
        Context.Builder builder = new Context.Builder(clauses);
        builder.put(MetricFilter.EXISTS, new String[]{SYSLDAP});
        return builder.build();
    }

    /** {@inheritDoc} */
    @Override
    public String getDescription() {
        return "The number of authentication using system LDAP";
    }
}
