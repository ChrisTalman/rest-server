'use strict';

// External Modules
const { default: RestServer } = require('../');

// Resources
const things = require ('./Resources/Things');
const aws = require ('./Resources/AWS');

new RestServer
(
    {
        port: 3000,
        pre: ({request}) => console.log('Pre Path:', request.path),
        resources:
        {
            things,
			aws
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