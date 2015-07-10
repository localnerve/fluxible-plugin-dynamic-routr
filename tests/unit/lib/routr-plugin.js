/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe, it, after, beforeEach */
'use strict';

var expect = require('chai').expect;
var routrPlugin = require('../../../lib/routr-plugin');
var createStore = require('fluxible/addons/createStore');
var Fluxible = require('fluxible');

var RoutesStore = createStore({
    storeName: 'RoutesStore',
    handlers: {
        'RECEIVE_ROUTES': 'receiveRoutes'
    },
    initialize: function() {
        this.routes = {};
    },
    receiveRoutes: function(routes) {
        this.routes = routes;
        this.emitChange();
    }
});

describe('DynRoutrPlugin', function() {
    var app,
        pluginInstance,
        pluginName,
        context,
        routes1 = {
            view_user: {
                path: '/user/:id',
                method: 'get',
                foo: {
                    bar: 'baz'
                }
            },
            view_user_post: {
                path: '/user/:id/post/:post',
                method: 'get'
            }
        },
        routes2 = {
            view_second: {
                path: '/second/:id',
                method: 'get',
                foo: {
                    bar: 'all'
                }
            }
        },
        passThru = function(routes) {
            return routes;
        },
        dehydrateRoutes = function(routes) {
            routes.test = 'test';
            return routes;
        },
        rehydrateRoutes = function(routes) {
            expect(routes.test).to.equal('test');
            delete routes.test;
            return routes;
        },
        pluginOptions = {
            storeName: RoutesStore.storeName,
            storeEvent: 'change'
        };

    function actionContextRoutes(actionContext) {
        expect(actionContext.router).to.be.an('object');
        expect(actionContext.router.makePath).to.be.a('function');
        expect(actionContext.router.getRoute).to.be.a('function');
    }
    function actionContextRoutes1(actionContext) {
        expect(actionContext.router.makePath('view_user', {id: 1})).to.equal('/user/1');
    }
    function actionContextRoutes2(actionContext) {
        expect(actionContext.router.makePath('view_second', {id: 2})).to.equal('/second/2');
    }
    function componentContextRoutes1(componentContext) {
        expect(componentContext.makePath).to.be.a('function');
        expect(componentContext.makePath('view_user', {id: 1})).to.equal('/user/1');
    }
    function componentContextRoutes2(componentContext) {
        expect(componentContext.makePath).to.be.a('function');
        expect(componentContext.makePath('view_second', {id: 2})).to.equal('/second/2');
    }

    beforeEach(function() {
        app = new Fluxible();
        pluginInstance = routrPlugin(pluginOptions);
        pluginName = pluginInstance.name;
        app.plug(pluginInstance);
        app.registerStore(RoutesStore);
        context = app.createContext();
    });

    describe('factory', function() {
        it('should not have any routes defined', function() {
            expect(pluginInstance.getRoutes()).to.be.an('undefined');
        });
    });

    describe('dehydrate/rehydrate', function() {
        var dehydratedState = {
            routes: passThru(routes1)
        };
        it('should have context rehydrate/dehydrate', function() {
            var contextPlug = pluginInstance.plugContext();
            expect(contextPlug.dehydrate).to.be.a('function');
            expect(contextPlug.rehydrate).to.be.a('function');
        });
        describe('rehydrate', function() {
            beforeEach(function() {
                var plugins = {};
                plugins[pluginName] = dehydratedState;

                context.rehydrate({
                    plugins: plugins
                });
            });
            it('should have routes', function() {
                expect(pluginInstance.getRoutes()).to.eql(routes1);
            });
            describe('actionContext', function() {
                var actionContext;
                beforeEach(function() {
                    actionContext = context.getActionContext();
                });
                it('should have a router access', function() {
                    actionContextRoutes(actionContext);
                    actionContextRoutes1(actionContext);
                });
            });
            describe('componentContext', function() {
                var componentContext;
                beforeEach(function() {
                    componentContext = context.getComponentContext();
                });
                it('should have a router access', function() {
                    componentContextRoutes1(componentContext);
                });
            });
        });
        describe('dehydrate', function() {
            var contextPlug;
            beforeEach(function() {
                contextPlug = pluginInstance.plugContext();
                contextPlug.rehydrate(dehydratedState);
            });
            it('should dehydrate using dehydrateRoutes', function() {
                expect(contextPlug.dehydrate(routes1)).to.eql(dehydratedState);
            });
        });
        describe('route transformers', function() {
            // Just redefine everything
            beforeEach(function() {
                app = new Fluxible();
                pluginOptions.dehydrateRoutes = dehydrateRoutes;
                pluginOptions.rehydrateRoutes = rehydrateRoutes;
                pluginInstance = routrPlugin(pluginOptions);
                pluginName = pluginInstance.name;
                app.plug(pluginInstance);
                app.registerStore(RoutesStore);
                context = app.createContext();
            });
            after(function() {
                delete pluginOptions.dehydrateRoutes;
                delete pluginOptions.rehydrateRoutes;
            });
            it('should use dehydrateRoutes if defined', function() {
                var actionContext = context.getActionContext();
                actionContext.dispatch('RECEIVE_ROUTES', routes1);
                dehydratedState = context.dehydrate().plugins[pluginName];
                expect(dehydratedState.routes.test).to.equal('test');
            });
            it('should use rehydrateRoutes if defined', function() {
                var plugins = {};
                plugins[pluginName] = dehydratedState;
                context.rehydrate({
                    plugins: plugins
                });
                expect(pluginInstance.getRoutes()).to.eql(routes1);
            });
        });
    });

    describe('updateRoutes', function() {
        var actionContext;
        beforeEach(function() {
            actionContext = context.getActionContext();
        });
        it('should update with routes1 when store updates', function() {
            actionContext.dispatch('RECEIVE_ROUTES', routes1);
            expect(pluginInstance.getRoutes()).to.eql(routes1);
        });
        it('should update with routes2 when store updates', function() {
            actionContext.dispatch('RECEIVE_ROUTES', routes2);
            expect(pluginInstance.getRoutes()).to.eql(routes2);
        });
        describe('context updates', function() {
            describe('routes1', function() {
                describe('actionContext', function() {
                    it('should have a router access', function() {
                        actionContext.dispatch('RECEIVE_ROUTES', routes1);
                        actionContextRoutes(actionContext);
                        actionContextRoutes1(actionContext);
                    });
                });
                describe('componentContext', function() {
                    var componentContext;
                    beforeEach(function() {
                        componentContext = context.getComponentContext();
                    });
                    it('should have a router access', function() {
                        actionContext.dispatch('RECEIVE_ROUTES', routes1);
                        componentContextRoutes1(componentContext);
                    });
                });
            });
            describe('routes2', function() {
                describe('actionContext', function() {
                    it('should have a router access', function() {
                        actionContext.dispatch('RECEIVE_ROUTES', routes2);
                        actionContextRoutes(actionContext);
                        actionContextRoutes2(actionContext);
                    });
                });
                describe('componentContext', function() {
                    var componentContext;
                    beforeEach(function() {
                        componentContext = context.getComponentContext();
                    });
                    it('should have a router access', function() {
                        actionContext.dispatch('RECEIVE_ROUTES', routes2);
                        componentContextRoutes2(componentContext);
                    });
                });
            });
        });
    });
});
