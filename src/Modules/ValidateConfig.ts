'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import { RestServerError } from './';

// Types
import { Config, ValidatedConfig } from './';

// Constants
const PLUCK_SCHEMA = Joi
	.alternatives
	(
		Joi.array().items(Joi.string(), Joi.lazy(() => PLUCK_SCHEMA)),
		Joi.object().pattern(/.+/, Joi.alternatives(Joi.boolean(), Joi.lazy(() => PLUCK_SCHEMA)))
	);
const RESOURCE_METHOD_SCHEMA =
{
	name: Joi.valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').optional(),
	schema: Joi.alternatives(Joi.object(), (Joi.object() as any).schema()).optional(),
	pluck: PLUCK_SCHEMA.optional(),
	jsonContentTypes: Joi.array().items(Joi.string()).min(1).optional(),
	authenticate: Joi.alternatives
		(
			Joi.boolean(),
			Joi.valid('bearer', 'bearer-optional')
		),
	exposeRawBody: Joi.boolean().default(false),
	exposeTextBody: Joi.boolean().default(false),
	handler: Joi.func().required()
};
const RESOURCE_SCHEMA =
{
	name: Joi.string().optional(),
	retrieve: Joi.func().optional(),
	pre: Joi.func().optional(),
	methods: Joi.object().pattern(/(?:GET|POST|PUT|PATCH|DELETE)/, RESOURCE_METHOD_SCHEMA).default({}),
	resources: Joi.object().pattern(/.+/, Joi.lazy(() => Joi.object(RESOURCE_SCHEMA))).default({})
};
const AUTHENTICATION_SCHEMA =
{
	callback: Joi.func().required(),
	helper: Joi.valid('bearer', 'bearer-optional').optional()
};
const DEBUG_DEFAULT =
{
	paths: false
};
const DEBUG_SCHEMA = Joi.object
	(
		{
			paths: Joi.boolean().optional()
		}
	)
	.default(DEBUG_DEFAULT);
const SCHEMA =
{
	port: Joi.number().required(),
	resources: Joi.object().pattern(/.+/, RESOURCE_SCHEMA).default({}),
	pre: Joi.func().optional(),
	authentication: Joi.alternatives(Joi.func(), AUTHENTICATION_SCHEMA).optional(),
	root: Joi.string().default('/'),
	debug: DEBUG_SCHEMA
};

export default function(config: Config)
{
	const valid = Joi.validate(config, SCHEMA);
	if (valid.error) throw new RestServerError(valid.error.message);
	const validated = valid.value as ValidatedConfig;
	return validated;
};