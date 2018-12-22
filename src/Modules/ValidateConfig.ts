'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import { RestServerError } from './';

// Types
import { Config } from './';

// Constants
const RESOURCE_METHOD_SCHEMA =
{
	name: Joi.valid('GET', 'POST', 'PATCH', 'DELETE').optional(),
	schema: (Joi.object() as any).schema().optional(),
	pluck: Joi.object().optional(),
	authenticate: Joi.valid(Joi.boolean(), 'bearer', 'bearer-optional'),
	handler: Joi.func().required()
};
const RESOURCE_SCHEMA =
{
    name: Joi.string().optional(),
	retrieve: Joi.func().optional(),
	methods: Joi.object().pattern(/(?:GET|POST|PATCH|DELETE)/, RESOURCE_METHOD_SCHEMA).default({}),
	resources: Joi.array().items(Joi.lazy(() => RESOURCE_SCHEMA))
};
const AUTHENTICATE_SCHEMA =
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
const SCHEMA = Joi.object
(
    {
        port: Joi.number().required(),
        resources: Joi.object().pattern(/.+/, RESOURCE_SCHEMA).default({}),
		authenticate: Joi.alternatives(Joi.func(), AUTHENTICATE_SCHEMA).optional(),
		root: Joi.string().default('/'),
		debug: DEBUG_SCHEMA
    }
);

export default function(config: Config)
{
	const valid = Joi.validate(config, SCHEMA);
	if (valid.error) throw new RestServerError(valid.error.message);
	const validated = valid.value;
	return validated;
};