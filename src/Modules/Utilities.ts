'use strict';

// Internal Modules
import { logError } from 'src/Modules/Utilities';

// Types
import { ExpressResponseGeneric } from 'src/Types';
import { ApiError, UnexpectedError } from 'src/Modules/Server/Errors';

/** Handles the given resource error. */
export function handleResourceError(parameters: {response: ExpressResponseGeneric, apiError?: ApiError, error?: Error, status?: number})
{
    const { response } = parameters;
	if (parameters.error) logError(parameters.error);
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