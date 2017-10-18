'use strict';

const Promise = require('bluebird');
const { async, await } = require('asyncawait');
const fs = require('./fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('container');

class Container {

    constructor(options) {

        _.defaults(options, {
            'services': []
        });

        options.services = _.isArray(options.services) ? options.services : [options.services];

        this.options = options;

        ['getService', 'init', 'load', 'mapServices'].forEach((method) => {
            this[method] = async(this[method]);
        });

    }

    get id() {

        return _.get(this, 'options.id');

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

        if (this.constants[serviceName]) {

            return this.constants[serviceName];

        } else if (this.services[serviceName]) {

            const { service } = this.services[serviceName];

            if (service['@singleton']) {
                if (this.singletons[serviceName]) {
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

    getService(serviceName) {

        if (this.constants[serviceName]) {

            return this.constants[serviceName];

        } else if (this.services[serviceName]) {

            const { service } = this.services[serviceName];

            if (service['@singleton'] && this.singletons[serviceName]) {
                return this.singletons[serviceName];
            }

            const deps = service['@require'].map((dep) => {
                return await(this.getService(dep));
            });

            debug('Loading service:', serviceName);

            if (service['@singleton']) {
                return Promise.resolve(service(...deps))
                    .tap((res) => {
                        this.singletons[serviceName] = res;
                    });
            } else {
                return service(...deps);
            }

        } else {

            throw new Error(`Unknown service: ${serviceName}`);

        }

    }

    extendRequire() {

        if (!this.options.extendRequire) {
            return;
        }

        if (!this.id) {
            throw new Error(`When 'extendError' is enabled, a value for 'id' must be passed to the Ahoy constructor.`);
        }

        debug(`Extending require() method`);

        const self = this;
        const Module = require('module');
        const originalRequire = Module.prototype.require;
        const prefix = `${this.id}/`;

        Module.prototype.require = function(...args) {
            const [ src ] = args;
            if (src.indexOf(prefix) === 0) {
                const reg = new RegExp(`${self.id}/(.*)`);
                const match = reg.exec(src);
                if (match) {
                    const serviceName = match[1];
                    if (self.services[serviceName]) {
                        return self.getServiceStatic(serviceName);
                    } else {
                        return originalRequire.apply(this, arguments);
                    }
                } else {
                    return originalRequire.apply(this, arguments);
                }
            } else {
                return originalRequire.apply(this, arguments);
            }
        };

    }

    init(entryService) {

        await(this.mapServices());
        debug('this.services', this.services);
        this.extendRequire();
        return await(this.getService(entryService));

    }

    mapServices() {

        this.services = {};

        _(this.options.services).map((service) => {
            const stats = await(fs.statAsync(service));
            if (stats.isDirectory()) {
                return await(fs.readdirAsync(service))
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
        })
            .flatten()
            .value()
            .forEach((service) => {
                const { path, basename } = service;
                delete service.path;
                delete service.basename;
                this.services[basename] = {
                    'service': service
                };
            });

        this.namedServices.map((namedService) => {
            const { name, service } = namedService;
            if (_.isFunction(service)) {
                const mod = service;
                mod.basename = name;
                return mod;
            } else {
                const stats = await(fs.statAsync(service));
                if (stats.isDirectory()) {
                    throw new Error(`Named service '${name}' references a directory.`);
                } else if (stats.isFile()) {
                    const mod = require(service);
                    mod.basename = path.basename();
                    return mod;
                }
            }
        }).forEach((namedService) => {
            const { basename } = namedService;
            delete namedService.basename;
            this.services[basename] = {
                'service': namedService
            };
        });

    }

    constant(name, value) {

        if (!_.isUndefined(this.constants[name])) {
            throw new Error(`Constant '${name}' has already been defined.`);
        }

        this.constants[name] = value;

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

        } else { // Get

            return this.getServiceStatic(name);

        }

    }

    load(service) {

        return await(this.init(service));

    }

}

module.exports = Container;
