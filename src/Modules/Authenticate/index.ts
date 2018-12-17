'use strict';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { BearerTokenMissing } from 'src/Modules/Errors';
import getBearerToken from './getBearerToken';

// Types
import { NextFunction as ExpressNextFunction } from 'express';
import { ExpressRequest, ExpressResponse, ResourceMethod } from 'src/Modules';
import { ApiError } from 'src/Modules/Errors';
export type AppConfigVariant = Callback | AppConfig;
export interface AppConfig
{
	callback: Callback;
	/**
		'bearer': Authentication is required in form of RFC 6750 Bearer token
		'bearer-optional': Same as 'bearer', but only evaluated by callback if token is provided in request
	*/
	helper?: 'bearer' | 'bearer-optional';
};
export interface ResourceMethodConfig
{
	/**
		true: Authentication required and evaluated by callback
		false: Authentication ignored
		'bearer': Authentication is required in form of RFC 6750 Bearer token
		'bearer-optional': Same as 'bearer', but only evaluated by callback if token is provided in request
	*/
	authenticate?: boolean | 'bearer' | 'bearer-optional';
};
export type Callback = ({method, request, response, bearerToken}: CallbackParameters) => CallbackPromise;
export interface CallbackParameters
{
	method: ResourceMethod;
	request: ExpressRequest;
	response: ExpressResponse;
	bearerToken?: string;
};
export interface CallbackPromise extends Promise <CallbackResult> {};
export type CallbackResult = { data: object } | { ignore: true } | { error: ApiError };

export default async function authenticate({method, request, response, next}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction})
{
	if (!method.authenticate)
	{
		next();
		return;
	};
	const appAuthentication = request.app.locals.config.authenticate;
	if (!appAuthentication) throw new AuthenticateCallbackUnavailableError();
	const appAuthenticationHelper = getAuthenticationHelper({method, request});
	let bearer: string;
	if (appAuthenticationHelper === 'bearer' || appAuthenticationHelper === 'bearer-optional')
	{
		const bearerResult = getBearerToken(request);
		if (typeof bearerResult === 'object')
		{
			if (method.authenticate === 'bearer' || bearerResult.error !== 'unavailable') handleResourceError({response, apiError: BearerTokenMissing.generate()});
			else if (method.authenticate === 'bearer-optional') next();
			return;
		}
		else
		{
			bearer = bearerResult;
		};
	};
	const paramaters: CallbackParameters = { method, request, response };
	if (bearer) paramaters.bearerToken = bearer;
	const callback = typeof appAuthentication === 'function' ? appAuthentication : appAuthentication.callback;
	let result: CallbackResult;
	try
	{
		result = await callback(paramaters);
	}
	catch (error)
	{
		handleResourceError({response, apiError: error instanceof ApiError ? error : undefined});
		return;
	};
	// Respond with error
	if ('error' in result)
	{
		handleResourceError({response, apiError: result.error});
		return;
	};
	// Ignore authentication
	if ('ignore' in result)
	{
		next();
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

function getAuthenticationHelper({method, request}: {method: ResourceMethod, request: ExpressRequest})
{
	if (method.authenticate === 'bearer' || method.authenticate === 'bearer-optional') return method.authenticate;
	const authentication = request.app.locals.config.authenticate;
	if (typeof authentication === 'object' && (authentication.helper === 'bearer' || authentication.helper === 'bearer-optional')) return authentication.helper;
	return;
};