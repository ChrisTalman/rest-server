'use strict';

module.exports =
{
    handler
};

async function handler({request, response})
{
	console.log('Get stuff requested.');
	console.log(response.locals.resourceData);
	response.sendStatus(501);
};