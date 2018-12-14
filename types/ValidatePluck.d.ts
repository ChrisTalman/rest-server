import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
import { ResourceMethod } from './';
export default function (method: ResourceMethod, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction): void;
