'use strict';

// To Do: Use async await instead of next() where possible. This could reduce the potential for mistakes, where next() might not be called even though execution has stopped.
// To Do: Allow some degree of user control over when the raw parser is used on different content types. For instance, it was orignally only application/json, but now also includes text/plain, because this was required to handle AWS SES webhook requests, which, due to a bug, use text/plain, when they should use application/json.
// To Do: Use object for resource methods instead of array, so that method name is taken from each key, and duplicates are automatically prevented.
// To Do: Encapsulate every resource handler in a try catch block, so that a response can be given when an unexpected error occurs in code. Currently, if there is an unhandled error in handler code, the requester will never receive a response. This has been partly implemented with handleResourceMethod().
// To Do: Output methods for each resource.
// To Do: Throw exception when resources or methods at the same level share exactly the same name.
// To Do: Provide error objects for every error (some simply return an error status code).

// External Modules
import Express from 'express';
import * as BodyParser from 'body-parser';
import * as HTTP from 'http';
import Cors from 'cors';
import { mirror } from '@chris-talman/isomorphic-utilities';

// Internal Modules
import validateConfig from './ValidateConfig';
import authenticate from './Authenticate';
import { initialiseResourceMethodSchema } from './Schema';
import validatePluck from './ValidatePluck';
import { handleResourceMethodParameter } from './Retrieve';
import { UnexpectedError } from './Errors';
import { NotFound as NotFoundError } from './Errors';
import { resourceMethodUnavailable, jsonInvalid } from './Errors';
export * from './Errors';
import { handleResourceError } from './Utilities';
export * from './Utilities';
import { handleResourceMethodPre } from './Resource/Pre';

// Types
import { Server as HttpServer } from 'http';
import
{
	IRouterHandler as ExpressRouteHandler,
	Application as GenericExpressApplication,
	Router as ExpressRouter,
	IRoute as ExpressRoute,
	Request as GenericExpressRequest,
	Response as GenericExpressResponse,
	NextFunction as ExpressNextFunction
} from 'express';
export interface ExpressRequest extends GenericExpressRequest
{
	app: ExpressApplication;
	rawBody?: Buffer;
	textBody?: string;
	route: ExpressRoute;
};
export interface ExpressResponse extends GenericExpressResponse
{
	app: ExpressApplication;
};
// Resource
export type Resources =
{
	[Name in string]?: Resource <Name>
};
export interface ResourcesArray extends Array<Resource> {};
export interface Resource <GenericName = string>
{
	name?: GenericName;
	/** Method to retrieve resource. Stores resource in locals object. Returns 404 if not found. */
	retrieve?: ResourceRetrieve;
	/** Callback to run before every request handler. */
	pre?: ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<boolean | void>;
	methods?: ResourceMethods;
	resources?: Resources;
};
export interface TransformedResources extends Array<TransformedResource> {};
export interface TransformedResource extends Resource
{
	name: string;
};
// Resource Retrieve
export type ResourceRetrieve = (parameters: RetrieveParameters <any, any>) => Promise<ResourceRetrieveValue>;
export interface RetrieveParameters <GenericRequest extends ExpressRequest, GenericResponse extends ExpressResponse>
{
	request: GenericRequest;
	response: GenericResponse;
};
export type ResourceRetrieveValue = object | false;
// Resource Methods
import { ResourceMethodConfig as ResourceMethodAuthenticate } from './Authenticate';
export type ResourceMethods =
{
	[MethodName in ResourceMethodNameUpperCase]?: ResourceMethod <MethodName>
};
import { Pluck } from './ValidatePluck';
import { JoiSchema } from './Schema';
export interface ResourceMethod <GenericMethodName = ResourceMethodNameUpperCase> extends ResourceMethodAuthenticate
{
	name?: GenericMethodName;
	jsonContentTypes?: Array<string>;
	schema?: JoiSchema;
	pluck?: Pluck;
	exposeRawBody?: boolean;
	exposeTextBody?: boolean;
	handler: ResourceMethodHandler;
};
type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ResourceMethodNameLowerCase = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ResourceMethodHandler = (parameters: ResourceMethodHandlerParameters) => void;
export interface ResourceMethodHandlerParameters <GenericRequest extends ExpressRequest = ExpressRequest, GenericResponse extends ExpressResponse = ExpressResponse>
{
	request: GenericRequest;
	response: GenericResponse;
};
export interface ExpressApplication extends GenericExpressApplication
{
	locals: ExpressApplicationLocals;
};
export interface ExpressApplicationLocals
{
	config: ValidatedConfig;
};
// Config
import { AppConfigVariant as AuthenticationAppConfig } from './Authenticate';
export interface Config
{
	port: number;
	resources: Resources;
	/** Callback to run before every request handler. */
	pre?: ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<void>;
	authentication?: AuthenticationAppConfig;
	root?: string;
	debug?: Debug;
};
export interface Debug
{
	paths?: boolean;
};
export interface ValidatedConfig extends Config
{
	root: string;
};

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
const RESOURCE_NAME_EXPRESSION = /^[\w]$/;

