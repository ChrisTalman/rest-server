'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { InvalidBody } from 'src/Modules/Errors';

// Types
import { Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ExpressRequest } from './';

// Constants
const JOI_VALIDATE_OPTIONS: Joi.ValidationOptions =
{
	presence: 'required'
};

export function validate(schema: object, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction)
{
	if (typeof request.body !== 'object' || request.body === null)
	{
		handleResourceError({response, apiError: new InvalidBody('Not of type object.')});
		return;
	};
	const validated = Joi.validate(request.body, schema, JOI_VALIDATE_OPTIONS);
	if (validated.error)
	{
		handleResourceError({response, apiError: new InvalidBody(validated.error.message)});
		return;
	};
	response.locals.parameters = validated.value;
	next();
};