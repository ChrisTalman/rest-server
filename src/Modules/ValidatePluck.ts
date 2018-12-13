'use strict';

// To Do: Prevent parsing the body twice, as both this method and the other validate method currently parse it.
// To Do: It may be useful, in order to prevent abuse, to in some way limit the size of a pluck to a realistic length.

// External Modules
import Joi from 'joi';

// Internal Modules
import * as ServerUtilities from 'src/Modules/Server/Utilities';
import * as ServerErrors from 'src/Modules/Server/Errors';
import isSubset from 'src/Modules/Utilities/IsSubset';

// Types
import { ExpressRequestGeneric, ExpressResponseAugmented, ExpressNextFunction } from 'src/Types';
import { ResourceMethod, Pluck } from './';
interface Body
{
	pluck?: object;
};

// Constants
const SOURCE_STRING_LENGTH_MAX = 1000;
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

export default function(method: ResourceMethod, request: ExpressRequestGeneric, response: ExpressResponseAugmented, next: ExpressNextFunction)
{
	const bodyProvided = request.query.hasOwnProperty('body');
	if (!bodyProvided)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.PluckRequired.generate()});
		return;
	};
	let body: Body;
	try
	{
		body = JSON.parse(request.query.body);
	}
	catch (error)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.PluckParse.generate()});
		return;
	};
	const pluckProvided =  body.hasOwnProperty('pluck');
	if (method.pluck && !pluckProvided)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.PluckRequired.generate()});
		return;
	};
	const validated = Joi.validate(body.pluck, SCHEMA);
	if (validated.error)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.PluckInvalid.generate(validated.error.message)});
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