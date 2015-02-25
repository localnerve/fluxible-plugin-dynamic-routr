/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('DynRoutrPlugin');
var Router = require('routr');

var passThru = function(routes) {
    return routes;
};

module.exports = function routrPlugin(options) {
    options = options || {};

    var storeName = options.storeName;
    var storeEvent = options.storeEvent;
    var dehydrateRoutes = options.dehydrateRoutes || passThru;
    var rehydrateRoutes = options.rehydrateRoutes || passThru;

    // Undefined until updated.
    var routes;

    /**
     * @class DynRoutrPlugin
     */
    return {
        name: 'DynRoutrPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @returns {Object}
         */
        plugContext: function plugContext() {
            debug('new plug context');
            var router, actionContext, componentContext;

            /**
             * Dynamically update the routes, make a new Router, fix references.
             * @param {Object} params
             * @param {Object} params.routes The new routes to supply Routr
             */
            var updateRoutes = function updateRoutes(params) {
                debug('updating routes');
                routes = params.routes;
                router = new Router(routes);
                if (actionContext) {
                    actionContext.router = router;
                }
                if (componentContext) {
                    componentContext.makePath = router.makePath.bind(router);
                }
            };

            return {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} context The Fluxible action context
                 */
                plugActionContext: function plugActionContext(context) {
                    debug('plug action context, router = '+router);
                    actionContext = context;
                    actionContext.router = router;

                    // Update on a store event within the single round.
                    // Could be 'change' from dedicated route store, or
                    // a dedicated change event within an application store.
                    actionContext.getStore(storeName)
                        .removeListener(storeEvent, updateRoutes)
                        .on(storeEvent, updateRoutes);
                },
                /**
                 * Provides access to create paths by name
                 * @param {Object} context The Fluxible component context
                 */
                plugComponentContext: function plugComponentContext(context) {
                    componentContext = context;
                    if (router) {
                        componentContext.makePath = router.makePath.bind(router);
                    }
                },
                /**
                 * Allows context plugin settings to be persisted between server and client.
                 * Called on server to send data down to the client.
                 * @returns {Object} state
                 */
                dehydrate: function dehydrate() {
                    return { routes: dehydrateRoutes(routes) };
                },
                /**
                 * Called on client to rehydrate the context plugin settings.
                 * @param {Object} state
                 */
                rehydrate: function rehydrate(state) {
                    updateRoutes({ routes: rehydrateRoutes(state.routes) });
                }
            };
        },
        /**
         * @method getRoutes
         * @returns {Object} Route specs
         */
        getRoutes: function getRoutes() {
            return routes;
        }
    };
};