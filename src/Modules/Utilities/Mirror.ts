'use strict';

// Types
export type Mirror <GenericObject> =
{
	[GenericKey in keyof GenericObject]: GenericKey
};

/** Generates new object with each key and value having the same value as one another. */
export default function <GenericObject extends object> (object: GenericObject)
{
	const mirror = {} as Mirror<GenericObject>;
	const keys = Object.keys(object);
	for (let key of keys)
	{
		mirror[key] = key;
	};
	return mirror;
};