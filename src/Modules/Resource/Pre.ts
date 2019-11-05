'use strict';

// Intenral Modules
import { handleResourceError } from 'src/Modules/Utilities';

// Types
import { NextFunction as ExpressNextFunction } from 'express';
import { ExpressRequest, ExpressResponse, ResourcesArray } from 'src/Modules';

export async function handleResourceMethodPre
(
	{resourceAncestors, request, response, next}:
	{resourceAncestors: ResourcesArray, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction}
)
{
	const { pre } = request.app.locals.config;
	if (pre)
	{
		try
		{
			await pre({request, response});
		}
		catch (error)
		{
			console.error(error.stack || error);
			handleResourceError({response});
			return;
		};
	};
	for (let resource of resourceAncestors)
	{
		if (resource.pre)
		{
			const valid = await resource.pre({request, response});
			if (valid === false)
			{
				if (!response.headersSent)
				{
					handleResourceError({response, error: new Error('Resource \'pre\' returned \'false\' but did not respond to request')});
				};
				return;
			};
		};
	};
	next();
};