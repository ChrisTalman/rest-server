'use strict';

// To Do: Prevent parsing the body twice, as both this method and the other validate method currently parse it.
// To Do: It may be useful, in order to prevent abuse, to in some way limit the size of a pluck to a realistic length.

// External Modules
import Joi from 'joi';

// Internal Modules
import { handleResourceError } from 'src/Modules/Utilities';
import { PluckRequired, PluckParse, PluckInvalid } from 'src/Modules/Errors';

// Types
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceMethod } from './';
interface Body
{
	pluck?: Pluck;
};
export type Pluck = string | ArrayPluck | ObjectPluck;
interface ArrayPluck extends Array<Pluck> {};
interface ObjectPluck
{
	[key: string]: string | true | ArrayPluck | ObjectPluck;
};

// Constants
const SCHEMA = Joi.alternatives
	(
		Joi
			.object()
			.pattern
			(
				/.+/,
				Joi.alternatives
				(
					Joi.boolean(),
					Joi.lazy(() => SCHEMA)
				)
			),
		Joi
			.array()
			.items
			(
				Joi.alternatives
				(
					Joi.string(),
					Joi.lazy(() => SCHEMA)
				)
			)
	);

export default function(method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction)
{
	const bodyProvided = request.query.hasOwnProperty('body');
	if (!bodyProvided)
	{
		handleResourceError({response, apiError: PluckRequired.generate()});
		return;
	};
	let body: Body;
	try
	{
		body = JSON.parse(request.query.body);
	}
	catch (error)
	{
		handleResourceError({response, apiError: PluckParse.generate()});
		return;
	};
	if (method.pluck && body.pluck === undefined)
	{
		handleResourceError({response, apiError: PluckRequired.generate()});
		return;
	};
	if (body.pluck === undefined)
	{
		next();
		return;
	};
	const validated = Joi.validate(body.pluck, SCHEMA);
	if (validated.error)
	{
		handleResourceError({response, apiError: PluckInvalid.generate(validated.error.message)});
		return;
	};
	const pluck = validated.value;
	// To Do: Respond with error if pluck includes any fields which don't exist for public access.
	response.locals.pluck =
	{
		parsed: pluck,
		rethink: pluck,
		object: objectifyPluck(pluck)
	};
	next();
};

/** Returns given pluck in object form, whether it is already in that form or not. */
function objectifyPluck(pluck: Pluck)
{
	const object: Pluck = {};
	if (typeof pluck === 'string')
	{
		object[pluck] = true;
	}
	else if (Array.isArray(pluck))
	{
		for (let field of pluck)
		{
			if (typeof field === 'string')
			{
				object[field] = true;
			}
			else
			{
				Object.assign(object, objectifyPluck(field));
			};
		};
	}
	else
	{
		for (let { 0: field, 1: value } of Object.entries(pluck))
		{
			if (typeof value === 'string' || value === true)
			{
				object[field] = value;
			}
			else
			{
				Object.assign(object, objectifyPluck(value));
			};
		};
	};
	return object;
};