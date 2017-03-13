module.exports = function( config ) {

	config.set( {
		//client: {
		//	browserConsoleLogOptions: true,
		//	captureConsole: true
		//},
		files: [
			"node_modules/jquery/dist/jquery.js",
			"dist/jquery.autoTransition.min.js",
			"test/setup.js",
			"test/spec/*"
		],
		frameworks: [ "qunit" ],
		autoWatch: true
	} );
};
