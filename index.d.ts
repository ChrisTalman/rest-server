/// <reference types="express" />

import { Request as ExpressRequest, Response as GenericExpressResponse } from 'express';

declare module '@bluecewe/rest-server'
{
    // Initialise
    export default function initialise(config: Config): void;
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
    		true: Authentication required and evaluated
    		false: Authentication ignored
    		'optional': Authentication is evaluated only if provided in request
    	*/
    	authenticate?: boolean | 'optional';
    	schema?: Schema;
    	pluck?: Pluck.Variant;
    	handler: ResourceMethodHandler;
    }
    type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PATCH' | 'DELETE';
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
    export type ResourceMethodHandler = (parameters: ResourceMethodHandlerParameters) => void;
    export interface ResourceMethodHandlerParameters <GenericRequest extends ExpressRequest = ExpressRequest, GenericResponse extends ExpressResponse = ExpressResponse>
    {
    	request: GenericRequest;
    	response: GenericResponse;
    }
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
    class ApiError
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