'use strict';

// To Do: All ApiErrors should be instantiated when used, as otherwise references could be maintained betwween requests with undesirable results.
// To Do: Perhaps provide a generic static generate() method for the ApiError class. This was previously removed, because TypeScript did not allow derived classes to provide their own static method of the same name with different arguments, which is a very common pattern.
// To Do: Provide 'entity not found' error for when an entity provided in request parameters cannot be found. In particular, the error should indicate which parameter failed, because requests can be complex with multiple parameters referencing the same entity type. For instance, two or more parameters might reference an Enjin user ID, and one might fail, which should be clearly indicated, much like how Joi clearly indicates which part of the schema failed.

// Types
import { Resource } from './';

/** Represents API error. */
export class ApiError
{
	public code: string;
	public status: number;
	public message?: string;
	constructor(parameters: {code: string, status: number, message?: string, resourceName?: string})
	{
		this.initialiseProperties(parameters);
	};
	private initialiseProperties(parameters: object)
	{
		const keys = Object.keys(parameters);
		for (let key of keys)
		{
			const value = parameters[key];
			this[key] = value;
		};
	};
	/** Generates an object to transport to an API client. */
	public toTransport()
	{
		const transport =
		{
			code: this.code,
			message: this.message
		};
		return transport;
	};
};

interface ApiErrorParameters
{
	code: string;
	status: number;
	message?: string;
	resourceName?: string;
};

/** A generic API error for an unexpected error. */
export class UnexpectedError extends ApiError
{
	static generate()
	{
		return new this();
	};
	constructor()
	{
		const parameters: ApiErrorParameters =
		{
			code: 'unexpected',
			status: 500
		};
		super(parameters);
	};
};

/** A request body has failed the Joi Schema. */
export class InvalidBody extends ApiError
{
	static generate(reason: string)
	{
		return new this(reason);
	};
	constructor(reason: string)
	{
		const parameters: ApiErrorParameters =
		{
			code: 'invalidBody',
			message: reason,
			status: 400
		};
		super(parameters);
	};
};

/** Entity not found. */
export class NotFound extends ApiError
{
	private resourceName: string;
	static generate(resource: Resource | string)
	{
		return new this(resource);
	};
	constructor(resource: Resource | string)
	{
		const resourceName = typeof resource === 'string' ? resource : resource.name.substring(1);
		const parameters: ApiErrorParameters =
		{
			code: 'notFound',
			status: 404,
			resourceName
		};
		super(parameters);
		this.resourceName = resourceName;
	};
	toTransport()
	{
		const transport =
		{
			code: this.code,
			message: this.message,
			resourceName: this.resourceName
		};
		return transport;
	};
};

/** A generic API error for when a user is unauthorised for something. */
export class UnauthorisedError extends ApiError
{
	static generate()
	{
		return new this();
	};
	constructor()
	{
		const parameters: ApiErrorParameters =
		{
			code: 'unauthorised',
			status: 403
		};
		super(parameters);
	};
};

/** An API error if a pluck is required for a resource method. */
export class PluckRequired extends ApiError
{
	static generate()
	{
		return new this();
	};
	constructor()
	{
		const parameters: ApiErrorParameters =
		{
			code: 'pluckRequired',
			status: 400
		};
		super(parameters);
	};
};

/** An API error if a pluck is invalid due to it being too long in length. */
export class PluckLong extends ApiError
{
	static generate()
	{
		return new this();
	};
	constructor()
	{
		const parameters: ApiErrorParameters =
		{
			code: 'pluckLong',
			status: 400
		};
		super(parameters);
	};
};

/** An API error if a pluck cannot be parsed. */
export class PluckParse extends ApiError
{
	static generate()
	{
		return new this();
	};
	constructor()
	{
		const parameters: ApiErrorParameters =
		{
			code: 'pluckParse',
			status: 400
		};
		super(parameters);
	};
};

/** An API error if a pluck is invalid due to it failing the pluck schema. */
export class PluckInvalid extends ApiError
{
	static generate(reason: string)
	{
		return new this(reason);
	};
	constructor(reason: string)
	{
		const parameters: ApiErrorParameters =
		{
			code: 'pluckInvalid',
			message: reason,
			status: 400
		};
		super(parameters);
	};
};