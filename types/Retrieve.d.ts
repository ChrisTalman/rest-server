import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { Resources } from './';
export default function ({ resourceAncestors, request, response, next }: {
    resourceAncestors: Resources;
    request: ExpressRequest;
    response: ExpressResponse;
    next: ExpressNextFunction;
}): Promise<void>;
