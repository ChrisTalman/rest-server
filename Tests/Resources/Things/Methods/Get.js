'use strict';

// External Modules
const Joi = require('@hapi/joi');

module.exports =
{
	exposeTextBody: true,
	handler,
	schema:
	{
		who: Joi.string().required()
	},
	pluck:
	[
		'id',
		'name'
	]
};

async function handler({request, response})
{
	console.log('Raw Body:', request.rawBody);
	console.log('Text Body:', request.textBody);
	console.log('JSON Body:', request.body);
	console.log('Parameters:', response.locals.parameters);
	console.log('Pluck:', response.locals.pluck);
	response.json({id: '123', name: 'Bob'});
};