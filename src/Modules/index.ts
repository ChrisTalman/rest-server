'use strict';

// To Do: Use async await instead of next() where possible. This could reduce the potential for mistakes, where next() might not be called even though execution has stopped.
// To Do: Allow some degree of user control over when the raw parser is used on different content types. For instance, it was orignally only application/json, but now also includes text/plain, because this was required to handle AWS SES webhook requests, which, due to a bug, use text/plain, when they should use application/json.
// To Do: Use object for resource methods instead of array, so that method name is taken from each key, and duplicates are automatically prevented.
// To Do: Encapsulate every resource handler in a try catch block, so that a response can be given when an unexpected error occurs in code. Currently, if there is an unhandled error in handler code, the requester will never receive a response. This has been partly implemented with handleResourceMethod().
// To Do: Output methods for each resource.
// To Do: Throw exception when resources or methods at the same level share exactly the same name.
// To Do: Provide error objects for every error (some simply return an error status code).

// External Modules
import * as HTTP from 'http';
import Cors from 'cors';

// Internal Modules
import { validateConfig } from './ValidateConfig';
import { NotFoundError } from './Errors';
import { handleResourceError } from './Utilities';
import { initialiseResourceMethod, handleResourceMethodUnavailable } from './Resource/Method';

// Types
import { Server as HttpServer } from 'http';
import * as Express from 'express';
import { AppConfigVariant as AuthenticationAppConfig } from './Authenticate';
import { ResourceMethod, ResourceMethods, ResourceMethodHandlerParameters, ResourceMethodNameUpperCase } from './Resource/Method';
import { ValidationCallback } from './Resource/Method/Schema';
import { PluckCallback } from './Resource/Method/Pluck';
export interface ExpressRequest extends Express.Request
{
	app: ExpressApplication;
	rawBody?: Buffer;
	textBody?: string;
	route: Express.IRoute;
};
export interface ExpressResponse extends Express.Response
{
	app: ExpressApplication;
	locals: ExpressResponseLocals;
};
export interface ExpressResponseLocals
{
	authentication?: object;
	pluck?: object;
	parameters?: object;
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
export type ResourceRetrieve = ResourceRetrieveMethod | ResourceRetrieveOptions;
export interface ResourceRetrieveOptions
{
	method: ResourceRetrieveMethod;
	/** Determine whether resource is treated as a parameter or a fixed name. */
	parameter?: boolean;
	/** Determine whether to respond with an error if the resource cannot be found. */
	optional?: boolean;
}
export type ResourceRetrieveMethod = (parameters: RetrieveParameters <any, any>) => Promise<ResourceRetrieveValue>;
export interface RetrieveParameters <GenericRequest extends ExpressRequest, GenericResponse extends ExpressResponse>
{
	request: GenericRequest;
	response: GenericResponse;
};
export type ResourceRetrieveValue = object | false;
// Resource Methods
export interface ExpressApplication extends Express.Application
{
	locals: ExpressApplicationLocals;
};
export interface ExpressApplicationLocals
{
	config: ValidatedConfig;
};
// Config
export interface Config
{
	port: number;
	resources: Resources;
	/** Callback to run before every request handler. */
	pre?: ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<void>;
	authenticate?: AuthenticationAppConfig;
	/** Evaluates whether request body is valid for resource method, and returns parsed body if valid. */
	validate: ValidationCallback;
	/** Generates pluck value to be assigned to `response.locals.pluck` for each request. */
	pluck?: PluckCallback;
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
const RESOURCE_NAME_EXPRESSION = /^[\w]$/;

// Exports
export { ResourceMethod } from 'src/Modules/Resource/Method';
export * from './Errors';
export * from './Utilities';

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
	app.use((error: any, {}: ExpressRequest, response: ExpressResponse, next: Express.NextFunction) => handleError({error, response, next}));
};

/** If middleware error exists, respond with unexpected error, otherwise invoke next() to proceed to next middleware. */
function handleError({error, response, next}: {error: any, response: ExpressResponse, next: Express.NextFunction})
{
	if (!error) next();
	handleResourceError({response, error});
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

function initialiseResource({name, resource: rawResource, router, path, resourceAncestors}: {name: string, resource: Resource, router: Express.Router, path: string, resourceAncestors: ResourcesArray})
{
	if (typeof rawResource.name === 'string' && rawResource.name !== name) throw new ResourceNameMismatch({name, resource: rawResource});
	if (!RESOURCE_NAME_EXPRESSION.test(name[0])) throw new ResourceNameInvalid({name});
	const resource = rawResource as TransformedResource;
	resource.name = name;
	const parameterPrefix = generateResourceParameterPrefix(resource);
	path += '/' + parameterPrefix + resource.name;
	resourceAncestors = augmentAncestors({resource, ancestors: resourceAncestors});
	logPath({resource, path, router});
	initialiseResourceMiddleware(resource, router, path, resourceAncestors);
	initialiseSubresources(resource, router, path, resourceAncestors);
};

function generateResourceParameterPrefix(resource: Resource)
{
	let prefix = '';
	if (typeof resource.retrieve === 'function' || (typeof resource.retrieve === 'object' && resource.retrieve.parameter !== false))
	{
		prefix = ':';
	};
	return prefix;
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
function logPath({resource, path, router}: {resource: Resource, path: string, router: Express.Router})
{
	if (!router) return;
	const methodEntries = resource.methods && Object.entries(resource.methods) as Array<[ResourceMethodNameUpperCase, ResourceMethod]>;
	const methodsLog = (methodEntries && methodEntries.length > 0) ? ' => ' + methodEntries.map(entry => entry[0]).join(' ') : '';
	const pathLog = path + methodsLog;
	console.log(pathLog);
};

function initialiseResourceMiddleware(resource: TransformedResource, router: Express.Router, path: string, resourceAncestors: ResourcesArray)
{
	const route = router.route(path);
	initialiseResourceMethods(resource, route, resourceAncestors);
	route.all((request, response) => handleResourceMethodUnavailable({request, response}));
};

function initialiseResourceMethods(resource: Resource, route: Express.IRoute, resourceAncestors: ResourcesArray)
{
	if (!resource.methods) return;
	for (let methodName of Object.keys(resource.methods) as Array<ResourceMethodNameUpperCase>)
	{
		const method = resource.methods[methodName] as ResourceMethod;
		initialiseResourceMethod(methodName, method, route, resourceAncestors);
	};
};

function initialiseSubresources(resource: TransformedResource, router: Express.Router, path: string, resourceAncestors: ResourcesArray)
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