'use strict';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';

// Types
import { NextFunction as ExpressNextFunction } from 'express';
import { ExpressRequest, ExpressResponse } from 'src/Modules';
import { ResourceMethod } from './';
import { ApiError } from './Errors';
export interface ResourceMethodConfig
{
	/**
		true: Authentication required and evaluated
		false: Authentication ignored
		'optional': Authentication is evaluated only if provided in request
	*/
	authenticate?: boolean | 'optional';
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
	if (!request.app.locals.config.authenticate) throw new AuthenticateCallbackUnavailableError();
	let result: CallbackResult;
	try
	{
		result = await request.app.locals.config.authenticate({method, request, response});
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

export class AuthenticateCallbackUnavailableError extends Error
{
	constructor()
	{
		const message = 'Resource method sought authentication, but no authentication callback is available.';
		super(message);
	};
};