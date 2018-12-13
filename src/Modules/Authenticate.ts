'use strict';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';

// Types
import
{
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction
} from 'express';
import { ResourceMethod } from './';
import { ApiError } from './Errors';
export interface ResourceMethodConfig
{
	callback: Callback;
	/** Authentication is evaluated only if provided in request. */
	optional?: boolean;
};
export type Callback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => CallbackPromise;
export interface CallbackPromise extends Promise <CallbackResult> {};
export type CallbackResult = { data: object } | { error: ApiError };

export default async function authenticate({method, request, response, next}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction})
{
	if (!method.authenticate)
	{
		next();
		return;
	};
	let result: CallbackResult;
	try
	{
		result = await method.authenticate.callback({method, request, response});
	}
	catch (error)
	{
		handleResourceError({response, apiError: error instanceof ApiError ? error : undefined});
		return;
	};
	if ('error' in result)
	{
		handleResourceError({response, apiError: result.error});
		return;
	};
	response.locals.authentication = result.data;
	next();
};