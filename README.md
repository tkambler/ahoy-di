# Ahoy-DI

A flexible dependency injection (DI) container for Node

---

Given a collection of services, Ahoy-DI will automatically load and connect them together in the appropriate order based on their specified dependencies. When a service that returns a promise is encountered, the setup process will wait until the promise is resolved before continuing.

If you're familiar with the dependency injection system used by [AngularJS](https://angularjs.org/), you'll feel right at home.

## Services

First, let's look at a simple service that has no dependencies. In this example, our service is declared to be a singleton. As a result, all services that rely upon this service will share the same instance.

```
exports = module.exports = function() {

    return new class {
        start() {
            console.log('Car is starting.');
        }
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
```

Next, let's pair two services together. In this example, we have created a `foo` service that relies upon the `bar` service.

**services/foo.bar**

```
exports = module.exports = function(bar) {

    return () => {
        console.log('Foo.');
        bar();
    };


};

exports['@singleton'] = true;
exports['@require'] = ['bar'];
```

**services/bar.js**

```
exports = module.exports = function() {

    return () => {
        console.log('Bar.');
    };

};

exports['@singleton'] = true;
exports['@require'] = [];
```

## Wiring Services Together

The simplest method by which Ahoy-DI can be configured is to point it at a directory containing your application's services. When a service exists within a directory, the name of that directory will determine the service's name. When a service exists as a standalone file, the base name of the file will determine the service's name.

In this example, three services a loaded - `foo`, `bar`, and `beep`.

```
/**
 * File structure:
 *
 * index.js (this script)
 * ./services
 *     foo/index.js
 *     bar/index.js
 *     beep.js
 */

const Ahoy = require('ahoy-di');
const path = require('path');

const container = new Ahoy({
    'services': path.resolve(__dirname, 'services')
});

container.load('foo')
    .then((foo) => {
        foo.herp();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
```

### Loading Services from Multiple Directories

You may also pass an array of service directories the Ahoy-DI. In the event that a service with the same name is defined in multiple locations, the last one to be defined will take precedence. Service directories are parsed in the order in which they are passed.

```
const Ahoy = require('ahoy-di');
const path = require('path');

const container = new Ahoy({
    'services': [
    	path.resolve(__dirname, 'services'),
    	path.resolve(__dirname, 'more-services'),
    ]
});

container.load('foo')
    .then((foo) => {
        foo.herp();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
```

### Loading Services by Name

Individual services can also be defined by name. In the event that a service with the specified name has already been located elsewhere, the service that has been defined by name will always take precedence.

```
const Ahoy = require('ahoy-di');
const path = require('path');

const container = new Ahoy({
    'services': [
    	path.resolve(__dirname, 'services'),
    	path.resolve(__dirname, 'more-services'),
    ]
});

container.service('car', require('./misc/car'));

container.load('foo')
    .then((foo) => {
        foo.herp();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
```

## Constants

In addition to defining services, you can also define constants. The following example illustrates this concept.

```
const Ahoy = require('ahoy-di');
const path = require('path');

const container = new Ahoy({
    'services': path.resolve(__dirname, 'services')
});

/**
 * Each of your services can now access the `settings` object we have defined here
 * in the same way that they would access any other service.
 */
container.constant('settings', {
    'make': 'Jeep',
    'model': 'Grand Cherokee',
    'year': '2017'
});

container.load('foo')
    .then((foo) => {
        foo.herp();
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
```

## Requirements

- Node.js >= v8.6.0

## To-Do

- Unit Tests
- Document "dynamic fetching" (see example #4)
- Document 'id' and 'extendRequire' options