export default class RestServer
{
	public readonly config: ValidatedConfig;
	public readonly app: ExpressApplication;
	public readonly httpServer: HttpServer;
	/** Constructs instance. */
	constructor(rawConfig: Config)
	{
		this.config = validateConfig(rawConfig);
		this.app = Express();
		this.app.locals.config = this.config;
		initialiseExpress(this.app);
		initialiseResources(this.app);
		initialiseErrorHandler(this.app);
		this.httpServer = listenExpressHttp(this.app);
	};
	/** Closes HTTP server socket, preventing new requests. Promise resolves once all active connections have gracefully closed. */
	public stop()
	{
		let resolvePromise: () => void;
		const promise = new Promise<void>(resolve => resolvePromise = resolve);
		this.httpServer.close(() => resolvePromise());
		return promise;
	};
};

/** Initialises the given Express app. */
function initialiseExpress(app: ExpressApplication)
{
	app.use(Cors());
};

/** Initialises callback to handle middleware errors, like SyntaxError thrown by BodyParser.json(). */
function initialiseErrorHandler(app: ExpressApplication)
{
	app.use((error: any, {}: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction) => handleError({error, response, next}));
};

/** If middleware error exists, respond with unexpected error, otherwise invoke next() to proceed to next middleware. */
function handleError({error, response, next}: {error: any, response: ExpressResponse, next: ExpressNextFunction})
{
	if (!error) next();
	handleResourceError({response});
};

/** Registers routes for the given Express app. */
function initialiseResources(app: ExpressApplication)
{
	const router = Express.Router();
	for (let { 0: name, 1: resource } of Object.entries(app.locals.config.resources) as Array<[string, Resource]>)
	{
		initialiseResource({name, resource, router, path: '', resourceAncestors: []});
	};
	app.use(app.locals.config.root, router);
	listenResourceNotFound(app);
};

function initialiseResource({name, resource: rawResource, router, path, resourceAncestors}: {name: string, resource: Resource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray})
{
	if (typeof rawResource.name === 'string' && rawResource.name !== name) throw new ResourceNameMismatch({name, resource: rawResource});
	if (!RESOURCE_NAME_EXPRESSION.test(name[0])) throw new ResourceNameInvalid({name});
	const resource = rawResource as TransformedResource;
	resource.name = name;
	const parameterPrefix = resource.retrieve ? ':' : '';
	path += '/' + parameterPrefix + resource.name;
	resourceAncestors = augmentAncestors({resource, ancestors: resourceAncestors});
	logPath({resource, path, router});
	initialiseResourceMiddleware(resource, router, path, resourceAncestors);
	initialiseSubresources(resource, router, path, resourceAncestors);
};

class ResourceNameInvalid extends Error
{
	constructor({name}: {name: string})
	{
		const message = 'Resource name \'' + name + '\' invalid. Must be of form ' + RESOURCE_NAME_EXPRESSION.toString();
		super(message);
	};
};

class ResourceNameMismatch extends Error
{
	constructor({name, resource}: {name: string, resource: Resource})
	{
		const message = 'Resource name \'' + name + '\' mismatch with resource.name \'' + resource.name + '\'';
		super(message);
	};
};

/** Creates new array, in which existing resources are first added, and then the newest resource at the end. */
function augmentAncestors({resource, ancestors}: {resource: TransformedResource, ancestors: ResourcesArray})
{
	const augmented: ResourcesArray = [];
	augmented.push(... ancestors, resource);
	return augmented;
};

/** Logs path with console.log(), if config enables this functionality. */
function logPath({resource, path, router}: {resource: Resource, path: string, router: ExpressRouter})
{
	if (!router) return;
	const methodEntries = resource.methods && Object.entries(resource.methods) as Array<[ResourceMethodNameUpperCase, ResourceMethod]>;
	const methodsLog = (methodEntries && methodEntries.length > 0) ? ' => ' + methodEntries.map(entry => entry[0]).join(' ') : '';
	const pathLog = path + methodsLog;
	console.log(pathLog);
};

