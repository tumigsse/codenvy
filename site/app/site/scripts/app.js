/*
 * CODENVY CONFIDENTIAL
 * __________________
 * 
 *  [2012] - [2013] Codenvy, S.A. 
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
 
define(["jquery","config",
        "views/forgotpasswordform",
        "views/resetpasswordform",
        "views/errorreport",
        "views/create_ws_add_member",
        "views/onpremises-login",
        "views/factory-usage-notification",
        "views/login",
        "views/accept-fair-source-license",
        "views/fair-source-license-is-not-accepted-error",
        "views/maintenance",
        "views/errors/error_400",
        "views/errors/error_401",
        "views/errors/error_403",
        "views/errors/error_404",
        "views/errors/error_405",
        "views/errors/error_500",
        "views/errors/error_503",
        "views/errors/error_504",
        "views/errors/browser-not-supported",
        "views/errors/error-cookies-disabled",
        "views/errors/error-factory-creation",
        "views/errors/error-tenant-name"
        ],

    function($,Config,
        ForgotPasswordForm,
        ResetPasswordForm,
        ErrorReport,
        CreateWsAdd_Member,
        OnPremisesLogin,
        FactoryUsageNotification,
        MainPage,
        AcceptLicensePage,
        FSLNotAcceptedErrorPage,
        Maintenance,
        Error400,
        Error401,
        Error403,
        Error404,
        Error405,
        Error500,
        Error503,
        Error504,
        BrowserNotSupported,
        YourCookiesAreDisabled,
        FactoryWorkspaceCreationFailed,
        WorkspaceDoesNotExist){

        function modernize(){
            Modernizr.load({
                // HTML5 placeholder for input elements
                test : Modernizr.input.placeholder,
                nope : Config.placeholderPolyfillUrl,
                complete : function(){
                    if(typeof $.fn.placeholder !== 'undefined'){
                        $('input, textarea').placeholder();
                    }
                }
            });
        }

        return {
            run : function(){
                $(document).ready(function(){

                    modernize();
                    var uvOptions = {}; //UserVoice object
                    
                    if (uvOptions){}
                    var forgotPasswordForm = $(".forgotpassword-form"),
                        resetPasswordForm = $(".resetpassword-form"),
                        errorContainer = $(".error-container"),
                        creatWsAddMember = $(".create-ws-add-memeber"),
                        onpremloginForm = $(".onpremloginForm"),
                        factoryUsageNotification =  $(".factory-notification"),
                        mainpage = $(".main-page"),
                        acceptLicensePage = $(".accept-license-form"),
                        fslNotAcceptedPage = $(".fair-source-license-is-not-accepted-error"),
                        maintenance = $(".maintenance"),
                        error400 = $(".400"),
                        error401 = $(".401"),
                        error403 = $(".403"),
                        error404 = $(".404"),
                        error405 = $(".405"),
                        error500 = $(".500"),
                        error503 = $(".503"),
                        error504 = $(".504"),
                        browserNotSupported = $(".browser-not-supported"),
                        yourCookiesAreDisabled = $(".error-cookies-disabled"),
                        factoryWorkspaceCreationFailed = $(".error-factory-creation"),
                        workspaceDoesNotExist = $(".error-tenant-name");

                    if(maintenance.length !== 0){
                        (function(){
                            Maintenance.get(maintenance);
                        }());

                    }

                    if(error400.length !== 0){
                        (function(){
                            Error400.get(error400);
                        }());

                    }

                    if(error401.length !== 0){
                        (function(){
                            Error401.get(error401);
                        }());

                    }

                    if(error403.length !== 0){
                        (function(){
                            Error403.get(error403);
                        }());

                    }

                    if(error404.length !== 0){
                        (function(){
                            Error404.get(error404);
                        }());

                    }

                    if(error405.length !== 0){
                        (function(){
                            Error405.get(error405);
                        }());

                    }

                    if(error500.length !== 0){
                        (function(){
                            Error500.get(error500);
                        }());

                    }

                    if(error503.length !== 0){
                        (function(){
                            Error503.get(error503);
                        }());

                    }

                    if(error504.length !== 0){
                        (function(){
                            Error504.get(error504);
                        }());

                    }

                    if(browserNotSupported.length !== 0){
                        (function(){
                            BrowserNotSupported.get(browserNotSupported);
                        }());

                    }

                    if(yourCookiesAreDisabled.length !== 0){
                        (function(){
                            YourCookiesAreDisabled.get(yourCookiesAreDisabled);
                        }());

                    }

                    if(factoryWorkspaceCreationFailed.length !== 0){
                        (function(){
                            FactoryWorkspaceCreationFailed.get(factoryWorkspaceCreationFailed);
                        }());

                    }

                    if(workspaceDoesNotExist.length !== 0){
                        (function(){
                            WorkspaceDoesNotExist.get(workspaceDoesNotExist);
                        }());

                    }

                    if(fslNotAcceptedPage.length !== 0){
                        (function(){
                            var form = FSLNotAcceptedErrorPage.get(fslNotAcceptedPage),
                            errorReport = ErrorReport.get(errorContainer);
                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });
                        }());

                    }

                    if(acceptLicensePage.length !== 0){
                        (function(){
                            var form = AcceptLicensePage.get(acceptLicensePage),
                            errorReport = ErrorReport.get(errorContainer);
                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });
                            form.on("submitting", function(){
                                errorReport.hide();
                            });
                        }());

                    }

                    if(factoryUsageNotification.length !== 0){
                        (function(){
                            FactoryUsageNotification.get(factoryUsageNotification);
                        }());
                        
                    }

                    if(onpremloginForm.length !== 0){
                        (function(){
                            var form = OnPremisesLogin.get(onpremloginForm),
                            errorReport = ErrorReport.get(errorContainer);

                            form.on("submitting", function(){
                                errorReport.hide();
                            });

                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });
                            
                        }());
                    }

                    if(creatWsAddMember.length !== 0){
                        (function(){
                            var form = CreateWsAdd_Member.get(creatWsAddMember),
                            errorReport = ErrorReport.get(errorContainer);

                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });
                            
                        }());
                    }

                    if(forgotPasswordForm.length !== 0){
                        (function(){
                            var form = ForgotPasswordForm.get(forgotPasswordForm),
                            errorReport = ErrorReport.get(errorContainer);

                            form.on("submitting", function(){
                                errorReport.hide();
                            });

                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });


                        }());
                    }

                    if(resetPasswordForm.length !== 0){
                        (function(){

                            var form = ResetPasswordForm.get(resetPasswordForm),
                                errorReport = ErrorReport.get(errorContainer);

                            form.on("submitting", function(){
                                errorReport.hide();
                            });

                            form.on("success", function(d){
                                window.location.href = d.url;
                            });

                            form.on("invalid", function(field,message){
                                errorReport.show(message);
                            });

                            form.resolveUserEmail();

                        }());
                    }


                    if(mainpage.length !== 0){
                        (function(){
                            var form = MainPage.get(mainpage);
                            form.on("invalid", function(field,message,errorContainer){
                                var errorReport = ErrorReport.get(errorContainer);
                                errorReport.show(message);
                            });
                        }());
                        
                    }
                    
                });
            }
        };

    }
);
