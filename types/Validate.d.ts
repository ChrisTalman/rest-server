import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';
export default function (schema: object, request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction): void;
