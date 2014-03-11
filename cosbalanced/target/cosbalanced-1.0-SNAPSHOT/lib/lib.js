/*
	File: lib.js
	Purpose: Some useful stuff besides objects, packages.
	
	$Author: udy $
*/

(function()
{

	// ---------------------------------------------------------------------------------------------- //
	// Lib Package Interface
	// ---------------------------------------------------------------------------------------------- //
	
	$.extend(id,
	{
		// ------------------------------------------------------------------------------------------- //
		// Identity
		// ------------------------------------------------------------------------------------------- //
		
		meOf: function(p) { return p ? id.firstLetter(p.id || p)+': ' : id.error('Unknown me!', { critical: true }); },
		namespaceOf: function(p) { return '.'+(p.id || p); },
		idOf: function(p) { return (p.id || p); },

		// ------------------------------------------------------------------------------------------- //
		// Type
		// ------------------------------------------------------------------------------------------- //
		
		typeOf: typeOf,
		
		isFunction: function(p)  { return p && typeOf(p) === 'function'; },
		isBoolean: function(p)   { return p && typeOf(p) === 'boolean'; },
		isString: function(p)    { return p && typeOf(p) === 'string'; },
		isNumber: function(p)    { return p && typeOf(p) === 'number'; },
		isValue: function(p)     { return p && (typeOf(p) === 'number' || typeOf(p) === 'string'); },
		isObject: function(p)    { return p && typeOf(p) === 'object'; },
		isArray: function(p)     { return p && typeOf(p) === 'array'; },
		htmlOf: function(data)   { return data && data.match(/<div.*id.*>/)+' ..' || 'something ..'; },
		firstLetter: function(p) { return p && p.substring(0, 1).toUpperCase()+p.substring(1).toLowerCase(); },
		pluralOf: function(p)    { return p ? (p === 1 ? '' : 's') : ''; },
		dumpOf: function(p)      { return id.isObject(p) ? '{...}' : id.isArray(p) ? '[...]' : id.isFunction(p) ? p+'()' : p; },
		
		// ------------------------------------------------------------------------------------------- //
		// Browser and Devices
		// ------------------------------------------------------------------------------------------- //

		clickOf: function(ns) { return 'click'+(ns ? ns : ''); },
	
		// Browser or device detection
	
		isIE: function(options) 
		{ 
			if ($.browser.msie)
			{
				options = options || {};
				var version = Number($.browser.version.slice(0,1));
				
				if (options.min && options.min > version) return false;
				if (options.max && options.max < version) return false;
				
				return true;
			}
		
			return false;
		},
		
		isMozilla: function() { return $.browser.mozilla; },
		isOpera: function()   { return $.browser.opera; },
		isWebkit: function()  { return $.browser.webkit || $.browser.safari; },
		isAndroid: function() { return navigator.userAgent.indexOf("Android") !== -1; },
		isIPhone: function()  { return navigator.userAgent.indexOf("iPhone") !== -1; },
		isIPad: function()    { return navigator.userAgent.indexOf("iPad") !== -1; },
		isIPod: function()    { return navigator.userAgent.indexOf("iPod") !== -1; },
		isIDevice: function() { return id.isIPhone() || id.isIPad() || id.isIPod() || id.isAndroid(); },
		isIOSIPad: function() { return  typeof ios == "object" },
		isIOS: function() { return id.isIOSIPad(); },
        
		// Special object detection 
	
		hasWebKitCSSMatrix: function() { return typeof WebKitCSSMatrix === "object"; },
		hasTouch: function() { return typeof Touch === "object"; },
		hasWebKitAnimationEvent: function() { return typeof WebKitTransitionEvent === "object"; },

		// Aliases
	
		isSafari: id.isWebkit, isChrome: id.isWebkit, isFF: id.isMozilla,
		isTrident: id.isIE, isGecko: id.Mozilla, isPresto: id.isOpera,
		
		// ------------------------------------------------------------------------------------------- //
		// GUI Stuff
		// ------------------------------------------------------------------------------------------- //
	
		setPointer: function(type) { document.body.style.cursor = type; },
        
		interact: function($elm, options) { 
			options = options || {};
			options.ns = options.ns || '';
			
			if (!$elm.exist) return false;
			
			if (id.isIOS() || id.isIDevice()) {
				if (options.outside) type = 'touchstartoutside';
				else type = 'tap';
				
				$elm.unbind(type + options.ns).addTouchEvents().bind(type + options.ns, options.callback);
			} else {
				if (options.outside) type = 'clickoutside';
				else type = 'click';
				
				$elm.unbind(type + options.ns).bind(type + options.ns, options.callback);
			}
	
		},
		
		animatePages: function($from, $to, animation) {
            if($to.length === 0){
                return false;
            }
            
            var callback = function(event){

                if (animation && animation.name) {
                    $to.removeClass('in reverse ' + animation.name);
                    $from.removeClass('selected out reverse ' + animation.name);
                } else {
                    $from.removeClass('selected');
                }

                $to.trigger('pageAnimationEnd', { direction: 'in' });
    	        $from.trigger('pageAnimationEnd', { direction: 'out' });
            }
            
            $(':focus').blur();

            scrollTo(0, 0);

            $from.trigger('pageAnimationStart', { direction: 'out' });
            $to.trigger('pageAnimationStart', { direction: 'in' });
            
            if (animation && animation.name) {
                $to.one('webkitAnimationEnd', callback);
                $to.addClass(animation.name + ' in selected ' + (animation.direction ? ' reverse' : ''));
                $from.addClass(animation.name + ' out' + (animation.direction ? ' reverse' : ''));
            } else {
                $to.addClass('selected');
                callback();
            }

            return true;
        },
	
		// ------------------------------------------------------------------------------------------- //
		// Tools
		// ------------------------------------------------------------------------------------------- //

		now: function()
		{
			return (new Date()).getTime();
		},

		isMember: function(set, item)
		{
			if (set && item) 
			{
				if (id.isArray(item))
				{
					for (var i = set.length; i--; ) 
						for (var j = item.length; j--; ) 
							if (set[i] === item[j])
								return item[j];
				}
				else
				{
					for (var i = set.length; i--; ) 
						if (set[i] === item)
							return item;
				}
			}
							
			return null;
		},
		
		isEmpty: function(item)
		{
			if (item === undefined || item === null) return true;
			if (id.isArray(item)) return item.length === 0;
			if (id.isNumber(item)) return false;
			if (id.isObject(item)) return $.isEmptyObject(item);
			if (id.isString(item)) return item === '';
		},
	
		getParameter: function(name, options)
		{
			// The homepage index.html delivers via META tag
			// some parameters for the application.
		
			// id.debug('Setting '+name+' with "'+$('meta[name='+name+']').attr('content')+'"', { type: 'startup' });

			var parameter = $('meta[name="'+name+'"]').attr('content');
			
			if (parameter && !(options && options['native']))
			{
				if (id.isMember(['yes', 'on', 'true', 'yep', 'set'], parameter.toLowerCase())) parameter = true;
				else if (id.isMember(['no', 'off', 'false', 'nope', 'none', 'na', 'ignore'], parameter.toLowerCase())) parameter = false;
				else if (Number(parameter) !== NaN && String(Number(parameter)) === parameter) parameter = Number(parameter);
			}
					
			return parameter;
		},
		
		toSeconds: toSeconds,
		numberFormat: numberFormat, 
		percentFormat: percentFormat,
		splitMultiLine: splitMultiLine,
		arrayIndexOf: arrayIndexOf,
		hasTextContent: hasTextContent,
		
		setTooltip: setTooltip,
		
		// Alias
		
		formatNumber: numberFormat,
		formatPercent: percentFormat,
		bytesToSize: bytesToSize,
		numbersToSize: numbersToSize,
		secondsToHms: secondsToHms,
		setDecimalPoint: setDecimalPoint
	});
	
	function toSeconds(parameter)
	{
		var units = 
		[
			{ unit: 'day', factor: 24*60*60 }, 
			{ unit: 'hour', factor: 60*60 }, 
			{ unit: 'minute', factor: 60 }, 
			{ unit: 'second', factor: 1 }
		];
		
		var expression = [];
		var time;
		
		if (id.isNumber(parameter)) 
		{ 
			expression.push(parameter);
			time = expression[0];
		} 
		else 
		{ 
			expression = parameter.match(/^(\d*)(.*)$/);
			time = Number(expression[1]);
		}
		
		var unit = expression[2] ? expression[2] : 0;

		for (var i = 0; unit && i < units.length; i++)
			if (unit.indexOf(units[i].unit) !== -1)
				time = time * units[i].factor;

		return time;
	}

	function typeOf(p)
	{
//		var t = typeof(p);
//		var xt = t;
//
//		switch (t)
//		{
//			case 'string':
//				xt = t;
//				break;
//
//			case 'object':
//				if (p === null) xt = 'null';
//				else if (p.constructor === Array) xt = 'array';
//				break;
//		 }
//
//		return xt;

		return jQuery.type(p);
	}
	
	function numberFormat(value, options) 
	{
		if (value === null || value === undefined)
			return '';
			
		options = options || {};
		
		if (options.decimals === undefined) {
			var decimalLength = value.toString().split('.');
			if (decimalLength.length > 1) {
				options.decimals = decimalLength[1].length; 
			}
		} 
	
		// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_number_format/
		// #CHANGED by LR: European decPoint/thousandsSep; 1 decimal as default
				
		var n	= value, 
			 c = isNaN(options.decimals = Math.abs(options.decimals)) ? 0 : options.decimals,
			 d = options.decPoint === undefined ? "," : options.decPoint,
			 t = options.thousandsSep === undefined ? "." : options.thousandsSep, s = n < 0 ? "-" : "",
			 i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	 
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}
	
	function percentFormat(value, options)
	{
		if (value === null || value === undefined)
			return '';
	
		options = options || {};
		
		if (options.decimals === undefined) {
			var decimalLength = value.toString().split('.');
			if (decimalLength.length > 1) {
				options.decimals = (decimalLength[1].length > 1 ? decimalLength[1].length - 2 : 0); 
			} else {
				options.decimals = 0;
			}
		} 
		
		options.decPoint = options.decPoint || ',';
	
		value = numberFormat(value*100, options);
	
		if (options.optimized)
		{
			if (value == '100,0') value = '100';
			if (value == '0,0') value = '0';
		}

		if (value.length == 2 && options.decimals > 0) value += ',0';
		
		return value+'%';
	}
    
    
    function setDecimalPoint(value) {
		value = value.toString().replace('.', ',');
		
		return value;
	}
	
	function bytesToSize(value, options)
   {	
		options = options || {};
		options.decimals = options.decimals || 0; 
		
        var kilobyte = 1024;
        var megabyte = kilobyte * 1024;
        var gigabyte = megabyte * 1024;
        var terabyte = gigabyte * 1024;
    
        if ((value >= 0) && (value < kilobyte)) {
            return value + ' B';
    
        } else if ((value >= kilobyte) && (value < megabyte)) {
            return (value / kilobyte).toFixed(options.decimals) + ' KB';
    
        } else if ((value >= megabyte) && (value < gigabyte)) {
            return (value / megabyte).toFixed(options.decimals) + ' MB';
    
        } else if ((value >= gigabyte) && (value < terabyte)) {
            return (value / gigabyte).toFixed(options.decimals) + ' GB';
    
        } else if (value >= terabyte) {
            return (value / terabyte).toFixed(options.decimals) + ' TB';
    
        } else {
            return value + ' B';
        }
    }
    
    function numbersToSize(value, options)
    {	
        options = options || {};
		options.decimals = options.decimals || 0; 
		
        var tousand = 1000;
        var million = tousand * 1000;
        var billion = million * 1000;
        var trillion = billion * 1000;
        
        var re = new RegExp( '(.[0]{1,'+ options.decimals +'})$' );
    
        if ((value >= 0) && (value < tousand)) {
            return value;
    
        } else if ((value >= tousand) && (value < million)) {
        	
            return (value / tousand).toFixed(options.decimals).replace(re, "") + ' T';
    
        } else if ((value >= million) && (value < billion)) {
            return (value / million).toFixed(options.decimals).replace(re, "") + ' M';
    
        } else if ((value >= billion) && (value < trillion)) {
            return (value / billion).toFixed(options.decimals).replace(re, "") + ' B';
    
        } else if (value >= trillion) {
            return (value / trillion).toFixed(options.decimals).replace(re, "") + ' T';
    
        } else {
            return value;
        }
    }
    
    function secondsToHms(totalSec) 
   	{
		d = Number(totalSec);

		var seconds = totalSec % 60;
		var minutes = parseInt( totalSec / 60 ) % 60;
		var hours = parseInt( totalSec / 3600) % 24;
		var days = parseInt( totalSec / 86400);
		var months = parseInt( totalSec / 2628000);
		var years = parseInt( totalSec / 31536000);
				
		if ((totalSec >= 0) && (totalSec < 60)) {
            return (seconds > 0 ? seconds + 's' : 0 );
    
        } else if ((totalSec >= 60) && (totalSec < 3600)) {
        	
            return (minutes > 0 ? minutes+'m ' + seconds+'s' : "0m");
    
        } else if ((totalSec >= 3600) && (totalSec < 86400)) {
        	
            return (hours > 0 ? hours+'h ' + minutes+'m' : "0h");
    
        } else if (totalSec >= 86400) {
        	
            return (days > 0 ? days+'d ' + hours+'h' : "0d");
    
        } else if (totalSec >= 2628000) {
        	
            return (months > 0 ? months+'m ' + days+'d' : "0m");
    
        } else if (totalSec >= 31536000) {
        	
            return (years > 0 ? years+'y ' + months+'m' : "0y");
    
        } else {
            return totalSec;
        }
	}
	
	function splitMultiLine(st,n) {
		var b = ''; 
		var s = st;
		while (s.length > n) {
			var c = s.substring(0,n);
			var d = c.lastIndexOf(' ');
			var e =c.lastIndexOf('<br/>');
			if (e != -1) d = e; 
			if (d == -1) d = n; 
			b += c.substring(0,d) + '<br/>';
			s = s.substring(d+1);
		}
		return b+s;
	}
	
	function arrayIndexOf(a, fnc) {
		if (!fnc || typeof (fnc) != 'function') {
			return -1;
		}
		if (!a || !a.length || a.length < 1) return -1;
		for (var i = 0; i < a.length; i++) {
			if (fnc(a[i])) return i;
		}
		return -1;
	}

	function hasTextContent( htmlString )
	{	
		var foundContent = false,
		    myDom = $.makeArray ( $( "<div>"+htmlString+"</div>" ) )
			 contentAttribut = id.isIE() ? "innerText": "textContent";
		
		// node : jQuery.Dom.Object
		function checkNode( node )
		{
			try{
				var textContent = node[contentAttribut];
			}catch(msg){
				id.warn( "lib.js::hasTextContent cannot access textual content of node." );
				// Here we don't know, so we assume some content to the users rescue.
				return true;
			};
			
			if (textContent.length > 0){
				//RADAR: refine&test criteria
				if ( /[\S]+/.test( textContent ) ) return true;
			}
			return false;
		};
		
		// myDom : jQuery.Collection
		function checkDom( myDom )
		{
			var hasContent = false,
				 nodeCount = myDom.length,
				 node;
			
			for (var i=0; i < nodeCount; i++) {
				node = myDom[i];
				hasContent = checkNode( node );
				if (hasContent) break;
				
				if (node.children.length > 0) return checkDom( node.children );
			};
			return hasContent;
		};
		
		foundContent = checkDom( myDom );
		id.info( "hasTextContent returns => "+String(foundContent) );
		return foundContent;
	} // eo-function hasTextContent
	
	
	function setTooltip($elm, options)
	{			
		var defaults = { maxWidth: "auto", edgeOffset: 5, defaultPosition: 'top'};
		
		if (options) {
			$.extend(true, defaults, options);
		}
		
		if(jQuery().tipTip) {
			$elm.tipTip(defaults);
		}
	}

}());

