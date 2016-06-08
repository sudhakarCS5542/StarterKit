// new webpack.ProvidePlugin({
//     $: "jquery",
//     ModuleName: "./path/to/module",
//     "window.jQuery": "jquery"
// });

var webpack = require("webpack");

module.exports = {
	target: 'node',
    entry: "./index",
    output: {
        path: "dist",
        filename: "bundle.js"
    },
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel', // 'babel-loader' is also a legal name to reference
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	plugins: [
		// new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js")
	]
};
