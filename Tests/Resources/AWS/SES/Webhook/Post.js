'use strict';

module.exports =
{
	handler
};

async function handler({response, request})
{
	console.log('Handled.');
	console.log('Body:', request.body);
	response.status(501).send();
};