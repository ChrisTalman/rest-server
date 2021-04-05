'use strict';

// External Modules
import { mirror } from '@chris-talman/isomorphic-utilities';

// Internal Modules
import { handleResourceMethodParameter } from 'src/Modules/Retrieve';
import { authenticate } from 'src/Modules/Authenticate';
import { handleResourceError } from 'src/Modules/Utilities';
import { UnexpectedError, resourceMethodUnavailable, jsonInvalid } from 'src/Modules/Errors';
import { handleResourceMethodPre } from 'src/Modules/Resource/Pre';
import { initialiseResourceMethodSchema } from 'src/Modules/Resource/Method/Schema';
import { initialiseResourceMethodPluck } from 'src/Modules/Resource/Method/Pluck';

// Types
import * as Express from 'express';
import * as BodyParser from 'body-parser';
import { OptionalSome } from '@chris-talman/types-helpers';
import { ResourcesArray } from 'src/Modules';
import { ExpressRequest, ExpressResponse } from 'src/Modules';
export type ResourceMethods =
{
	[MethodName in ResourceMethodNameUpperCase]?: ResourceMethod <MethodName>
};
export type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResourceMethodNameLowerCase = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ResourceMethodHandler = (parameters: ResourceMethodHandlerParameters) => Promise<void> | void;
export interface ResourceMethodHandlerParameters <GenericRequest extends ExpressRequest = ExpressRequest, GenericResponse extends ExpressResponse = ExpressResponse>
{
	request: GenericRequest;
	response: GenericResponse;
};
type ResourceMethodSchemaCallback = ({request, response}: {request: ExpressRequest, response: ExpressResponse}) => object;

// Constants
const BODYLESS_METHOD = mirror
(
	{
		GET: true
	}
);
const BODYLESS_METHODS = Object.values(BODYLESS_METHOD);
const RAW_BODY_PARSE_CONTENT_TYPES =
[
	'application/json',
	'text/plain'
];

export class ResourceMethod
<
	GenericMethodName extends ResourceMethodNameUpperCase = ResourceMethodNameUpperCase,
	GenericPluck extends object | undefined = undefined,
	GenericSchema extends object | ResourceMethodSchemaCallback | undefined = undefined
>
{
	public readonly name: GenericMethodName;
	/**
		true: Authentication required and evaluated by callback
		false: Authentication ignored
		'bearer': Authentication is required in form of RFC 6750 Bearer token
		'bearer-optional': Same as 'bearer', but only evaluated by callback if token is provided in request
	*/
	public readonly authenticate?: boolean | 'bearer' | 'bearer-optional';
	public readonly handler: ResourceMethodHandler;
	public readonly pluck: GenericPluck;
	public readonly schema: GenericSchema;
	public readonly jsonContentTypes?: Array<string>;
	/** Options to pass to `bodyParser.raw()`. */
	public readonly bodyParserOptions?: BodyParser.Options;
	public readonly exposeRawBody?: boolean;
	public readonly exposeTextBody?: boolean;
	/** Determines whether request body should be treated as JSON. Default: true. */
	public readonly json?: boolean;
	constructor
	(
		{name, authenticate, handler, pluck, schema, jsonContentTypes, bodyParserOptions, exposeRawBody, exposeTextBody, json = true}:
			OptionalSome<
				Pick<
					ResourceMethod<GenericMethodName, GenericPluck, GenericSchema>, 'name' | 'authenticate' | 'handler' | 'pluck' | 'schema' | 'jsonContentTypes' | 'bodyParserOptions' | 'exposeRawBody' | 'exposeTextBody' | 'json'
				>,
			'authenticate' | 'pluck' | 'schema' | 'jsonContentTypes' | 'bodyParserOptions' | 'exposeRawBody' | 'exposeTextBody'
			>
	)
	{
		this.name = name;
		this.authenticate = authenticate;
		this.handler = handler;
		this.pluck = pluck as GenericPluck;
		this.schema = schema as GenericSchema;
		this.jsonContentTypes = jsonContentTypes;
		this.bodyParserOptions = bodyParserOptions;
		this.exposeRawBody = exposeRawBody;
		this.exposeTextBody = exposeTextBody;
		this.json = json;
	};
};

