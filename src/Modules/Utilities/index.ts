'use strict';

// Types
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ApiError, UnexpectedError } from 'src/Modules/Errors';

/** Handles the given resource error. */
export function handleResourceError(parameters: {request?: ExpressRequest, response: ExpressResponse, apiError?: ApiError, error?: Error, status?: number})
{
	const { response } = parameters;
	if (parameters.error)
	{
		console.log(`REST Error:${parameters.request?.route?.path ? ` ${parameters.request.method} ${parameters.request.route.path}` : ''}\n${parameters.error.stack || parameters.error}`);
	};
	if (response.headersSent) return;
	const apiError = parameters.apiError || new UnexpectedError();
	const status = parameters.status ? parameters.status : apiError.status;
	const transportableError = apiError.toTransport();
	response.status(status).json(transportableError);
};

/** Handles resource success. */
export function handleResourceSuccess({response, json}: {response: ExpressResponse, json?: any})
{
	if (response.headersSent) return;
	if (json !== undefined) response.status(200).json(json);
	else response.status(200).send();
};

/** Assigns parameters properties to target object. */
export function assignPropertiesFromParameters ({target, parameters}: {target: object, parameters: object})
{
	const keys = Object.keys(parameters);
	for (let key of keys)
	{
		const value = parameters[key];
		target[key] = value;
	};
};