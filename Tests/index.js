'use strict';

// External Modules
const { default: RestServer } = require('../');

// Resources
const things = require ('./Resources/Things');

new RestServer
(
    {
        port: 3000,
        resources:
        {
            things
        },
        debug:
        {
            paths: true
        }
    }
);

setTimeout
(
    () => console.log('Timed out to allow time for dev tools.'),
    4000
);