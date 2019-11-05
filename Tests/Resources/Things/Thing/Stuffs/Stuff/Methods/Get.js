'use strict';

module.exports =
{
    handler
};

async function handler({request, response})
{
	console.log('Get stuff requested.');
	console.log('Params:', request.params);
	console.log('Resource Data:', response.locals.resourceData);
	response.sendStatus(501);
};