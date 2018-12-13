'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import * as ServerUtilities from 'src/Modules/Server/Utilities';
import * as ServerErrors from 'src/Modules/Server/Errors';

// Types
import { ExpressRequestGeneric, ExpressResponseAugmented, ExpressNextFunction } from 'src/Types';

// Constants
const JOI_VALIDATE_OPTIONS: Joi.ValidationOptions =
{
	presence: 'required'
};

export default function(schema: object, request: ExpressRequestGeneric, response: ExpressResponseAugmented, next: ExpressNextFunction)
{
	let body: object = request.body;
	if (request.method === 'GET')
	{
		if (request.query.hasOwnProperty('body'))
		{
			try
			{
				body = JSON.parse(request.query.body);
			}
			catch (error)
			{
				ServerUtilities.handleResourceError({response, apiError: ServerErrors.InvalidBody.generate(error.message), status: 400});
				return;
			};
		}
		else
		{
			body = {};
		};
	};
	if (typeof body !== 'object' || body === null)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.InvalidBody.generate('Not of type object.'), status: 400});
		return;
	};
	const validated = Joi.validate(body, schema, JOI_VALIDATE_OPTIONS);
	if (validated.error)
	{
		ServerUtilities.handleResourceError({response, apiError: ServerErrors.InvalidBody.generate(validated.error.message), status: 400});
		return;
	};
	response.locals.parameters = validated.value;
	next();
};