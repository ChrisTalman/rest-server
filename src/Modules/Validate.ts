'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { InvalidBody } from 'src/Modules/Errors';

// Types
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';

// Constants
const JOI_VALIDATE_OPTIONS: Joi.ValidationOptions =
{
	presence: 'required'
};

export default function(schema: object, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction)
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
				handleResourceError({response, apiError: InvalidBody.generate(error.message)});
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
		handleResourceError({response, apiError: InvalidBody.generate('Not of type object.')});
		return;
	};
	const validated = Joi.validate(body, schema, JOI_VALIDATE_OPTIONS);
	if (validated.error)
	{
		handleResourceError({response, apiError: InvalidBody.generate(validated.error.message)});
		return;
	};
	response.locals.parameters = validated.value;
	next();
};