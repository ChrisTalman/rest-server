'use strict';

// To Do: Prevent parsing the body twice, as both this method and the other validate method currently parse it.
// To Do: It may be useful, in order to prevent abuse, to in some way limit the size of a pluck to a realistic length.

// External Modules
import Joi from 'joi';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { PluckRequired, PluckParse, PluckInvalid } from 'src/Modules/Errors';

// Types
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceMethod } from './';
interface Body
{
	pluck?: object;
};

// Constants
const SCHEMA = Joi.alternatives
	(
		Joi
			.object()
			.pattern
			(
				/.+/,
				Joi.alternatives
				(
					Joi.boolean(),
					Joi.lazy(() => SCHEMA)
				)
			),
		Joi
			.array()
			.items
			(
				Joi.alternatives
				(
					Joi.string(),
					Joi.lazy(() => SCHEMA)
				)
			)
	);

export default function(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction)
{
	const bodyProvided = request.query.hasOwnProperty('body');
	if (!bodyProvided)
	{
		handleResourceError({response, apiError: PluckRequired.generate()});
		return;
	};
	let body: Body;
	try
	{
		body = JSON.parse(request.query.body);
	}
	catch (error)
	{
		handleResourceError({response, apiError: PluckParse.generate()});
		return;
	};
	const pluckProvided =  body.hasOwnProperty('pluck');
	if (method.pluck && !pluckProvided)
	{
		handleResourceError({response, apiError: PluckRequired.generate()});
		return;
	};
	const validated = Joi.validate(body.pluck, SCHEMA);
	if (validated.error)
	{
		handleResourceError({response, apiError: PluckInvalid.generate(validated.error.message)});
		return;
	};
	const pluck = validated.value;
	// To Do: Respond with error if pluck includes any fields which don't exist for public access.
	response.locals.pluck =
	{
		parsed: pluck,
		rethink: pluck
	};
	next();
};