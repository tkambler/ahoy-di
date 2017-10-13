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

    get singletons() {

        return this._singletons ? this._singletons : this._singletons = {};

    }

    get namedServices() {

        return this._namedServices ? this._namedServices : this._namedServices = [];

    }

    getService(serviceName) {

        const { service } = this.services[serviceName];

        if (service['@singleton'] && this.singletons[serviceName]) {
            return this.singletons[serviceName];
        }

        const deps = service['@require'].map((dep) => {
            return await(this.getService(dep));
        });

        debug('Loading service:', serviceName);

        if (service['@singleton']) {
            return this.singletons[serviceName] = service(...deps);
        } else {
            return service(...deps);
        }

    }

    init(entryService) {

        await(this.mapServices());
        debug('this.services', this.services);
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
            console.log(stats.isDirectory());
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

    addService(name, service) {

        const existing = _.find(this.namedServices, { 'name': name });

        if (existing) {
            this.namedServices.splice(this.namedServices.indexOf(match), 1);
        }

        this.namedServices.push({
            'name': name,
            'service': service
        });

    }

    load(service) {

        return await(this.init(service));

    }

}

module.exports = Container;
