'use strict';

const Promise = require('bluebird');
const fs = require('./fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('container');
const containers = {};

let requireExtended = false;
let prefix;

class Container {

    constructor(options) {

        _.defaults(options, {
            'services': [],
            'load': []
        });

        options.services = _.isArray(options.services) ? options.services : [options.services];

        this.options = options;

        if (options.id) {
            if (containers[options.id]) {
                throw new Error(`A dependency injection container with ID '${options.id}' has already been defined.`);
            } else {
                containers[options.id] = this;
            }
        }
        
        if (options.prefix) {
            if (prefix) {
                throw new Error(`A value for 'prefix' has already been set.`);
            }
            prefix = options.prefix;
        }

        this.initialized = false;

    }

    get id() {

        return _.get(this, 'options.id');

    }
    
    get parent() {
        
        return _.get(this, 'options.parent');
        
    }
    
    get children() {
        
        return this._children ? this._children : this._children = {};
        
    }

    get singletons() {

        return this._singletons ? this._singletons : this._singletons = {};

    }

    get namedServices() {

        return this._namedServices ? this._namedServices : this._namedServices = [];

    }

    get constants() {

        return this._constants ? this._constants : this._constants = {};

    }

    getServiceStatic(serviceName) {

        if (!_.isUndefined(this.constants[serviceName])) {

            return this.constants[serviceName];

        } else if (!_.isUndefined(this.services[serviceName])) {

            const { service } = this.services[serviceName];

            if (service['@singleton']) {
                if (!_.isUndefined(this.singletons[serviceName])) {
                    return this.singletons[serviceName];
                } else {
                    throw new Error(`Service '${serviceName}' has not been loaded!`);
                }
            } else {
                throw new Error(`Only constants and singleton services can be fetched dynamically.`);
            }

        } else {

            throw new Error(`Unknown service: ${serviceName}`);

        }

    }
    
    getConstant(name) {
        
        return this.constants[name];
        
    }
    
    getService(name, lazy = true) {
        
        const { service } = this.services[name];
        
        debug('getService', {
            'name': name,
            'service': service
        });

        if (service['@singleton'] && !_.isUndefined(this.singletons[name])) {
            return this.singletons[name];
        }
        
        if (!lazy) {
            throw new Error(`Unable to locate service: ${name}`);
        }
        
        if (service['@ns']) {
            if (!this.id) {
                throw new Error(`Namespaced services are not allowed within a container that has not been assigned a value for 'id'.`);
            }
            return this.getNamespacedService(name);
        }

        return Promise.resolve(service['@require'])
            .map((dep) => {
                return this.fetch(dep);
            }, {
                'concurrency': 1
            })
            .then((deps) => {

                debug('Loading service:', name);

                if (service['@singleton']) {
                    return Promise.resolve(service(...deps))
                        .tap((res) => {
                            this.singletons[name] = res;
                        });
                } else {
                    return service(...deps);
                }

            });

    }
    
    getNamespacedService(name) {
        
        const { service } = this.services[name];
        
        debug('getNamespacedService', {
            'name': name,
            'service': service
        });
        
        const ns = service['@ns'];
        _.defaults(ns, {
            'load': []
        });
        ns.id = name;
        ns.parent = this;
        delete service['@ns'];
        
        const container = new Container(ns);
        this.children[name] = container;
        containers[name] = container;
        container.service(name, service);
        
        return container.load(name);

    }
    
    getMappedService(name, lazy = true) {
        
        const [ containerId, serviceName ] = name.split('.');
        
        debug('getMappedService', {
            'name': name,
            'containerId': containerId,
            'serviceName': serviceName
        });
        
        let mappedService;
        const container = containers[containerId];
        
        if (container) {
            mappedService = container.fetch(serviceName, lazy);
        }

        if (!mappedService) {
            throw new Error(`Unable to locate mapped service with route: ${name}`);
        }
        
        return mappedService;
        
    }

    fetch(serviceName, lazy = true) {

        debug(`fetch: ${serviceName}`);
        
        const _fetch = () => {
            
            if (serviceName.indexOf('.') >= 0) {
                
                return this.getMappedService(serviceName, lazy);
                
            } else if (!_.isUndefined(this.constants[serviceName])) {
                
                return this.getConstant(serviceName);

            } else if (!_.isUndefined(this.services[serviceName])) {

                return this.getService(serviceName, lazy);

            } else {

                throw new Error(`Unknown service: ${serviceName}`);

            }
            
        }
        
        if (!lazy) {
            return _fetch();
        }

        return Promise.resolve()
            .then(() => {
                return _fetch();
            });

    }

    extendRequire() {

        if (!this.options.extendRequire) {
            return;
        }
        
        if (requireExtended) {
            return;
        }
        
        if (!prefix) {
            throw new Error(`When 'extendRequire' is enabled, a value for 'prefix' must be passed to the initial Ahoy constructor.`);
        }
        
        if (!this.id) {
            throw new Error(`When 'extendRequire' is enabled, a value for 'id' must be passed to the Ahoy constructor.`);
        }
        
        debug(`Extending require() method`);

        const self = this;
        const Module = require('module');
        const originalRequire = Module.prototype.require;

        Module.prototype.require = function(...args) {
            const [ src ] = args;
            if (src.indexOf(prefix) !== 0) {
                return originalRequire.apply(this, arguments);
            }
            let match;
            let _id;
            const container = Object.keys(containers).find((id) => {
                const reg = new RegExp(`${prefix}/${id}/(.*)`);
                match = reg.exec(src);
                if (match) {
                    _id = id;
                }
                return match;
            });
            if (!match) {
                return originalRequire.apply(this, arguments);
            }
            debug('Fetching service.', {
                'serviceName': match[1],
                'containerId': _id
            });
            return containers[_id].fetch(match[1], false);
        };

    }

    init(entryService) {
        
        debug('Initializing.', {
            'entryService': entryService
        });

        return this.mapServices()
            .then(() => {
                debug('this.services', this.services);
                this.extendRequire();
                return this.options.load;
            })
            .each((service) => {
                return this.fetch(service);
            });

    }

    mapServices() {
        
        debug('Mapping services.', {
            'services': this.options.services
        });

        this.services = {};

        return Promise.resolve(this.options.services)
            .map((service) => {
                return fs.statAsync(service)
                    .then((stats) => {
                        if (stats.isDirectory()) {
                            return fs.readdirAsync(service)
                                .map((row) => {
                                    const modPath = path.resolve(service, row);
                                    const mod = require(modPath);
                                    mod.basename = path.basename(modPath);
                                    return mod;
                                });
                        } else if (stats.isFile()) {
                            const mod = require(service);
                            mod.basename = path.basename();
                            return mod;
                        }
                    });
            }, {
                'concurrency': 1
            })
            .then((services) => {
                
                debug('Mapped services.', services);

                services = _.flatten(services);
                services.forEach((service) => {
                    const { basename } = service;
                    delete service.basename;
                    this.services[basename] = {
                        'service': service
                    };
                    if (service['@autoload'] && this.options.load.indexOf(basename) === -1) {
                        this.options.load.push(basename);
                    }
                });

                return this.namedServices;

            })
            .map((namedService) => {

                const { name, service } = namedService;
                if (_.isFunction(service)) {
                    const mod = service;
                    mod.basename = name;
                    return mod;
                } else if (_.isObject(service)) {
                    const mod = service['@service'];
                    mod['@singleton'] = service['@singleton'];
                    mod['@require'] = service['@require'];
                    mod['@ns'] = service['@ns'];
                    mod['@autoload'] = service['@autoload'];
                    mod.basename = name;
                    return mod;
                } else {
                    return fs.statAsync(service)
                        .then((stats) => {
                            if (stats.isDirectory()) {
                                throw new Error(`Named service '${name}' references a directory.`);
                            } else if (stats.isFile()) {
                                const mod = require(service);
                                mod.basename = path.basename();
                                return mod;
                            }
                        });
                }

            }, {
                'concurrency': 1
            })
            .each((namedService) => {
                const { basename } = namedService;
                delete namedService.basename;
                this.services[basename] = {
                    'service': namedService
                };
                if (namedService['@autoload'] && this.options.load.indexOf(basename) === -1) {
                    this.options.load.push(basename);
                }
            });
            // .then(() => {
            //     return Object.keys(this.services);
            // })
            // .each((serviceName) => {
            //     const { service } = this.services[serviceName];
            //     if (service['@autoload']) {
            //         return
            //     }
            // });

    }

    constant(name, value) {
        
        if (!_.isUndefined(value)) { // Set
            
            this.constants[name] = value;
            
        } else { // Get
            
            return this.constants[name];
            
        }

    }

    service(name, service) {

        if (!name) {
            throw new Error(`'name' is required`);
        }

        if (service) { // Set

            const existing = _.find(this.namedServices, { 'name': name });

            if (existing) {
                this.namedServices.splice(this.namedServices.indexOf(match), 1);
            }

            this.namedServices.push({
                'name': name,
                'service': service
            });
            
            if (service['@autoload'] && this.options.load.indexOf(name) === -1) {
                this.options.load.push(name);
            }

        } else { // Get

            return this.getServiceStatic(name);

        }

    }

    load(service) {

        return Promise.resolve()
            .then(() => {
                if (this.initialized) {
                    return this.fetch(service);
                } else {
                    return this.init(service)
                        .then(() => {
                            this.initialized = true;
                            return this.fetch(service);
                        });
                }
            });

    }

}

Container.byId = function(id) {

    if (!id) {
        throw new Error(`'id' is required`);
    }

    if (!containers[id]) {
        throw new Error(`Unable to locate dependency injection container with ID: ${id}`);
    }

    return containers[id];

}

module.exports = Container;
