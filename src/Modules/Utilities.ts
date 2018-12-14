'use strict';

// Types
import { Response as ExpressResponse } from 'express';
import { ApiError, UnexpectedError } from 'src/Modules/Errors';

/** Handles the given resource error. */
export function handleResourceError(parameters: {response: ExpressResponse, apiError?: ApiError, error?: Error, status?: number})
{
    const { response } = parameters;
	if (parameters.error) console.log(parameters.error);
    if (response.headersSent) return;
	const apiError = parameters.apiError || UnexpectedError.generate();
	const status = parameters.status ? parameters.status : apiError.status;
	const transportableError = apiError.toTransport();
	response.status(status).json(transportableError);
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