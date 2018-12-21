'use strict';

// External Modules
const Path = require('path');
const NodeExternals = require('webpack-node-externals');

// Constants
const TYPESCRIPT_IGNORE = /(?:node_modules)$/;
const NODE_EXTERNALS_WHITELIST = [/^@bluecewe\/[\w-]+/];

module.exports =
{
	mode: 'development',
    entry:
    {
        index: './src/Modules/index.ts'
    },
	target: 'node',
    resolve:
    {
        extensions: ['.ts'],
        alias:
        {
            src: __dirname + '/src'
        }
    },
    output:
    {
        filename: '[name].js',
        path: Path.resolve(__dirname, './'),
        libraryTarget: 'umd'
    },
    watch: true,
    module:
    {
        rules:
        [
            {
                loader: 'ts-loader',
                test: /\.tsx?$/,
                exclude: TYPESCRIPT_IGNORE
            }
        ]
    },
	externals:
	[
		NodeExternals({whitelist: NODE_EXTERNALS_WHITELIST})
	]
};