'use strict';

// External Modules
import Joi from '@hapi/joi';

// Internal Modules
import { RestServerError } from './';

// Types
import { Config, ValidatedConfig } from './';

// Constants
const RESOURCE_METHOD_SCHEMA =
{
	name: Joi.valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').optional(),
	schema: Joi.alternatives(Joi.object(), (Joi.object() as any).schema(), Joi.func()).optional(),
	pluck: Joi.alternatives(Joi.object(), Joi.array()).optional(),
	jsonContentTypes: Joi.array().items(Joi.string()).min(1).optional(),
	bodyParserOptions: Joi.object().optional(),
	authenticate: Joi.alternatives
		(
			Joi.boolean(),
			Joi.valid('bearer', 'bearer-optional')
		)
		.optional(),
	exposeRawBody: Joi.boolean().default(false).optional(),
	exposeTextBody: Joi.boolean().default(false).optional(),
	json: Joi.boolean().default(false).optional(),
	handler: Joi.func().required()
};
const RESOURCE_SCHEMA_RETRIEVE = Joi
	.alternatives
	(
		Joi.func(),
		Joi
			.object
			(
				{
					method: Joi.func().required(),
					parameter: Joi.boolean().optional(),
					optional: Joi.boolean().optional()
				}
			)
	)
	.optional();
const RESOURCE_SCHEMA =
{
	name: Joi.string().optional(),
	retrieve: RESOURCE_SCHEMA_RETRIEVE,
	pre: Joi.func().optional(),
	methods: Joi.object().pattern(/(?:GET|POST|PUT|PATCH|DELETE)/, RESOURCE_METHOD_SCHEMA).default({}).optional(),
	resources: Joi.object().pattern(/.+/, Joi.link('...')).default({}).optional()
};
const AUTHENTICATION_SCHEMA =
{
	callback: Joi.func().required(),
	helper: Joi.valid('bearer', 'bearer-optional').optional()
};
const DEBUG_DEFAULT =
{
	paths: false,
	handleError: Joi.func().optional()
};
const DEBUG_SCHEMA = Joi.object
	(
		{
			paths: Joi.boolean().optional()
		}
	)
	.default(DEBUG_DEFAULT)
	.optional();
const SCHEMA = Joi
	.object
	(
		{
			port: Joi.number().required(),
			resources: Joi.object().pattern(/.+/, RESOURCE_SCHEMA).default({}).optional(),
			pre: Joi.func().optional(),
			authenticate: Joi.alternatives(Joi.func(), AUTHENTICATION_SCHEMA).optional(),
			validate: Joi.func().required(),
			pluck: Joi.func().optional(),
			root: Joi.string().default('/').optional(),
			debug: DEBUG_SCHEMA
		}
	);
const SCHEMA_OPTIONS: Joi.ValidationOptions =
{
	convert: false,
	presence: 'required'
};

export function validateConfig(config: Config)
{
	const validated = SCHEMA.validate(config, SCHEMA_OPTIONS);
	if (validated.error)
	{
		throw new RestServerError(validated.error.message);
	};
	const parsed: ValidatedConfig = validated.value;
	return parsed;
};