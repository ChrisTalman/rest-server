/// <reference types="node" />
/// <reference types="express" />

// Types
import { Server as HttpServer } from 'http';
import { Application as ExpressApplication, Request as GenericExpressRequest, Response as GenericExpressResponse } from 'express';

declare module '@bluecewe/rest-server'
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
    	authenticate?: boolean | 'bearer' | 'bearer-optional';
    	schema?: Schema;
    	pluck?: Pluck.Variant;
    	exposeRawBody?: boolean;
    	exposeTextBody?: boolean;
    	handler: ResourceMethodHandler;
    }
    type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    export interface Schema
    {
    	[key: string]: any;
    }
    export namespace Pluck
    {
    	export type Variant = Array<string | Object> | Object;
    	export interface Object
    	{
    		[field: string]: Variant | boolean;
    	}
    }
    export type ResourceMethodHandler = ({request, response}: {request?: ExpressRequest, response?: ExpressResponse}) => void;
    // Resource Retrieve
    export type ResourceRetrieve = (parameters: RetrieveParameters <any, any>) => Promise<ResourceRetrieveValue>;
    export interface RetrieveParameters <GenericRequest extends ExpressRequest, GenericResponse extends ExpressResponse>
    {
    	request: GenericRequest;
    	response: GenericResponse;
    }
    export type ResourceRetrieveValue = object | false;
    export interface Config
    {
    	port: number;
    	resources: Resources;
        authentication?: AuthenticationConfigVariant;
    	root?: string;
    	debug?: Debug;
    }
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
    	toTransport(): { code: string; message: string; };
    }
    // Utilities
    export function handleResourceSuccess({response, json}: {response: ExpressResponse, json?: any}): void;
    export function handleResourceError({response, apiError, error, status}: {response: ExpressResponse, apiError?: ApiError, error?: Error, status?: number}): void;
    // Express
    export interface ExpressRequest extends GenericExpressRequest
    {
    	rawBody?: Buffer;
    	textBody?: string;
    }
    export interface ExpressResponse extends GenericExpressResponse
    {
        locals: ExpressLocals;
    }
    export interface ExpressLocals
    {
        authentication?: object;
    	resourceData?: object;
    	parameters?: object;
    	pluck?: ExpressResponsePluck;
    }
    export interface ExpressResponsePluck
    {
    	/** The original parsed value of the pluck. */
    	parsed: object;
    	/** The RethinkDB-compatabile value of the pluck. */
    	rethink: Array<any> | {[key: string]: any};
    }
}