'use strict';

// External Modules
const Joi = require('@hapi/joi');

// Export
module.exports = { validate };

// Constants
const SCHEMA_OPTIONS =
{
	convert: false,
	presence: 'required'
};
const PLUCK_SCHEMA = Joi.alternatives
	(
		Joi
			.object()
			.pattern
			(
				/.+/,
				Joi.alternatives
				(
					Joi.boolean(),
					Joi.link(Joi.ref('..'))
				)
			),
		Joi
			.array()
			.items
			(
				Joi.alternatives
				(
					Joi.string(),
					Joi.link(Joi.ref('..'))
				)
			)
	);

async function validate({method, request})
{
	let schema = Joi.object(method.schema);
	if (method.pluck)
	{
		schema = schema.keys({pluck: PLUCK_SCHEMA});
	};
	let parsed;
	try
	{
		parsed = await schema.validateAsync(request.body, SCHEMA_OPTIONS);
	}
	catch (error)
	{
		if (Joi.isError(error))
		{
			const validation =
			{
				valid: false,
				errorMessage: error.message
			};
			return validation;
		}
		else throw error;
	};
	const validation =
	{
		valid: true,
		parsed
	};
	return validation;
};