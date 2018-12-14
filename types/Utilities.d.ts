import { Response as ExpressResponse } from 'express';
import { ApiError } from 'src/Modules/Errors';
export declare function handleResourceError(parameters: {
    response: ExpressResponse;
    apiError?: ApiError;
    error?: Error;
    status?: number;
}): void;
export declare function assignPropertiesFromParameters({ target, parameters }: {
    target: object;
    parameters: object;
}): void;
