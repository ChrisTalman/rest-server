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
import authenticate from './Authenticate';
import validate from './Validate';
import validatePluck from './ValidatePluck';
import handleResourceMethodParameter from './Retrieve';
import * as Errors from './Errors';
import { handleResourceError } from './Utilities';

// Types
import
{
	IRouterHandler as ExpressRouteHandler,
	Application as GenericExpressApplication,
	Router as ExpressRouter,
	IRoute as ExpressRoute,
	Request as ExpressRequest,
	Response as ExpressResponse
} from 'express';
// Resource
export interface Resource
{
	name: string;
	/** Method to retrieve resource. Stores resource in locals object. Returns 404 if not found. */
	retrieve?: ResourceRetrieve;
	methods?: ResourceMethods;
	resources?: Resources;
};
export interface Resources extends Array<Resource> {};
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
export interface ResourceMethods extends Array<ResourceMethod> {};
export interface ResourceMethod
{
	name: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	authenticate?: ResourceMethodAuthenticate;
	schema?: Schema;
	pluck?: Pluck.Variant;
	handler: ResourceMethodHandler;
};
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
	config: Config;
};
export interface Config
{
	port: number;
	resources: Resources;
	root?: string;
	debug?: Debug;
};
export interface Debug
{
	paths?: boolean;
};

export function initialise(config: Config)
{
	const app: ExpressApplication = Express();
	app.locals.config = config;
	initialiseExpress(app);
	initialiseResources(app);
	listenExpressHttp(app);
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
	for (let resource of app.locals.config.resources)
	{
		initialiseResource({resource, router, path: '', resourceAncestors: []});
	};
	app.use(app.locals.config.root, router);
	listenResourceNotFound(app);
};

function initialiseResource({resource, router, path, resourceAncestors}: {resource: Resource, router: ExpressRouter, path: string, resourceAncestors: Resources})
{
	path += '/' + resource.name;
	resourceAncestors = augmentAncestors({resource, ancestors: resourceAncestors});
	logPath({resource, path, router});
	initialiseResourceMiddleware(resource, router, path, resourceAncestors);
	initialiseSubresources(resource, router, path, resourceAncestors);
};

/** Creates new array, in which existing resources are first added, and then the newest resource at the end. */
function augmentAncestors({resource, ancestors}: {resource: Resource, ancestors: Resources})
{
	const augmented: Resources = [];
	augmented.push(... ancestors, resource);
	return augmented;
};

/** Logs path with console.log(), if config enables this functionality. */
function logPath({resource, path, router}: {resource: Resource, path: string, router: ExpressRouter})
{
	if (!router) return;
	const methodsLog = (resource.methods && resource.methods.length > 0) ? ' => ' + resource.methods.map(method => method.name).join(' ') : '';
	const pathLog = path + methodsLog;
	console.log(pathLog);
};

function initialiseResourceMiddleware(resource: Resource, router: ExpressRouter, path: string, resourceAncestors: Resources)
{
	const route = router.route(path);
	initialiseResourceMethods(resource, route, resourceAncestors);
	route.all((request, response) => handleResourceMethodUnavailable({request, response}));
};

function initialiseResourceMethods(resource: Resource, route: ExpressRoute, resourceAncestors: Resources)
{
	if (!resource.methods)
	{
		return;
	};
	for (let method of resource.methods)
	{
		const duplicate = resource.methods.filter(otherMethod => method.name === otherMethod.name).length > 1;
		if (duplicate)
		{
			console.warn('Duplicate Method:', method.name);
		};
		initialiseResourceMethod(method, route, resourceAncestors);
	};
};

function initialiseResourceMethod(method: ResourceMethod, route: ExpressRoute, resourceAncestors: Resources)
{
	const methodIdentifier = method.name.toLowerCase();
	const methodHandler = route[methodIdentifier as ResourceMethodNameLowerCase].bind(route) as ExpressRouteHandler <ExpressRoute>;
	methodHandler((request, response, next) => authenticate({method, request, response, next}));
	initialiseResourceMethodParameter(methodHandler, resourceAncestors);
	initialiseMethodSchema(methodIdentifier, method, route);
	if (method.pluck) methodHandler(validatePluck.bind(null, method));
	methodHandler((request, response) => handleResourceMethod({request, response, method}));
};

function initialiseResourceMethodParameter(methodHandler: ExpressRouteHandler <ExpressRoute>, resourceAncestors: Resources)
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

function initialiseSubresources(resource: Resource, router: ExpressRouter, path: string, resourceAncestors: Resources)
{
	if (!resource.resources)
	{
		return;
	};
	for (let subresource of resource.resources)
	{
		initialiseResource({resource: subresource, router, path, resourceAncestors});
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
};