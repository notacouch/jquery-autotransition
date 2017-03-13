# jquery-autotransition
CSS transition to/from `'auto'` for top, left, width, and height properties.

I basically took the code by  [Nikita Vasilyev's CSS transition from/to auto values](http://n12v.com/css-transition-to-from-auto/) and turned it into a plugin.

Options are `property` (either `'top'`, `'left'`, `'width'`, or `'height'`), `value` (defaults to `'auto'`), `transition_affix` (default transition asides from `transition-property`, defaults to `' .5s ease-in-out'`).

E.g.

```JavaScript
$('#element').autoTransition({ property: 'top', value: '200px', transition_affix: ' .2s ease-out', callback: function(){ } });
```
