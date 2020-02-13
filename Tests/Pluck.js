'use strict';

// Export
module.exports = { pluck };

function pluck({request})
{
	const pluck = request.body.pluck;
	return pluck;
};