function initialiseResourceMiddleware(resource: TransformedResource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray)
{
	const route = router.route(path);
	initialiseResourceMethods(resource, route, resourceAncestors);
	route.all((request, response) => handleResourceMethodUnavailable({request, response}));
};

function initialiseResourceMethods(resource: Resource, route: ExpressRoute, resourceAncestors: ResourcesArray)
{
	if (!resource.methods) return;
	for (let methodName of Object.keys(resource.methods) as Array<ResourceMethodNameUpperCase>)
	{
		const method = resource.methods[methodName] as ResourceMethod;
		initialiseResourceMethod(methodName, method, route, resourceAncestors);
	};
};

function initialiseResourceMethod(name: ResourceMethodNameUpperCase, method: ResourceMethod, route: ExpressRoute, resourceAncestors: ResourcesArray)
{
	if (typeof method.name === 'string' && method.name !== name) throw new ResourceMethodMismatch({name, method});
	method.name = name;
	const methodIdentifier = method.name.toLowerCase();
	const methodHandler = route[methodIdentifier as ResourceMethodNameLowerCase].bind(route) as ExpressRouteHandler <ExpressRoute>;
	initialiseResourceMethodParser <ExpressRoute> ({methodHandler, method});
	methodHandler((request, response, next) => authenticate({method, request, response, next}));
	initialiseResourceMethodParameter(methodHandler, resourceAncestors);
	initialiseResourceMethodSchema(methodIdentifier, method, route);
	if (method.pluck) methodHandler(validatePluck.bind(null, method));
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
function initialiseResourceMethodParser <ExpressRoute> ({methodHandler, method}: {methodHandler: ExpressRouteHandler <ExpressRoute>, method: ResourceMethod})
{
	methodHandler((request, response, next) => handleResourceMethodRawParse({request, response, next, resourceMethod: method}));
	methodHandler((request, response, next) => handleResourceMethodJsonParse({request, response, next, resourceMethod: method}));
};

/** Run raw parser if method can have body, otherwise invoke next(). */
function handleResourceMethodRawParse({request, response, next, resourceMethod}: {request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction, resourceMethod: ResourceMethod})
{
	if ((BODYLESS_METHODS as Array<string>).includes(request.method))
	{
		next();
		return;
	};
	const type = resourceMethod.jsonContentTypes || RAW_BODY_PARSE_CONTENT_TYPES;
	BodyParser.raw({type})(request, response, next);
};

/** Run JSON parse if method can have body, otherwise invoke next(). */
function handleResourceMethodJsonParse({request, response, next, resourceMethod}: {request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction, resourceMethod: ResourceMethod})
{
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

function initialiseResourceMethodParameter(methodHandler: ExpressRouteHandler <ExpressRoute>, resourceAncestors: ResourcesArray)
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
		handleResourceError({error, response, apiError: new UnexpectedError()});
		return;
	};
};

function handleResourceMethodUnavailable({response}: ResourceMethodHandlerParameters)
{
	handleResourceError({response, apiError: resourceMethodUnavailable});
};

function initialiseSubresources(resource: TransformedResource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray)
{
	if (!resource.resources) return;
	for (let { 0: name, 1: subresource } of (Object.entries(resource.resources) as Array<[string, Resource]>))
	{
		initialiseResource({name, resource: subresource, router, path, resourceAncestors});
	};
};

function listenResourceNotFound(app: ExpressApplication)
{
	app.use((request, response) => handleResourceNotFound({request, response}));
};

function handleResourceNotFound({response}: ResourceMethodHandlerParameters)
{
	// To Do: Provide more specific error to indicate that the structure does not exist, not simply a database entity.
	handleResourceError({response, apiError: new NotFoundError('nonexistent')});
};

/** Creates and initialises a HTTP server for the given Express app. */
function listenExpressHttp(app: ExpressApplication)
{
	const httpServer = new HTTP.Server(app);
	httpServer.listen(app.locals.config.port);
	console.log('Listening on port ' + app.locals.config.port + ' at \'' + app.locals.config.root + '\'.');
	return httpServer;
};

export class RestServerError extends Error
{
	constructor(message: string)
	{
		super(message);
	};
};