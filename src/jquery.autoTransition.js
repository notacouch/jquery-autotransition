// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "autoTransition",
			defaults = {
				callback: null,
				transition_affix: ' .5s ease-in-out',
				value: 'auto'
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element     = element;
			this._defaults   = defaults;
			this._name       = pluginName;
			this.init(options);
		}

		var computeTransition = function() {
			return this.css('transition-property') + ' ' + this.css('transition-duration') + ' ' + this.css('transition-timing-function') + ' ' + this.css('transition-delay');
		};

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
			init: function(options) {

				this.settings = jQuery.extend({}, this._defaults, options);

				var value = this.settings.value;

				if (typeof this.settings.property !== 'undefined') {
					var property = String(this.settings.property);
					switch (property) {
						// The only supported properties at the moment
						case 'top':
						case 'left':
						case 'width':
						case 'height':
							this.autoTransition(property, value);
						break;

						default:
						break;
					}
				}
			},
			autoTransition: function( property, value ) {
				var el               = this.element;
				var $el              = jQuery(this.element);
				var offsetProp       = 'offset' + property[0].toUpperCase() + property.slice(1);
				var transition_affix = this.settings.transition_affix;
				var transition_event = 'transitionend.autoTransition.' + property;
				var cancel_event     = 'autoTransition.' + property + '.cancel';
				var callback         = this.settings.callback;
				if (typeof callback === 'function') {
					this.settings.callback = null;
				}

				var transition_didnt_exist;
				var transition_property_didnt_exist;
				var transition_property_had_none = false;
				var set_transition = function() {
					//console.log('transition?	', computeTransition.call($el));
					if ( ! computeTransition.call($el) || (computeTransition.call($el) === "all 0s ease 0s")) { // "all 0s ease 0s" is default.
						$el.css('transition', property + transition_affix );
						transition_didnt_exist          = true;
						transition_property_didnt_exist = false;
					} else {
						transition_didnt_exist = false;

						// check transition-property
						var transition_properties = $el.css('transition-property');
						var transition_properties_array = transition_properties.replace(/\s/g,'').split(',');

						if ( ( transition_properties_array.indexOf(property) === -1) && (transition_properties_array.indexOf('all') === -1) ) { // Didn't want to write another test for this.
							transition_property_didnt_exist = true;

							var none_index = transition_properties_array.indexOf('none');

							if (none_index !== -1) {
								transition_property_had_none = true;
								transition_properties_array.pop(none_index);
								transition_properties = transition_properties_array.join(',');
							}

							$el.css('transition-property', transition_properties + ($.trim(transition_properties).length ? ', ' : '') + property);
						} else {
							transition_property_didnt_exist = false;
						}
					}
					//console.log('tde, tpde ', transition_didnt_exist, transition_property_didnt_exist);
				};
				var unset_transition = function() {
					if (transition_didnt_exist) {
						$el.css('transition', '');
					} else {
						if (transition_property_didnt_exist) {
							var transition_properties_array = $el.css('transition-property').replace(/\s/g,'').split(',');
							transition_properties_array.pop(transition_properties_array.indexOf(property));
							if (transition_property_had_none) {
								transition_properties_array.unshift('none');
							}
							$el.css('transition-property', transition_properties_array.join(','));
						}
					}
				};

				// Cancel previous autoTransition of same property if any
				$el.off(transition_event);
				$el.trigger(cancel_event);
				$el.on(cancel_event, function(){
					unset_transition();
					$el.off(cancel_event);
				});

				if (value === 'auto') {

					// To 'auto' from ?.

					var previous_value = $el.css(property);

					$el.css(property, value);

					var end_value = getComputedStyle(el)[property]; // but this also causes redraw/repaint...? @link http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/

					$el.css(property, previous_value);

					el[offsetProp]; // force reflow/repaint. source includes other potential options. @link http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes/3485654#3485654

					set_transition();

					$el.css(property, end_value);

					$el.on(transition_event, function(event){
						if (event.originalEvent.propertyName === property) {
							$el.trigger(cancel_event);
							$el.css(property, value);
							$el.off('transitionend.autoTransition.' + property);
							if (typeof callback === 'function') {
								callback();
							}
						}
					});

				} else {

					// From 'auto' (or ?) to `value`

					if ($el.css(property) !== 'auto') {
						switch (property) {
							case 'top':
							case 'left':
								//$el.css(property, el[offsetProp]); // incorrect, e.g. child is positioned relative, no top is set, its offsetTop reports where it is as opposed to 0
								$el.css(property, $el.css(property));
							break;

							default:
								$el.css(property, getComputedStyle(el)[property]);
							break;
						}
					}

					set_transition();

					el[offsetProp]; // force reflow/repaint. source includes other potential options. @link http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes/3485654#3485654

					$el.css(property, value);

					$el.on(transition_event, function(event){
						if (event.originalEvent.propertyName === property) {
							$el.trigger(cancel_event);
							$el.off('transitionend.autoTransition.' + property);
							if (typeof callback === 'function') {
								callback();
							}
						}
					});
				}
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		var data_plugin_property = "plugin_" + pluginName;
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				var plugin = $.data( this, data_plugin_property );
				if ( ! plugin ) {
					$.data( this, data_plugin_property, new Plugin( this, options ) );
				} else {
					plugin.init( options );
				}
			} );
		};

} )( jQuery, window, document );
