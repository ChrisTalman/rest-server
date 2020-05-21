'use strict';

// External Modules
import * as Express from 'express';
import Joi from '@hapi/joi';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { InvalidBodyError } from 'src/Modules/Errors';
import { ResourceMethod } from 'src/Modules/Resource/Method';

// Types
import { IRoute as ExpressRoute } from 'express';
import { ExpressRequest, ExpressResponse } from 'src/Modules';
export type ValidationCallback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => Promise<Validation>;
export type Validation = ValidationValid | ValidationInvalid;
export interface ValidationValid
{
	valid: true;
	parsed: object;
};
export interface ValidationInvalid
{
	valid: false;
	errorMessage: string;
};

// Constants
const VALIDATION_SCHEMA = Joi
	.alternatives
	(
		{
			valid: true,
			parsed: Joi.object().required()
		},
		{
			valid: false,
			errorMessage: Joi.string().required()
		}
	);

export function initialiseResourceMethodSchema(methodIdentifier: string, method: ResourceMethod, route: ExpressRoute)
{
	if (method.schema === undefined && method.pluck === undefined) return;
	route[methodIdentifier]((request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction) => handleSchema(method, request, response, next));
};

async function handleSchema(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction)
{
	try
	{
		await executeSchema(method, request, response, next);
	}
	catch (error)
	{
		handleResourceError({response, error});
		return;
	};
};

async function executeSchema(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction)
{
	if (method.schema === undefined && method.pluck === undefined) throw new Error('Schema and pluck undefined in resource method');
	if (request.app.locals.config.validate === undefined) throw new Error('Schema was specified for resource method, but global validation callback unspecified');
	if (typeof request.body !== 'object' || request.body === null)
	{
		handleResourceError({response, apiError: new InvalidBodyError('Not of type object')});
		return;
	};
	const validation = await request.app.locals.config.validate({method, request, response});
	try
	{
		await VALIDATION_SCHEMA.validateAsync(validation);
	}
	catch (error)
	{
		if ((Joi as any).isError(error))
		{
			const joiError: Joi.ValidationError = error;
			throw new Error(`Invalid validation object: ${joiError.message}`);
		}
		else throw error;
	};
	if (validation.valid === false)
	{
		handleResourceError({response, apiError: new InvalidBodyError(validation.errorMessage)});
		return;
	};
	response.locals.parameters = validation.parsed;
	next();
};