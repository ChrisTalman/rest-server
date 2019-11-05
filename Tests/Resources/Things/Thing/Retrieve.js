'use strict';

module.exports = function retrieve()
{
	console.log('Retrieve: Thing');
	const promise = new Promise(resolve => setTimeout(resolve({a: 1}), 1000));
	return promise;
};