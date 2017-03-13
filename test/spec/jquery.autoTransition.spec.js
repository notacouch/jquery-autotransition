( function( $, QUnit ) {

	"use strict";

	var $testCanvas         = $( "#testCanvas" );
	var $fixture            = null;
	var valid_properties    = ['top', 'left', 'width', 'height'];
	var transition_duration = 500;
	var offsetProp 			= function(property){ return 'offset' + property[0].toUpperCase() + property.slice(1); };
	var getOffset    		= function(property, base) {

		base = base || 0;
		var offset_property = offsetProp(property);
		var offset;
		switch (property) {
			case 'top':
			case 'left':
				offset = this.get(0)[offset_property] - base;
			break;

			default:
				offset = this.get(0)[offset_property];
			break;
		}
		return offset;
	};
	var computeTransition   = function() {
		return this.css('transition-property') + ' ' + this.css('transition-duration') + ' ' + this.css('transition-timing-function') + ' ' + this.css('transition-delay');
	};

	QUnit.module( "jQuery autoTransition", {
		beforeEach: function() {

			if ( ! $fixture) {
				// fixture is the element where your jQuery plugin will act
				$fixture = $( "<div style='position: relative;'></div>" );

				$testCanvas.append( $fixture );
			}
		},
		afterEach: function() {

			//// we remove the element to reset our plugin job :)
			//$fixture.remove();
		}
	} );

	QUnit.test( "is inside jQuery library", function( assert ) {

		assert.equal( typeof $.fn.autoTransition, "function", "has function inside jquery.fn" );
		assert.equal( typeof $fixture.autoTransition, "function", "another way to test it" );
	} );

	QUnit.test( "returns jQuery functions after called (chaining)", function( assert ) {
		assert.equal(
			typeof $fixture.autoTransition().on,
			"function",
			"'on' function must exist after plugin call" );
	} );

	QUnit.test( "caches plugin instance", function( assert ) {
		$fixture.autoTransition();
		assert.ok(
			$fixture.data( "plugin_autoTransition" ),
			"has cached it into a jQuery data"
		);
	} );

	QUnit.test( "enable custom config", function( assert ) {
		$fixture.autoTransition( {
			property: "top",
			value: "200px",
			transition_affix: " .5s ease-in"
		} );

		var pluginData = $fixture.data( "plugin_autoTransition" );

		assert.deepEqual(
			pluginData.settings,
			{
				property: "top",
				value: "200px",
				transition_affix: " .5s ease-in"
			},
			"extend plugin settings"
		);

	} );



	QUnit.test(
		"existing CSS transition is used and not overridden ",
		function( assert ) {
			var done       = assert.async();
			var transition = 'top 0.3s ease-out 0s';
			setTimeout(function(){


				$fixture.css('transition', transition);
				assert.step('fixture transition set to `' + transition + '` @ ' + (new Date()).toISOString() );

				assert.step('fixture autoTransition to `top: 400px` has started @ ' + (new Date()).toISOString() );
				$fixture.autoTransition({
					property: 'top',
					value: '400px'
				});
				assert.equal(computeTransition.call($fixture), transition, 'transition should remain unaffected');

				setTimeout(function(){
					assert.step('fixture autoTransition to `top: 400px` has completed @ ' + (new Date()).toISOString() );
					assert.equal(computeTransition.call($fixture), transition, 'transition should still remain unaffected');

					assert.step('fixture autoTransition resetting top and transition @ ' + (new Date()).toISOString() );
					$fixture.css('top', '');
					$fixture.css('transition', '');
					done();
				}, 310);
			}, 510);
		}
	);


	valid_properties.forEach(function(property, index){
		var offset_property = offsetProp(property);

		QUnit.test(
			property + " transitions to 200px and back",
			function( assert ) {
				var done = assert.async();
				setTimeout(function(){

					var auto = $fixture.get(0)[offset_property];
					//console.log('starting ' + property + ': ', auto);

					assert.step('fixture autoTransition starting transition `' + property + ': 200px` @ ' + (new Date()).toISOString() );
					$fixture.autoTransition({
						property: property,
						value: '200px'
					});

					var test_offset = getOffset.call($fixture, property, auto);
					//console.log('test_offset? ', test_offset);
					assert.notEqual(test_offset, 200, "The actual offset of " + property + " should not equal 200 at the onset (means it is transitioning).");

					setTimeout(function(){
						assert.step('fixture autoTransition to `' + property + ': 200px` has completed @ ' + (new Date()).toISOString() );
						assert.equal(getOffset.call($fixture, property, auto), 200, "The actual offset of " + property + " should equal 200.");

						assert.step('fixture autoTransition starting transition `' + property + ': "auto"` @ ' + (new Date()).toISOString() );
						$fixture.autoTransition({
							property: property,
							value: 'auto'
						});

						setTimeout( function() {
							assert.step('fixture autoTransition to `' + property + ': "auto"` has completed @ ' + (new Date()).toISOString() );
							assert.equal(getOffset.call($fixture, property), auto, "The actual offset of " + property + " should equal " + auto + ".");
							done();
						}, transition_duration + 10);

					}, transition_duration + 10);
				}, transition_duration * 2 * (index+2) + 40 );
			}
		);
	});



}( jQuery, QUnit ) );
