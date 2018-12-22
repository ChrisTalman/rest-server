'use strict';

// External Modules
const { default: restServer } = require('../');

// Resources
const things = require ('./Resources/Things');


setTimeout
(
    () => restServer
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
    ),
    4000
);