/// <reference types="node" />
/// <reference types="express" />

// Types
import { Server as HttpServer } from 'http';
import { Application as ExpressApplication, IRoute as ExpressRoute, Request as GenericExpressRequest, Response as GenericExpressResponse } from 'express';
import * as BodyParser from 'body-parser';

declare module '@chris-talman/rest-server'
{
	// Initialise
	export default class RestServer
	{
		public readonly config: ValidatedConfig;
		public readonly app: ExpressApplication;
		public readonly httpServer: HttpServer;
		/** Constructs instance. */
		constructor(config: Config);
		/** Closes HTTP server socket, preventing new requests. Promise resolves once all active connections have gracefully closed. */
		public stop(): Promise<void>;
	}

	// Resources
	export interface Resources
	{
		[name: string]: Resource;
	}
	export interface Resource
	{
		name?: string;
		/** Method to retrieve resource. Stores resource in locals object. Returns 404 if not found. */
		retrieve?: ResourceRetrieve;
		/** Callback to run before every request handler. */
		pre?: ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<boolean | void>;
		methods?: ResourceMethods;
		resources?: Resources;
	}

	// Resource Methods
	export type ResourceMethods =
	{
		[MethodName in ResourceMethodNameUpperCase]?: ResourceMethod <MethodName>
	};
	export interface ResourceMethod <GenericMethodName = ResourceMethodNameUpperCase>
	{
		name?: GenericMethodName;
		/**
			true: Authentication required and evaluated by callback
			false: Authentication ignored
			'bearer': Authentication is required in form of RFC 6750 Bearer token
			'bearer-optional': Same as 'bearer', but only evaluated by callback if token is provided in request
		*/
		jsonContentTypes?: Array<string>;
		/** Options to pass to `bodyParser.raw()`. */
		bodyParserOptions?: BodyParser.Options;
		authenticate?: boolean | 'bearer' | 'bearer-optional';
		schema?: object;
		pluck?: object;
		exposeRawBody?: boolean;
		exposeTextBody?: boolean;
		handler: ResourceMethodHandler;
	}
	type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	export type ResourceMethodHandler = ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<void> | void;

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
	}
	export type ResourceRetrieveValue = object | false | null | undefined;

	// Config
	export interface Config
	{
		port: number;
		resources: Resources;
		/** Callback to run before every request handler. */
		pre?: ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => Promise<void>;
		authenticate?: AuthenticationConfigVariant;
		/** Evaluates whether request body is valid for resource method, and returns parsed body if valid. */
		validate: ValidationCallback;
		/** Generates pluck value to be assigned to `response.locals.pluck` for each request. */
		pluck?: PluckCallback;
		root?: string;
		debug?: Debug;
	}
	export type ValidationCallback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => Promise<ValidationCallbackValidation>;
	export type ValidationCallbackValidation = ValidationCallbackValidationValid | ValidationCallbackValidationInvalid;
	export interface ValidationCallbackValidationValid
	{
		valid: true;
		parsed: object;
	}
	export interface ValidationCallbackValidationInvalid
	{
		valid: false;
		errorMessage: string;
	}
	export type PluckCallback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => object;
	export interface ValidatedConfig extends Config
	{
		root: string;
	}
	export type AuthenticationConfigVariant = AuthenticationCallback | AuthenticationConfig;
	export interface AuthenticationConfig
	{
		callback: AuthenticationCallback;
		/**
			'bearer': Authentication is required in form of RFC 6750 Bearer token
			'bearer-optional': Same as 'bearer', but only evaluated by callback if token is provided in request
		*/
		helper?: 'bearer' | 'bearer-optional';
	}
	export type AuthenticationCallback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => AuthenticationCallbackPromise;
	export interface AuthenticationCallbackPromise extends Promise <AuthenticationCallbackResult> {}
	export type AuthenticationCallbackResult = { data: object } | { unprovided: true } | { error: ApiError };
	export interface Debug
	{
		paths?: boolean;
	}

	/** Represents API error. */
	export class ApiError
	{
		public code: string;
		public status: number;
		public message?: string;
		constructor(parameters: {code: string, status: number, message?: string, resourceName?: string});
		/** Generates an object to transport to an API client. */
		toTransport(): ApiErrorBaseTransport;
	}
	interface ApiErrorBaseTransport
	{
		code: string;
		message?: string;
	}

	// Utilities
	export function handleResourceSuccess({response, json}: {response: ExpressResponse, json?: any}): void;
	export function handleResourceError({response, apiError, error, status}: {response: ExpressResponse, apiError?: ApiError, error?: Error, status?: number}): void;

	// Express
	export interface ExpressRequest <GenericParams extends Uniform<GenericParams, string> = {}> extends GenericExpressRequest
	{
		params: GenericParams;
		rawBody?: Buffer;
		textBody?: string;
		route: ExpressRoute;
	}
	type Uniform <Generic, Type> = { [Key in keyof Generic]: Type; };
	export interface ExpressResponse extends GenericExpressResponse
	{
		locals: ExpressLocals;
	}
	export interface ExpressLocals
	{
		authentication?: object;
		resourceData?: object;
		parameters?: object;
		pluck?: object;
	}
	export type Pluck = string | ArrayPluck | ObjectPluck;
	interface ArrayPluck extends Array<Pluck> {}
	interface ObjectPluck
	{
		[key: string]: string | true | ArrayPluck | ObjectPluck;
	}
	interface ObjectifiedPluck
	{
		[key: string]: true | ObjectifiedPluck;
	}

	// Errors
	export class NotFoundError extends ApiError
	{
		constructor(resource: string);
	}
	export class UnauthenticatedError extends ApiError
	{
		constructor();
	}
}