'use strict';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { NotFoundError } from 'src/Modules/Errors';

// Types
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceRetrieveValue } from 'src/Modules';
import { TransformedResource, ResourcesArray, ResourceRetrieveMethod } from './';

export async function handleResourceMethodParameter({resourceAncestors, request, response, next}: {resourceAncestors: ResourcesArray, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction})
{
	const results: Array <true | undefined> = [];
	for (let resource of resourceAncestors)
	{
		const result = await retrieveParameter({resource: resource as TransformedResource, request, response});
		results.push(result);
	};
	const success = results.every(result => result === true);
	if (!success) return;
	next();
};

/**
	If resource is a parameter, attempts to retrieve its data and expose in `response.locals`.
	Returns `true` if it succeeds, or resource is not a parameter. Otherwise, returns `undefined`.
*/
async function retrieveParameter({resource, request, response}: {resource: TransformedResource, request: ExpressRequest, response: ExpressResponse})
{
	if (!isParameter({resource})) return true;
	let method: ResourceRetrieveMethod;
	let optional = false;
	if (typeof resource.retrieve === 'function')
	{
		method = resource.retrieve;
	}
	else if (typeof resource.retrieve === 'object')
	{
		method = resource.retrieve.method;
		if (typeof resource.retrieve.optional === 'boolean')
		{
			optional = resource.retrieve.optional;
		};
	}
	else
	{
		handleResourceError({response, error: new Error(`Unexpected type of retrieve() property for '${request.path}': ${resource.retrieve}`)});
		return;
	};
	let data: ResourceRetrieveValue;
	try
	{
		data = await method({request, response});
	}
	catch (error)
	{
		handleResourceError({response, error});
		return;
	};
	if (data === undefined)
	{
		handleResourceError({response, error: new Error(`Expected non-undefined value from retrieve() for '${request.path}'`)});
		return;
	};
	if (data === false)
	{
		handleResourceError({response});
		return;
	};
	if (!data && !optional)
	{
		handleResourceError({response, apiError: new NotFoundError(resource)});
		return;
	};
	augmentLocals(resource, response, data);
	return true;
};

function augmentLocals(resource: TransformedResource, response: ExpressResponse, data: object)
{
	const resourceData = response.locals.resourceData || {};
	resourceData[resource.name] = data;
	response.locals.resourceData = resourceData;
};

function isParameter({resource}: {resource: TransformedResource})
{
	const is = typeof resource.retrieve === 'function' || typeof resource.retrieve === 'object';
	return is;
};