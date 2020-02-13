'use strict';

// External Modules
const { default: RestServer } = require('../');

// Internal Modules
const { validate } = require('./Validate');
const { pluck } = require('./Pluck');

// Resources
const things = require ('./Resources/Things');
const aws = require ('./Resources/AWS');

new RestServer
(
    {
        port: 3000,
        pre: ({request}) => console.log('Pre Parametised Path:', request.path),
        validate,
        pluck,
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