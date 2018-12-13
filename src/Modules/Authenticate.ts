'use strict';

// Internal Modules
import * as RethinkQueries from 'src/Modules/RethinkQueries';
import { handleResourceError } from 'src/Modules/Server/Utilities';
import { invalidAuthorisationHeader, authenticationUserNotFound } from 'src/Modules/Server/Errors';

// Types
import { ExpressRequestGeneric, ExpressResponseAugmented, ExpressNextFunction } from 'src/Types';
import { Token as UserToken } from 'src/Modules/RethinkQueries/User/Tokens';
import { ResourceMethod } from './';

export default async function authenticate({method, request, response, next}: {method: ResourceMethod, request: ExpressRequestGeneric, response: ExpressResponseAugmented, next: ExpressNextFunction})
{
	if (!method.authenticate)
	{
		next();
		return;
	};
	const token = getAuthorizationHeaderToken(request);
	if (!token)
	{
		if (method.authenticate === 'optional')
		{
			response.locals.authentication = null;
			next();
			return;
		}
		else
		{
			handleResourceError({response, apiError: invalidAuthorisationHeader});
			return;
		};
	};
	let userToken: UserToken;
	try
	{
		userToken = await RethinkQueries.User.Tokens.get(token);
	}
	catch (error)
	{
		handleResourceError({error, response});
		return;
	};
	if (!userToken)
	{
		handleResourceError({response, apiError: authenticationUserNotFound});
		return;
	};
	response.locals.authentication = { userId: userToken.userId };
	next();
};

export function getAuthorizationHeaderToken(request: ExpressRequestGeneric)
{
	const header = request.get('Authorization');
	if (!header) return;
	const token = header.split(' ')[1];
	if (!token) return;
	return token;
};