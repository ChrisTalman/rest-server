'use strict';

module.exports =
{
    exposeTextBody: true,
    handler
};

async function handler({request, response})
{
    console.log('Raw Body:', request.rawBody);
    console.log('Text Body:', request.textBody);
    console.log('JSON Body:', request.body);
	response.sendStatus(501);
};