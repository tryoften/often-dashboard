/// <reference path="typings/node/node.d.ts"/>

var path = require("path");
var webpackShared = require("./webpack.shared");
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var nodeModulesPath = path.join(__dirname, 'node_modules');

var config = {
	// entry points - each will produce one bundled js file and one css file if there is any css in dependency tree
	entry: {
		vendors: [
			'react',
			'react-dom',
			'firebase',
			'underscore',
			'backbone',
			'backbonefire',
			'classnames',
			'jquery',
			'minimist',
			'react-bootstrap',
			'react-router'
		],
		app: [
			path.join(__dirname, 'src', 'main.tsx')
		]
	},

	// This is path to loaders
	resolveLoader: {
		root: nodeModulesPath
	},

	resolve: {
		extensions: ['', '.tsx', '.ts', '.js', '.less', '.css'],
		modulesDirectories: ["node_modules", "resources"]
	},

	output: {
		path: path.join(__dirname, 'dist/public/js'),
		filename: '[name].js'
	},

	module: {
		preLoaders: [
			{ test: /\.ts(x?)$/, loader: "tslint", include: path.resolve(__dirname, "src") }
		],
		noParse: [],
		loaders: [
			{
				test: /\.ts(x?)$/,
				loaders: ['ts-loader?configFileName=tsconfig.webpack.json'],
				include: path.resolve(__dirname, "src")
			},
			{ test: /\.css$/,  loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize"), include: path.resolve(__dirname, "src/public") },
			{ test: /\.less$/, exclude: /\.module\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!less-loader?compress"), include: path.resolve(__dirname, "src/public/less") },
			{ test: /\.module\.less$/,
				loader: ExtractTextPlugin.extract("style-loader","css-loader?minimize&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less-loader?-compress"),
				include: path.resolve(__dirname, "src/public/less") },
			{ test: /\.(jpg|png|woff|eot|ttf|svg|gif)$/, loader: "file-loader?name=[name]_[hash].[ext]", include: path.resolve(__dirname, "src/public") }
		]
	},

	plugins: [
		new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
	],

	tslint: {
		// Rules are in tslint.json
		emitErrors: false, // false = WARNING for webpack, true = ERROR for webpack
		formattersDirectory: path.join(nodeModulesPath, 'tslint-loader', 'formatters')
	},
};

if (webpackShared.isProduction) {
	config.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}));
	config.plugins.push(new webpack.DefinePlugin({
		'process.env': {NODE_ENV: '"production"'}
	}));
}

module.exports = config;
