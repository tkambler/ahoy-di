const Container = require('../');
const path = require('path');
const _ = require('lodash');
const assert = require('assert');

describe('Test Suite', function() {

    it('Should load services from directory', function() {

        const container = new Container({
            'services': [
                path.resolve(__dirname, 'services')
            ]
        });

        return container.load('foo')
            .then((foo) => {
                assert(foo() === 'bar');
            });

    });

    it('Should support the use of constants', function() {

        const container = new Container({
            'services': [
                path.resolve(__dirname, 'services')
            ]
        });

        container.constant('settings', {
            'a': 'b'
        });

        return container.load('settings')
            .then((settings) => {
                assert(_.isEqual(settings, { 'a': 'b' }));
            });

    });

    it('Should support loading services by name', function() {

        const container = new Container({
            'services': [
                path.resolve(__dirname, 'services')
            ]
        });

        container.service('parachute', require('./misc/parachute'));

        return container.load('parachute')
            .then((parachute) => {
                assert(parachute.name === 'Parachute');
            });

    });

    it('Should support defining services directly via object', function() {

        const container = new Container({
            'services': [
                path.resolve(__dirname, 'services')
            ]
        });

        container.service('parachute', {
            '@service': function(foo) {

                class Parachute {

                    foo() {
                        return foo();
                    }

                }

                return Parachute;

            },
            '@singleton': true,
            '@require': ['foo']
        });

        return container.load('parachute')
            .then((Parachute) => {
                assert(Parachute.name === 'Parachute');
                const parachute = new Parachute();
                assert(parachute.foo() === 'bar');
            });

    });

    it('Should support dynamic fetching', function() {

        const container = new Container({
            'id': 'container',
            'extendRequire': true,
            'services': [
                path.resolve(__dirname, 'services')
            ]
        });

        return container.load('foo')
            .then((foo) => {
                assert(foo() === 'bar');
                const bar = require('container/bar');
                assert(bar() === 'bar');
            });

    });

    it('Should support forced loading of services', function() {

        const container = new Container({
            'id': 'container2',
            'extendRequire': true,
            'services': [
                path.resolve(__dirname, 'services')
            ],
            'load': ['herp']
        });

        return container.load('foo')
            .then((foo) => {
                assert(foo() === 'bar');
                const herp = require('container2/herp');
                assert(herp() === 'derp');
            });

    });

});