// ------------------------------------------------------------------------------------------------- //
//	jQuery Basic Exentions
// ------------------------------------------------------------------------------------------------- //

jQuery.fn.exist = function() { return this.length > 0; }
jQuery.fn.missed = function() { return this.length == 0; }
jQuery.fn.objectOf = function(obj) { return obj ? this.data('object', obj.getIndex()) : (this.data('object') ? id.object.getObject(this.data('object')) : null); }

// ------------------------------------------------------------------------------------------------- //
//	Extension of Date object
// ------------------------------------------------------------------------------------------------- //

Date.prototype.getISOWeek = function(utc) 
{
	 var y = utc ? this.getUTCFullYear(): this.getFullYear();
	 var m = utc ? this.getUTCMonth() + 1: this.getMonth() + 1;
	 var d = utc ? this.getUTCDate() : this.getDate();
	 // If month jan. or feb.
	 if (m < 3) {
		var a = y - 1;
		var b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
		var c = ( (a - 1) / 4 | 0) - ( (a - 1) / 100 | 0) + ( (a - 1) / 400 | 0);
		var s = b - c;
		var e = 0;
		var f = d - 1 + 31 * (m - 1);
	 }
	 // If month mar. through dec.
	 else {
		var a = y;
		var b = (a / 4 | 0) - ( a / 100 | 0) + (a / 400 | 0);
		var c = ( (a - 1) / 4 | 0) - ( (a - 1) / 100 | 0) + ( (a - 1) / 400 | 0);
		var s = b - c;
		var e = s + 1;
		var f = d + ( (153 * (m - 3) + 2) / 5 | 0) + 58 + s;
	 }
	 var g = (a + b) % 7;
	 // ISO Weekday (0 is monday, 1 is tuesday etc.)
	 var d = (f + g - e) % 7;
	 var n = f + 3 - d;
	 if (n < 0)
		var w = 53 - ( (g - s) / 5 | 0);
	 else if (n > 364 + s)
		var w = 1;
	 else
		var w = (n / 7 | 0) + 1;
	 return w;
}

