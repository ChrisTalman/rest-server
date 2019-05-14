'use strict';

module.exports =
{
    handler
};

async function handler({request, response})
{
	console.log('Delete thing requested.');
	response.sendStatus(501);
};