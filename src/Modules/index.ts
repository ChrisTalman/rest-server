'use strict';

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
import Joi from 'joi';

// Internal Modules
import validateConfig from './ValidateConfig';
import authenticate from './Authenticate';
import validate from './Validate';
import validatePluck from './ValidatePluck';
import handleResourceMethodParameter from './Retrieve';
import * as Errors from './Errors';
export * from './Errors';
import { handleResourceError } from './Utilities';
export * from './Utilities';

// Types
import { Server as HttpServer } from 'http';
import
{
	IRouterHandler as ExpressRouteHandler,
	Application as GenericExpressApplication,
	Router as ExpressRouter,
	IRoute as ExpressRoute,
	Request as GenericExpressRequest,
	Response as GenericExpressResponse
} from 'express';
export interface ExpressRequest extends GenericExpressRequest
{
	app: ExpressApplication;
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
	methods?: ResourceMethods;
	resources?: Resources;
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
export interface ResourceMethod <GenericMethodName = ResourceMethodNameUpperCase> extends ResourceMethodAuthenticate
{
	name?: GenericMethodName;
	schema?: Schema;
	pluck?: Pluck.Variant;
	handler: ResourceMethodHandler;
};
type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type ResourceMethodNameLowerCase = 'get' | 'post' | 'patch' | 'delete';
export type ResourceMethodHandler = (parameters: ResourceMethodHandlerParameters) => void;
export interface ResourceMethodHandlerParameters <GenericRequest extends ExpressRequest = ExpressRequest, GenericResponse extends ExpressResponse = ExpressResponse>
{
	request: GenericRequest;
	response: GenericResponse;
};
export interface Schema
{
	[key: string]: any;
};
export namespace Pluck
{
	export type Variant = Array<string | Object> | Object;
	export interface Object
	{
		[field: string]: Variant | boolean;
	};
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
	app.use(BodyParser.json());
	app.use(Cors());
};

/** Registers routes for the given Express app. */
function initialiseResources(app: ExpressApplication)
{
	const router = Express.Router();
	for (let resource of Object.entries(app.locals.config.resources))
	{
		initialiseResource({name: resource[0], resource: resource[1], router, path: '', resourceAncestors: []});
	};
	app.use(app.locals.config.root, router);
	listenResourceNotFound(app);
};

function initialiseResource({name, resource, router, path, resourceAncestors}: {name: string, resource: Resource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray})
{
	if (typeof resource.name === 'string' && resource.name !== name) throw new ResourceNameMismatch({name, resource});
	resource.name = name;
	path += '/' + resource.name;
	resourceAncestors = augmentAncestors({resource, ancestors: resourceAncestors});
	logPath({resource, path, router});
	initialiseResourceMiddleware(resource, router, path, resourceAncestors);
	initialiseSubresources(resource, router, path, resourceAncestors);
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
function augmentAncestors({resource, ancestors}: {resource: Resource, ancestors: ResourcesArray})
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

function initialiseResourceMiddleware(resource: Resource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray)
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
		const method = resource.methods[methodName];
		initialiseResourceMethod(methodName, method, route, resourceAncestors);
	};
};

function initialiseResourceMethod(name: ResourceMethodNameUpperCase, method: ResourceMethod, route: ExpressRoute, resourceAncestors: ResourcesArray)
{
	if (typeof method.name === 'string' && method.name !== name) throw new ResourceMethodMismatch({name, method});
	method.name = name;
	const methodIdentifier = method.name.toLowerCase();
	const methodHandler = route[methodIdentifier as ResourceMethodNameLowerCase].bind(route) as ExpressRouteHandler <ExpressRoute>;
	methodHandler((request, response, next) => authenticate({method, request, response, next}));
	initialiseResourceMethodParameter(methodHandler, resourceAncestors);
	initialiseMethodSchema(methodIdentifier, method, route);
	if (method.pluck) methodHandler(validatePluck.bind(null, method));
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
		handleResourceError({error, response, apiError: Errors.UnexpectedError.generate()});
		return;
	};
};

function initialiseMethodSchema(methodIdentifier: string, method: ResourceMethod, route: ExpressRoute)
{
	if (!method.schema)
	{
		return;
	};
	// To Do: The Joi object might need to be validated to be a Joi object. Otherwise, it could be an Alternatives object, which would cause an exception later.
	const baseSchema = method.schema.isJoi === true ? (method.schema as Joi.ObjectSchema) : Joi.object(method.schema);
	const schema = baseSchema
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
	route[methodIdentifier](validate.bind(null, schema));
};

function handleResourceMethodUnavailable({response}: ResourceMethodHandlerParameters)
{
	response.sendStatus(405);
};

function initialiseSubresources(resource: Resource, router: ExpressRouter, path: string, resourceAncestors: ResourcesArray)
{
	if (!resource.resources)
	{
		return;
	};
	for (let subresource of Object.entries(resource.resources))
	{
		initialiseResource({name: subresource[0], resource: subresource[1], router, path, resourceAncestors});
	};
};

function listenResourceNotFound(app: ExpressApplication)
{
	app.use((request, response) => handleResourceNotFound({request, response}));
};

function handleResourceNotFound({response}: ResourceMethodHandlerParameters)
{
	response.status(404).json(Errors.NotFound.generate('nonexistent')); // To Do: Provide more specific error to indicate that the structure does not exist, not simply a database entity.
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