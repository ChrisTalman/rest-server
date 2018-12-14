'use strict';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { NotFound } from 'src/Modules/Errors';

// Types
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceRetrieveValue } from 'src/Modules';
import { Resource, Resources } from './';

export default async function({resourceAncestors, request, response, next}: {resourceAncestors: Resources, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction})
{
	const promises = resourceAncestors.map(resource => retrieveParameter({resource, request, response}));
	const results = await Promise.all(promises);
	const success = results.every(result => result === true);
	if (!success) return;
	next();
};

/**
	If resource is a parameter, attempts to retrieve its data and expose in response.locals object.
	Returns true if it succeeds, or resource is not a parameter. Otherwise, returns undefined.
*/
async function retrieveParameter({resource, request, response}: {resource: Resource, request: ExpressRequest, response: ExpressResponse})
{
	if (!isParameter({resource})) return true;
	let data: ResourceRetrieveValue;
	try
	{
		data = await resource.retrieve({request, response});
	}
	catch (error)
	{
		handleResourceError({response, error});
		return;
	};
	if (data === undefined)
	{
		return;
	};
	if (data === false)
	{
		handleResourceError({response});
		return;
	};
	if (!data)
	{
		handleResourceError({response, apiError: NotFound.generate(resource)});
		return;
	};
	augmentLocals(resource, response, data);
	return true;
};

function augmentLocals(resource: Resource, response: ExpressResponse, data: object)
{
	const resourceNameWithoutColon = resource.name.substring(1);
	const resourceData = response.locals.resourceData || {};
	resourceData[resourceNameWithoutColon] = data;
	response.locals.resourceData = resourceData;
};

function isParameter({resource}: {resource: Resource})
{
	const is = resource.name[0] === ':' && 'retrieve' in resource;
	return is;
};