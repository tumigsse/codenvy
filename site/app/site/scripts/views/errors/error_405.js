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
 
define(["jquery", "models/account", "backbone"],

    function($, Account, Backbone){
        var Error405 = Backbone.View.extend({

        	initialize : function(){
                var self = this;
                Account.getBrandingInfo()
                .done(function(Branding){
                    try{
                        document.title = Branding.errorpage.error405.title;
                    }catch(err){
                        window.console.error('Branding error. Missing title in product.json');
                    }
                    try{
                        $('.header').html(Branding.errorpage.error405.header);
                    }catch(err){
                        window.console.error('Branding error. Missing header for 405-error in product.json');
                    }
                    try{
                        $('.message').html(Branding.errorpage.error405.message);
                    }catch(err){
                        window.console.error('Branding error. Missing error message for 405-error in product.json');
                    }
                })
                .then(function(){
                    self._showHidden();
                });
        	},
            _showHidden : function(){
                this.$el.removeClass('hidden');
            }
        });


        return {
            get : function(form){
                if(typeof form === 'undefined'){
                    throw new Error("Need a form");
                }
                return new Error405({el:form});
            },

            Error405 : Error405
        };
    }
);
