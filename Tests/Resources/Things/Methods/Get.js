'use strict';

// External Modules
const Joi = require('joi');

module.exports =
{
    exposeTextBody: true,
    handler,
    schema:
    {
        who: Joi.string().required()
    }
};

async function handler({request, response})
{
    console.log('Raw Body:', request.rawBody);
    console.log('Text Body:', request.textBody);
    console.log('JSON Body:', request.body);
    console.log('Parameters:', response.locals.parameters);
	response.sendStatus(501);
};