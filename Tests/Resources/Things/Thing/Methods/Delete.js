'use strict';

module.exports =
{
	handler
};

async function handler({request, response})
{
	console.log('Delete thing requested.');
	console.log(response.locals.resourceData);
	response.sendStatus(200);
};