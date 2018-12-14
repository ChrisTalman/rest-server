import { Application as GenericExpressApplication, Request as ExpressRequest, Response as ExpressResponse } from 'express';
export interface Resource {
    name: string;
    retrieve?: ResourceRetrieve;
    methods?: ResourceMethods;
    resources?: Resources;
}
export interface Resources extends Array<Resource> {
}
export declare type ResourceRetrieve = (parameters: RetrieveParameters<any, any>) => Promise<ResourceRetrieveValue>;
export interface RetrieveParameters<GenericRequest extends ExpressRequest, GenericResponse extends ExpressResponse> {
    request: GenericRequest;
    response: GenericResponse;
}
export declare type ResourceRetrieveValue = object | false;
import { ResourceMethodConfig as ResourceMethodAuthenticate } from './Authenticate';
export interface ResourceMethods extends Array<ResourceMethod> {
}
export interface ResourceMethod {
    name: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    authenticate?: ResourceMethodAuthenticate;
    schema?: Schema;
    pluck?: Pluck.Variant;
    handler: ResourceMethodHandler;
}
export declare type ResourceMethodHandler = (parameters: ResourceMethodHandlerParameters) => void;
export interface ResourceMethodHandlerParameters<GenericRequest extends ExpressRequest = ExpressRequest, GenericResponse extends ExpressResponse = ExpressResponse> {
    request: GenericRequest;
    response: GenericResponse;
}
export interface Schema {
    [key: string]: any;
}
export declare namespace Pluck {
    type Variant = Array<string | Object> | Object;
    interface Object {
        [field: string]: Variant | boolean;
    }
}
export interface ExpressApplication extends GenericExpressApplication {
    locals: ExpressApplicationLocals;
}
export interface ExpressApplicationLocals {
    config: Config;
}
export interface Config {
    port: number;
    resources: Resources;
    root?: string;
    debug?: Debug;
}
export interface Debug {
    paths?: boolean;
}
export default function initialise(config: Config): void;
