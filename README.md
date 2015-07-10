# A Dynamic Routr Plugin for Fluxible

[![npm version](https://badge.fury.io/js/fluxible-plugin-dynamic-routr.svg)](http://badge.fury.io/js/fluxible-plugin-dynamic-routr)
[![Build Status](https://travis-ci.org/localnerve/fluxible-plugin-dynamic-routr.svg?branch=master)](https://travis-ci.org/localnerve/fluxible-plugin-dynamic-routr)
[![Dependency Status](https://david-dm.org/localnerve/fluxible-plugin-dynamic-routr.svg)](https://david-dm.org/localnerve/fluxible-plugin-dynamic-routr)
[![devDependency Status](https://david-dm.org/localnerve/fluxible-plugin-dynamic-routr/dev-status.svg)](https://david-dm.org/localnerve/fluxible-plugin-dynamic-routr#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/localnerve/fluxible-plugin-dynamic-routr/badge.svg?branch=master)](https://coveralls.io/r/localnerve/fluxible-plugin-dynamic-routr?branch=master)

## Deprecated
This package has been deprecated in favor of [fluxible-router](https://github.com/yahoo/fluxible-router). It's a major change, but fluxible-router comes with a great RouteStore and supportive components that get even more routing code out of your project. You also get to leave mixins behind, which aligns you with future React.

For help:  
1. Here is the main [diff](https://github.com/localnerve/flux-react-example/commit/851bad848cd21c8ebecefa098d6b42e42f86ea3c) of my conversion to fluxible-router.
2. If you have dynamic routing actions that transform to/from functions, this still works great in fluxible-router, but you have to handle re/dehydration yourself. I chose extending the fluxible-router RouteStore as the least impactful change that also aligns with Yahoo. Here my RouteStore [extension](https://github.com/localnerve/flux-react-example/blob/9e6d56f4ab0af2791d76d6e7cb4f84a6ae03b2e0/stores/RouteStore.js), which follows the pattern Yahoo uses for [static routes](https://github.com/yahoo/fluxible-router/blob/4b6f086cf964f28aee5f658bcb60f14b8a2c90e0/lib/RouteStore.js#L134).
3. Here is the yahoo guide on [upgrading](https://github.com/yahoo/fluxible-router/blob/master/UPGRADE.md) to fluxible-router.

## Usage
Provides dynamic routing methods to your [Fluxible](https://github.com/yahoo/fluxible) application using [routr](https://github.com/yahoo/routr).

```js
var Fluxible = require('fluxible');
var routrPlugin = require('fluxible-plugin-routr');
var app = new Fluxible();

var pluginInstance = routrPlugin({
    storeName: 'RoutesStore', // storeName of the Store event source
    storeEvent: 'change'      // Any event from that Store
});

app.plug(pluginInstance);
```

A more complete example usage in an isomorphic fluxible application is found [here](https://github.com/localnerve/flux-react-example)

## Routr Plugin API
### Constructor(options)

Creates a new routr plugin instance with the following parameters:

 * `options`: An object containing the plugin settings
 * `options.storeName` (required): The storeName of the Store
 * `options.storeEvent` (required): The name of the event from the Store
 * `options.dehydrateRoutes` (optional): A function to transform from fluxible routes to a flat format
 * `options.rehydrateRoutes` (optional): A function to transform from a flat format to fluxible routes

### Instance Methods

#### getRoutes

getter for the `routes` option passed into the constructor.

```
// returns the full routes object
// undefined before updated or rehydrated
pluginInstance.getRoutes();
```

### actionContext Methods

Provides full access to the routr instance. See [routr docs](https://github.com/yahoo/routr) for more information.

 * `actionContext.router.makePath(routeName, routeParams)`: Create a URL based on route name and params
 * `actionContext.router.getRoute(path)`: Returns matched route

## License

This software is free to use under the LocalNerve BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/localnerve/fluxible-plugin-dynamic-routr/blob/master/LICENSE.md
