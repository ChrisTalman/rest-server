'use strict';

// Internal Modules
const retrieve = require('./Retrieve');

// Methods
const PATCH = require('./Methods/Patch');
const DELETE = require('./Methods/Delete');

// Resources
const stuffs = require('./Stuffs');

module.exports =
{
	pre,
	retrieve,
	methods:
	{
		PATCH,
		DELETE
	},
	resources:
	{
		stuffs
	}
};

async function pre({request})
{
	console.log('Pre Thing!');
	console.log('Unparametised Path:', request.route.path);
};