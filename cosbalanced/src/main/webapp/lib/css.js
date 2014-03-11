/*
	File: css.js
	Purpose: Adds a style element to the DOM, which is generated using the input you provide. This modifies the appearance of the page.
	Available public functions: addRules(), removeRule(), removeRules(), addProp(), removeProp(), refresh(), destroy(), checkRule().
	Needs: jquery-1.3.x
	
	$Author: udy $
*/

(function($) {

	$.DCSS = function(options) {	

    var defaults = {
		limited: ['border-radius'],
		rules: {},
		_style: null
	};
	
	var settings = $.extend({}, defaults, options);
	
	function destroy() {
		if (settings._style) settings._style.remove();
	};
	
	function refresh()
	{
		var cache = '';
		var browserName, pair;
		
		if (id.isIE()) browserName = 'trident';
		else if ($.browser.safari) browserName = 'webkit';
		else if ($.browser.mozilla) browserName = 'gecko';
		else if ($.browser.opera) browserName = 'presto';
	
		$.each(settings.rules, function(rule, selector)
		{			
			cache += rule + '\n{';
			
			$.each(selector, function(property, value){ 
			
				if ($.DCSS[browserName + '_' + property])
				{
					if(pair = $.DCSS[browserName + '_' + property](value, property))
					{
						cache += '\n' + pair[0] + ':' + pair[1] + ';';
					}
				}
				else if (contains(property, settings.limited))
				{
					cache += '\n' + property + ':' + value + ';';
				}
				
			});
			
			cache += '\n}\n';
		});
	
		this.destroy();
		settings._style = $('<style type="text/css">'+ cache +'</style>');

		$('head').append(settings._style);
		
		return this;
	};
	
	function addProp(selector, property, value)
	{
		var rules = {}; rules[selector] = {}; rules[selector][property] = value;
		return this.addRules(rules);
	};

	function addRules(rules)
	{
		settings.rules = jQuery.extend(true, settings.rules, rules);
		return this;
	};
	
	function removeProp(selector, property)
	{
		delete settings.rules[selector][property];
		return this;
	};
	
	function removeRule(selector)
	{
		delete settings.rules[selector];
		return this;
	};

	function removeRules(selectors)
	{
		if(selectors)
		{
			$.each(selectors, function(i, selector) { removeRule(selector); });
		}
		else
		{
			settings.rules = {};
		}
		return this;
	};
	
	function checkRule(selector)
	{
		return defined(settings.rules[selector]);
	};
	
	function defined(selector)
	{
		return (selector != undefined);
	};
	
	function contains(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	};
	
	var publicObj = {
		destroy: destroy,
		refresh: refresh,
		addProp: addProp,
		addRules: addRules,
		removeProp: removeProp,
		removeRule: removeRule,
		removeRules: removeRules
	}

	return publicObj;
	
};


})(jQuery);




$.extend(true, $.DCSS, {
	
	// ### TRIDENT ###
		
	'trident_opacity': function(value, property)
	{
		return ['filter', 'alpha(opacity=' + (value * 100) + ')'];
	},

	// ### GECKO ###
	
	'trident_border-radius': function(value, property)
	{
		return ['-moz-' + property, value];
	},
	
	// ### WEBKIT ###
		
	'webkit_border-radius': function(value, property)
	{
		return ['-webkit-' + property, value];
	}
	
	// ### PRESTO ###
	
});


/* ##################### */
/* #   Example Usage   # */
/* ##################### */
/*

var css = new $.DCSS();

	css.addRules({
		'span.bold, span.bb':
		{
			'font-weight': 'bold',
			'border-radius':'100'
		},
		'span.big, span.bb':
		{
			'font-size': 'x-large'
		}
	}).refresh();

css.removeRules(['span.bold, span.bb', 'span.big, span.bb']).refresh();

css.addProp('span.bold, span.bb', 'color', 'red').refresh();

css.removeProp('span.bold, span.bb', 'color').refresh();

css.destroy();

A More Sophisticated Usage:

	var url = '/_library/image/badge/credits.png', badges = '', hover = '', rules = {};
	
	for(var i = 0; i != 8; i++)
	{
		var badge	= (badges ? ', ' : '') + 'A#badge_' + i;
		
		badges		+= badge;
		hover		+= badge + ':hover';
		
		rules['A#badge_' + i]	= {
			'background':	'url(' + url + ') -' + (i * 80) + 'px',
			'float':		(i < 3 ? 'left' : 'right'),
			'margin':		(i < 3 ? '0px 8px 0px 0px' : '0px 0px 0px 8px')
		};
	}
	
	rules[badges]	= {
		display:	'block',
		opacity:	0.50,
		width:		'80px',
		height:		'28px'
	};
	rules[hover]	= {
		opacity:	1.00
	};
	
	css.addRules(rules).refresh();
	
*/
/* ##################### */