export function initialiseResourceMethod(name: ResourceMethodNameUpperCase, method: ResourceMethod, route: Express.IRoute, resourceAncestors: ResourcesArray)
{
	if (typeof method.name === 'string' && method.name !== name)
	{
		throw new ResourceMethodMismatch({name, method});
	};
	const methodIdentifier = method.name.toLowerCase();
	const methodHandler = route[methodIdentifier as ResourceMethodNameLowerCase].bind(route) as Express.IRouterHandler <Express.IRoute>;
	initialiseResourceMethodParser <Express.IRoute> ({methodHandler, method});
	methodHandler((request, response, next) => authenticate({method, request, response, next}));
	initialiseResourceMethodParameter(methodHandler, resourceAncestors);
	initialiseResourceMethodSchema(methodIdentifier, method, route);
	initialiseResourceMethodPluck(methodIdentifier, method, route);
	methodHandler((request, response, next) => handleResourceMethodPre({resourceAncestors, request, response, next}));
	methodHandler((request, response) => handleResourceMethod({request, response, method}));
};

class ResourceMethodMismatch extends Error
{
	constructor({name, method}: {name: string, method: ResourceMethod})
	{
		const message = 'Resource method name \'' + name + '\' mismatch with method.name \'' + method.name + '\'';
		super(message);
	};
};

/** Initialise method handler callbacks to handle parsing for the method. */
function initialiseResourceMethodParser <ExpressRoute> ({methodHandler, method}: {methodHandler: Express.IRouterHandler <ExpressRoute>, method: ResourceMethod})
{
	methodHandler((request, response, next) => handleResourceMethodRawParse({request, response, next, resourceMethod: method}));
	methodHandler((request, response, next) => handleResourceMethodJsonParse({request, response, next, resourceMethod: method}));
};

/** Run raw parser if method can have body, otherwise invoke `next()`. */
function handleResourceMethodRawParse({request, response, next, resourceMethod}: {request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction, resourceMethod: ResourceMethod})
{
	if ((BODYLESS_METHODS as Array<string>).includes(request.method))
	{
		next();
		return;
	};
	const type = resourceMethod.jsonContentTypes || RAW_BODY_PARSE_CONTENT_TYPES;
	const { bodyParserOptions } = resourceMethod;
	BodyParser.raw({type, ... bodyParserOptions})(request, response, next);
};

/** Run JSON parse if method can have body, otherwise invoke `next()`. */
function handleResourceMethodJsonParse({request, response, next, resourceMethod}: {request: ExpressRequest, response: ExpressResponse, next: Express.NextFunction, resourceMethod: ResourceMethod})
{
	if (resourceMethod.json === false)
	{
		next();
		return;
	};
	const rawBody: Buffer = request.body;
	const rawBodyIsEmptyObject = typeof request.body === 'object' && request.body !== null && Object.keys(request.body).length === 0;
	if (rawBodyIsEmptyObject)
	{
		next();
		return;
	};
	let textBody: string;
	if (rawBody)
	{
		textBody = rawBody.toString();
	}
	else
	{
		const isBodylessMethod = (BODYLESS_METHODS as Array<string>).includes(request.method);
		const queryBodyAvailable = 'body' in request.query;
		if (isBodylessMethod && queryBodyAvailable)
		{
			textBody = request.query.body;
		}
		else
		{
			request.body = undefined;
			next();
			return;
		};
	};
	if (textBody === undefined || textBody.length === 0)
	{
		request.body = undefined;
		next();
		return;
	};
	let body: any;
	try
	{
		body = JSON.parse(textBody);
	}
	catch (error)
	{
		handleResourceError({response, apiError: jsonInvalid});
		return;
	};
	if (resourceMethod.exposeRawBody) request.rawBody = rawBody;
	if (resourceMethod.exposeTextBody) request.textBody = textBody;
	request.body = body;
	next();
};

function initialiseResourceMethodParameter(methodHandler: Express.IRouterHandler <Express.IRoute>, resourceAncestors: ResourcesArray)
{
	methodHandler((request, response, next) => handleResourceMethodParameter({resourceAncestors, request, response, next}));
};

/**
	Invokes the resource method handler.
	Any exceptions unhandled by handler code are gracefully handled with an UnexpectedError response.
*/
async function handleResourceMethod({request, response, method}: {request: ExpressRequest, response: ExpressResponse, method: ResourceMethod})
{
	const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
	try
	{
		if (method.handler instanceof AsyncFunction)
		{
			await method.handler({request, response});
		}
		else
		{
			method.handler({request, response});
		};
	}
	catch (error)
	{
		handleResourceError({error, request, response, apiError: new UnexpectedError()});
		return;
	};
};

export function handleResourceMethodUnavailable({response}: ResourceMethodHandlerParameters)
{
	handleResourceError({response, apiError: resourceMethodUnavailable});
};