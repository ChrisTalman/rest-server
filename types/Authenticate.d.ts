import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceMethod } from './';
import { ApiError } from './Errors';
export interface ResourceMethodConfig {
    callback: Callback;
    optional?: boolean;
}
export declare type Callback = ({ method, request, response }: {
    method: ResourceMethod;
    request: ExpressRequest;
    response: ExpressResponse;
}) => CallbackPromise;
export interface CallbackPromise extends Promise<CallbackResult> {
}
export declare type CallbackResult = {
    data: object;
} | {
    error: ApiError;
};
export default function authenticate({ method, request, response, next }: {
    method: ResourceMethod;
    request: ExpressRequest;
    response: ExpressResponse;
    next: ExpressNextFunction;
}): Promise<void>;