Date.prototype.getFirstDay = function() {
	var tmpDate = new Date(Date.parse(this));
	tmpDate.setDate(1);
	return tmpDate.getDay();
}

Date.prototype.getWeekNumber = function() {
	var tempDate = new Date(this);
	tempDate.setDate(tempDate.getDate() - (tempDate.getDay() + 6) % 7 + 3);
	var dms = tempDate.valueOf();
	tempDate.setMonth(0);
	tempDate.setDate(4);
	return Math.round((dms - tempDate.valueOf()) / (604800000)) + 1;
}

Date.prototype.getWeekYear = function()
{
	var date = new Date(this);
	var year = date.getFullYear();

	if (date.getMonth() == 11 && date.getISOWeek(false).toString() == 1){
		year = year + 1;
	} else if (date.getMonth() == 0 && date.getISOWeek(false).toString() >= 52){
		year = year - 1;
	}

	return year;
}

Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.floor(time / 24*60*60*1000);
}

// ------------------------------------------------------------------------------------------------- //
//	Extension of String Object
// ------------------------------------------------------------------------------------------------- //

String.prototype.nl2br = function()
{
	var text = escape(this);
	var re_nlchar = null;
 
	if(text.indexOf('%0D%0A') > -1) // DOS
	{
		re_nlchar = /%0D%0A/g ;
	}
	else if(text.indexOf('%0A') > -1) // UNIX
	{
		re_nlchar = /%0A/g ;
	}
	else if(text.indexOf('%0D') > -1) // OLD MAC
	{
		re_nlchar = /%0D/g ;
	}
 
	text = (re_nlchar != null) ? unescape(text.replace(re_nlchar,'<br />')) : unescape(text);
	return text
}

String.prototype.toEntity = function()
{
	var value = String(this);

	if (value)
	{
		if (value.indexOf('<') != -1) value = value.replace(/</g, '&lt;');
		if (value.indexOf('>') != -1) value = value.replace(/>/g, '&gt;');
		// if (value.indexOf('\n') != -1) value = value.replace(/\\n/g, '<br/>');
	}
		
	return value;			
}
		
String.prototype.fromEntity = function()
{
	var value = String(this);

	if (value)
	{
		if (value.indexOf('&lt;') != -1) value = value.replace(/&lt;/g, '<');
		if (value.indexOf('&gt;') != -1) value = value.replace(/&gt;/g, '>');
		// if (value.indexOf('<br/>') != -1) value = value.replace(/<br>/g, '\n');
	}
		
	return value;           
}

// ------------------------------------------------------------------------------------------------- //
//	Extension of Array Object
// ------------------------------------------------------------------------------------------------- //

Array.prototype.copy = function()
{
	var array = this;
	
	if (!id.isArray(this)) 
		array = [this];
	
	return array.slice(0, array.length);
}

Array.prototype.remove = function(index)
{
	return this.splice(index, 1);
}

