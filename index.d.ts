/// <reference types="express" />

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare module '@bluecewe/rest-server'
{
    // Initialise
    export default function initialise(config: Config): void;
    export type Resources =
    {
    	[Name in string]?: Resource <Name>
    };
    export interface Resource <GenericName extends string = string>
    {
    	name?: GenericName;
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
    	authenticate?: ResourceMethodAuthenticate;
    	schema?: Schema;
    	pluck?: Pluck.Variant;
    	handler: ResourceMethodHandler;
    }
    type ResourceMethodNameUpperCase = 'GET' | 'POST' | 'PATCH' | 'DELETE';
    export interface ResourceMethodAuthenticate
    {
        callback: Callback;
    	/** Authentication is evaluated only if provided in request. */
    	optional?: boolean;
    }
    export type Callback = ({method, request, response}: {method: ResourceMethod, request: ExpressRequest, response: ExpressResponse}) => CallbackPromise;
    export interface CallbackPromise extends Promise <CallbackResult> {}
    export type CallbackResult = { data: object } | { error: ApiError };
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
    	root?: string;
    	debug?: Debug;
    }
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
}