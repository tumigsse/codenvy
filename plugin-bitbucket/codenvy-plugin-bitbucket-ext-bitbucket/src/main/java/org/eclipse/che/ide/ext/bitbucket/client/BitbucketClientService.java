/*******************************************************************************
 * Copyright (c) 2012-2016 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 *******************************************************************************/
package org.eclipse.che.ide.ext.bitbucket.client;

import com.google.inject.Inject;
import com.google.inject.Singleton;

import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketPullRequest;
import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketPullRequests;
import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketRepositories;
import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketRepository;
import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketRepositoryFork;
import org.eclipse.che.ide.ext.bitbucket.shared.BitbucketUser;
import org.eclipse.che.ide.rest.AsyncRequestCallback;
import org.eclipse.che.ide.rest.AsyncRequestFactory;
import org.eclipse.che.ide.rest.RestContext;
import org.eclipse.che.ide.ui.loaders.request.LoaderFactory;

import javax.validation.constraints.NotNull;

import static org.eclipse.che.ide.ext.bitbucket.shared.Preconditions.checkArgument;
import static org.eclipse.che.ide.ext.bitbucket.shared.StringHelper.isNullOrEmpty;

/**
 * The Bitbucket service implementation to be use by the client.
 *
 * @author Kevin Pollet
 */
@Singleton
public class BitbucketClientService {
    private static final String BITBUCKET    = "/bitbucket";
    private static final String USER         = "/user";
    private static final String REPOSITORIES = "/repositories";
    private static final String SSH_KEYS     = "/ssh-keys";

    private final String              baseUrl;
    private final LoaderFactory       loaderFactory;
    private final AsyncRequestFactory asyncRequestFactory;

    @Inject
    protected BitbucketClientService(@NotNull @RestContext final String baseUrl,
                                     @NotNull final LoaderFactory loaderFactory,
                                     @NotNull final AsyncRequestFactory asyncRequestFactory) {
        this.baseUrl = baseUrl + BITBUCKET;
        this.loaderFactory = loaderFactory;
        this.asyncRequestFactory = asyncRequestFactory;
    }

    /**
     * Get authorized user information.
     *
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void getUser(@NotNull AsyncRequestCallback<BitbucketUser> callback) throws IllegalArgumentException {
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + USER;
        asyncRequestFactory.createGetRequest(requestUrl).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Get Bitbucket repository information.
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param repositorySlug
     *         the repository name, cannot be {@code null}.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void getRepository(@NotNull final String owner,
                              @NotNull final String repositorySlug,
                              @NotNull final AsyncRequestCallback<BitbucketRepository> callback) throws IllegalArgumentException {
        checkArgument(owner != null, "owner");
        checkArgument(repositorySlug != null, "repositorySlug");
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + REPOSITORIES + "/" + owner + "/" + repositorySlug;
        asyncRequestFactory.createGetRequest(requestUrl).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Get Bitbucket repository forks.
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param repositorySlug
     *         the repository name, cannot be {@code null}.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void getRepositoryForks(@NotNull final String owner,
                                   @NotNull final String repositorySlug,
                                   @NotNull final AsyncRequestCallback<BitbucketRepositories> callback) throws IllegalArgumentException {
        checkArgument(owner != null, "owner");
        checkArgument(repositorySlug != null, "repositorySlug");
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + REPOSITORIES + "/" + owner + "/" + repositorySlug + "/forks";
        asyncRequestFactory.createGetRequest(requestUrl).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Fork a Bitbucket repository.
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param repositorySlug
     *         the repository name, cannot be {@code null}.
     * @param forkName
     *         the fork name, cannot be {@code null} or empty.
     * @param isForkPrivate
     *         if the fork must be private.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void forkRepository(@NotNull final String owner,
                               @NotNull final String repositorySlug,
                               @NotNull final String forkName,
                               final boolean isForkPrivate,
                               @NotNull final AsyncRequestCallback<BitbucketRepositoryFork> callback) throws IllegalArgumentException {
        checkArgument(owner != null, "owner");
        checkArgument(repositorySlug != null, "repositorySlug");
        checkArgument(forkName != null && !isNullOrEmpty(forkName), "forkName");
        checkArgument(callback != null, "callback");

        final String requestUrl =
                baseUrl + REPOSITORIES + "/" + owner + "/" + repositorySlug + "/fork?forkName=" + forkName + "&isForkPrivate=" +
                isForkPrivate;
        asyncRequestFactory.createPostRequest(requestUrl, null).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Get Bitbucket repository pull requests.
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param repositorySlug
     *         the repository name, cannot be {@code null}.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void getRepositoryPullRequests(@NotNull final String owner,
                                          @NotNull final String repositorySlug,
                                          @NotNull final AsyncRequestCallback<BitbucketPullRequests> callback)
            throws IllegalArgumentException {
        checkArgument(owner != null, "owner");
        checkArgument(repositorySlug != null, "repositorySlug");
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + REPOSITORIES + "/" + owner + "/" + repositorySlug + "/pullrequests";
        asyncRequestFactory.createGetRequest(requestUrl).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Open the given {@link org.eclipse.che.ide.ext.bitbucket.shared.BitbucketPullRequest}.
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param repositorySlug
     *         the repository name, cannot be {@code null}.
     * @param pullRequest
     *         the {@link org.eclipse.che.ide.ext.bitbucket.shared.BitbucketPullRequest} to open, cannot be {@code null}.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void openPullRequest(@NotNull final String owner,
                                @NotNull final String repositorySlug,
                                @NotNull final BitbucketPullRequest pullRequest,
                                @NotNull final AsyncRequestCallback<BitbucketPullRequest> callback) throws IllegalArgumentException {
        checkArgument(!isNullOrEmpty(owner), "owner");
        checkArgument(!isNullOrEmpty(repositorySlug), "repositorySlug");
        checkArgument(pullRequest != null, "pullRequest");
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + REPOSITORIES + "/" + owner + "/" + repositorySlug + "/pullrequests";
        asyncRequestFactory.createPostRequest(requestUrl, pullRequest).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Get owner Bitbucket repositories
     *
     * @param owner
     *         the repository owner, cannot be {@code null}.
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void getRepositories(@NotNull final String owner,
                                @NotNull final AsyncRequestCallback<BitbucketRepositories> callback) throws IllegalArgumentException {
        checkArgument(owner != null, "owner");
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + REPOSITORIES + "/" + owner;
        asyncRequestFactory.createGetRequest(requestUrl).loader(loaderFactory.newLoader()).send(callback);
    }

    /**
     * Generate and upload new public key if not exist on bitbucket.org.
     *
     * @param callback
     *         callback called when operation is done, cannot be {@code null}.
     * @throws java.lang.IllegalArgumentException
     *         if one parameter is not valid.
     */
    public void generateAndUploadSSHKey(@NotNull AsyncRequestCallback<Void> callback) throws IllegalArgumentException {
        checkArgument(callback != null, "callback");

        final String requestUrl = baseUrl + SSH_KEYS;
        asyncRequestFactory.createPostRequest(requestUrl, null).loader(loaderFactory.newLoader()).send(callback);
    }
}