'use strict';

// External Modules
const Joi = require('@hapi/joi');

module.exports =
{
	exposeTextBody: true,
	handler,
	schema:
	{
		hi: Joi.boolean().required()
	}
};

async function handler({request, response})
{
	console.log('Raw Body:', request.rawBody);
	console.log('Text Body:', request.textBody);
	console.log('JSON Body:', request.body);
	response.sendStatus(200);
};