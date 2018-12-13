'use strict';

// To Do: All ApiErrors should be instantiated when used, as otherwise references could be maintained betwween requests with undesirable results.
// To Do: Perhaps provide a generic static generate() method for the ApiError class. This was previously removed, because TypeScript did not allow derived classes to provide their own static method of the same name with different arguments, which is a very common pattern.
// To Do: Provide 'entity not found' error for when an entity provided in request parameters cannot be found. In particular, the error should indicate which parameter failed, because requests can be complex with multiple parameters referencing the same entity type. For instance, two or more parameters might reference an Enjin user ID, and one might fail, which should be clearly indicated, much like how Joi clearly indicates which part of the schema failed.

// Internal Modules
import { assignPropertiesFromParameters } from './Utilities';

// Types
import { Resource } from './';
import { Error as EnjinResponseErrorObject } from 'src/Modules/Utilities/EnjinApi';

/** Represents API error. */
export class ApiError
{
	public code: string;
	public status: number;
	public message?: string;
	constructor(parameters: ApiErrorParameters)
	{
		this.initialiseProperties(parameters);
	};
	initialiseProperties(parameters: ApiErrorParameters)
	{
		this.code = parameters.code;
		this.status = parameters.status;
		this.message = parameters.message;
	};
	/** Generates an object to transport to an API client. */
	toTransport()
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

/** An ApiError object to be provided to the request client when they fail to provide a valid authorisation header. */
export const invalidAuthorisationHeader = new ApiError({code: 'invalidAuthorisationHeader', status: 401});

/** User could not be found for authentication token. */
export const authenticationUserNotFound = new ApiError({code: 'authenticationUserNotFound', status: 401});

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

/** Entity deleted. */
export const deleted = new ApiError({code: 'deleted', status: 403});

/** Association cannot be created because it already exists. */
export const duplicateAssociation = new ApiError({code: 'duplicateAssociation', status: 409});

/** Association group cannot be created because one with the name already exists. */
export const DuplicateAssociationGroup = new ApiError({code: 'duplicateAssociationGroup', status: 409});

/** Permission cannot be granted because it's already granted. */
export const DuplicatePermission = new ApiError({code: 'duplicatePermission', status: 409});

/** Discord user cannot login because it's not a human user (i.e. it's a bot). */
export const AuthInvalidDiscordUser = new ApiError({code: 'authInvalidDiscordUser', status: 400});

/** Unexpected Discord API error. */
export const UnexpectedDiscordError = new ApiError({code: 'unexpectedDiscordError', status: 500});

/** Resource :parameter must be @me. */
export const MeParameterRequired = new ApiError({code: 'meParameterRequired', status: 400});

/** Enjin user could not be found. */
export const enjinUserNotFound = new ApiError({code: 'enjinUserNotFound', status: 404});

/** Enjin user authentication code cannot be found in the database. */
export const enjinUserAuthenticationCodeNotFound = new ApiError({code: 'enjinUserAuthenticationCodeNotFound', status: 404});

/** Enjin user authentication code has expired. */
export const enjinUserAuthenticationCodeExpired = new ApiError({code: 'enjinUserAuthenticationCodeExpired', status: 403});

/** Enjin API method disabled. */
export const enjinApiDisabled = new ApiError({code: 'enjinApiDisabled', status: 403});

/** Enjin API authentication failed. */
export const enjinAuthenticationFailed = new ApiError({code: 'enjinAuthenticationFailed', status: 403});

/** Discord channel could not be found in the database. */
export const discordChannelNotFound = new ApiError({code: 'discordChannelNotFound', status: 404});

/** Discord API operation unauthorised. */
export const discordUnauthorised = new ApiError({code: 'discordUnauthorised', status: 403});

/** Activity Log outlet already exists for type and channel. */
export const duplicateActivityLogOutlet = new ApiError({code: 'duplicateActivityLogOutlet', status: 409});

/** The entity in the Disjin API is already being operated upon with a lock. */
export const lockContention = new ApiError({code: 'lockContention', status: 403});

/** Enjin API error. */
export class EnjinError extends ApiError
{
	public method: string;
	public error: EnjinResponseErrorObject;
	constructor(parameters: {method: string, error: EnjinResponseErrorObject})
	{
		const superParameters: ApiErrorParameters =
		{
			code: 'enjinError',
			status: 400
		};
		super(superParameters);
		assignPropertiesFromParameters({target: this, parameters});
	};
	toTransport()
	{
		const transport =
		{
			code: this.code,
			message: this.message,
			method: this.method,
			error: this.error
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