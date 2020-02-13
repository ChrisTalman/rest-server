'use strict';

// External Modules
import * as Express from 'express';

// Intenral Modules
import { handleResourceError } from 'src/Modules/Utilities';

// Types
import { IRoute as ExpressRoute } from 'express';
import { ExpressRequest, ExpressResponse, ResourceMethod } from 'src/Modules';
export type PluckCallback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => object;

export function initialiseResourceMethodPluck(methodIdentifier: string, method: ResourceMethod, route: ExpressRoute)
{
	if (method.pluck === undefined) return;
	route[methodIdentifier]((request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction) => handlePluck(method, request, response, next));
};

function handlePluck(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction)
{
	try
	{
		executePluck(method, request, response, next);
	}
	catch (error)
	{
		handleResourceError({response, error});
		return;
	};
};

function executePluck(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction)
{
	if (method.pluck === undefined) throw new Error('Pluck undefined in resource method');
	if (request.app.locals.config.pluck === undefined) throw new Error('Pluck was specified for resource method, but global pluck callback unspecified');
	response.locals.pluck = request.app.locals.config.pluck({method, request, response});
	next();
};