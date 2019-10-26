'use strict';

// External Modules
import Joi from 'joi';

// Internal Modules
import validate from './Validate';

// Types
import { IRoute as ExpressRoute } from 'express';
import { ResourceMethod } from './';
export type JoiSchema = JoiObjectSchema | JoiStandardSchema;
interface JoiObjectSchema extends JoiBaseSchema, Joi.ObjectSchema
{
	_type: 'object';
};
interface JoiStandardSchema extends JoiBaseSchema
{
	_type: 'alternatives' | 'string' | 'number' | 'any';
};
interface JoiBaseSchema
{
	isJoi: boolean;
	_type: 'object' | 'alternatives' | 'string' | 'number' | 'any';
	_inner: JoiBaseSchemaInner;
};
interface JoiBaseSchemaInner
{
	matches: JoiBaseSchemaInnerMatches;
};
interface JoiBaseSchemaInnerMatches extends Array<JoiBaseSchemaInnerMatch> {};
interface JoiBaseSchemaInnerMatch
{
	schema: JoiSchema;
};

export function initialiseResourceMethodSchema(methodIdentifier: string, method: ResourceMethod, route: ExpressRoute)
{
	if (method.schema === undefined) return;
	let schema: Joi.Schema;
	if (method.schema.isJoi && method.schema._type === 'alternatives')
	{
		const alternatives: Array<any> = [];
		for (let match of method.schema._inner.matches)
		{
			if (match.schema._type !== 'object') throw new Error('Schema alternatives must be objects');
			const alternative = extendSchemaWithPluck(match.schema);
			alternatives.push(alternative);
		};
		schema = Joi.alternatives(... alternatives);
	}
	else if (typeof method.schema === 'object' && (!method.schema.isJoi || (method.schema.isJoi && method.schema._type === 'object')))
	{
		const baseSchema = method.schema.isJoi === true && method.schema._type === 'object' ? method.schema : Joi.object(method.schema as any);
		schema = extendSchemaWithPluck(baseSchema);
	}
	else
	{
		throw new Error('Schema type invalid');
	};
	route[methodIdentifier](validate.bind(null, schema));
};

function extendSchemaWithPluck(schema: Joi.ObjectSchema)
{
	schema = schema
			.keys
			(
				{
					pluck: Joi.alternatives
						(
							Joi.object(),
						 	Joi.array()
					 	)
					 	.optional()
				}
			);
	return schema;
};