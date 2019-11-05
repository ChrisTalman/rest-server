'use strict';

// Methods
const GET = require('./Methods/Get');
const POST = require('./Methods/Post');

// Resources
const thing = require('./Thing');

module.exports =
{
	methods:
	{
		GET,
		POST
	},
	resources:
	{
		thing
	}
};