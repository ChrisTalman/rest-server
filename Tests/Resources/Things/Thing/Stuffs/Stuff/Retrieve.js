'use strict';

module.exports = async function retrieve({response})
{
	console.log('Thing:', response.locals.resourceData.thing);
	return { b: 2 };
};