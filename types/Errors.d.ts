import { Resource } from './';
export declare class ApiError {
    code: string;
    status: number;
    message?: string;
    constructor(parameters: ApiErrorParameters);
    initialiseProperties(parameters: ApiErrorParameters): void;
    toTransport(): {
        code: string;
        message: string;
    };
}
interface ApiErrorParameters {
    code: string;
    status: number;
    message?: string;
    resourceName?: string;
}
export declare class UnexpectedError extends ApiError {
    static generate(): UnexpectedError;
    constructor();
}
export declare class InvalidBody extends ApiError {
    static generate(reason: string): InvalidBody;
    constructor(reason: string);
}
export declare class NotFound extends ApiError {
    private resourceName;
    static generate(resource: Resource | string): NotFound;
    constructor(resource: Resource | string);
    toTransport(): {
        code: string;
        message: string;
        resourceName: string;
    };
}
export declare class UnauthorisedError extends ApiError {
    static generate(): UnauthorisedError;
    constructor();
}
export declare class PluckRequired extends ApiError {
    static generate(): PluckRequired;
    constructor();
}
export declare class PluckLong extends ApiError {
    static generate(): PluckLong;
    constructor();
}
export declare class PluckParse extends ApiError {
    static generate(): PluckParse;
    constructor();
}
export declare class PluckInvalid extends ApiError {
    static generate(reason: string): PluckInvalid;
    constructor(reason: string);
}
export {};
