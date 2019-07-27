'use strict';

module.exports = function retrieve()
{
	const promise = new Promise(resolve => setTimeout(resolve({a: 1}), 1000));
	return promise;
};