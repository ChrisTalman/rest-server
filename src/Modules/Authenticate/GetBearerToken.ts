'use strict';

// Types
import { Request as ExpressRequest } from 'express';
export interface Result
{
    error: 'unavailable' | 'invalidType' | 'missingToken';
};

/** Returns RFC 6750 Bearer token from request. */
export default function getBearerToken(request: ExpressRequest): string | Result
{
	const header = request.get('Authorization');
	if (header === undefined) return { error: 'unavailable' };
	const parts = header.split(' ');
	const type = parts[0];
	if (type !== 'Bearer') return { error: 'invalidType' };
	const token = parts[1];
	if (!token) return { error: 'missingToken' };
	return token;
};