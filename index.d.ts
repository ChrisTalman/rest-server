/// <reference types="express" />

import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare module '@bluecewe/rest-server'
{
    export interface ResourceMethods extends Array<ResourceMethod> {}
    export interface ResourceMethod
    {
    	name: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    	authenticate?: ResourceMethodAuthenticate;
    	schema?: Schema;
    	pluck?: Pluck.Variant;
    	handler: ResourceMethodHandler;
    }
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
    // Initialise
    export default function initialise(): void;
    export interface Resources extends Array<Resource> {}
    export interface Resource
    {
    	name: string;
    	/** Method to retrieve resource. Stores resource in locals object. Returns 404 if not found. */
    	retrieve?: ResourceRetrieve;
    	methods?: ResourceMethods;
    	resources?: Resources;
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