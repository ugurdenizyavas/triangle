/*
	File: console.js
	Purpose: Console and debug related functions.	
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Short cuts
	// ---------------------------------------------------------------------------------------------- //

	$.extend(id /* Basic */,
	{
		error: error, warning: warning, warn: warning, note: note, info: note, hint: hint, tell: tell, assert: assert,
		debug: log, inspect: inspect, measure: measure, section: section, count: count, stop: stop
	});
	
	id.sh /* Shell */ = 
	{
		setDebug: setDebug, setMeasure: setMeasure, setMessages: setMessages, setLevel: setMessages, 
		setCriticalStop: setCriticalStop,
		help: help,

		settings: settings, 
		parameters: parameters,

		// Others packages ...

		timer:     id.timer    ? id.timer.dump		     : function() { return none('timer'); },
		templates: id.template ? id.template.dump	     : function() { return none('template'); },
		keys:      id.key      ? id.key.dump		     : function() { return none('key'); },
		tests:     id.test     ? id.test.dump		     : function() { return none('test'); },
		calls:     id.object   ? id.service.dump	     : function() { return none('service'); },
		objects:   id.object   ? id.object.dump        : function() { return none('object'); },
		object:    id.object   ? id.object.getObject   : function() { return none('object'); },
		offline:   id.service  ? id.service.setOffline : function() { return none('service'); },
		isOffline: id.service  ? id.service.isOffline  : function() { return none('service'); }
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	var prefs = 
	{ 
		formatted: true, 
		grouped: true, 
		sectioned: true,
		separator: '-',
		criticalStop: false
	};

	id.console =
	{
		id: 'console',
	
		error: error, warning: warning, warn: warning, note: note, hint: hint, tell: tell,
		debug: log,	measure: measure, 
		assert: assert, info: note,
		setDebug: setDebug, setMeasure: setMeasure,
		setMessages: setMessages, setLevel: setMessages,
		
		setCriticalStop: function(flag) { prefs.criticalStop = flag; },
		setFormatted: function(flag) { prefs.formatted = flag; },
		setGrouped: function(flag) { prefs.grouped = flag; if (console && console.groupEnd) console.groupEnd(); }
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var me = id.meOf(id.console);

	var level = { error: 'error', warning: 'warning', note: 'note', hint: 'hint', debug: 'debug', measure: 'measure' };
	var last;

	// ---------------------------------------------------------------------------------------------- //
	// Level
	// ---------------------------------------------------------------------------------------------- //
	
	var messages = { id: 'messages', mode: true, filter: null };

	function assert(condition, message, options)
	{
		if (typeof(console) == 'undefined')
			return false;

		// Work in progress
	
		console.assert(condition, message);
		if (!condition) debugger;
		
		// Something more ..
	}

	function error(message, options)   
	{ 
		var critical = options && options.critical;

		if (critical /* show always */ || wanted(level.error))
		{
			tell((critical ? 'FATAL' : 'ERROR')+getClock()+message, { error: true, critical: critical }); 
	
			if (critical)
			{
				// Open red box ..
				// .....
				// ..............
			
				if (prefs.criticalStop)
					stop(true, 'critical error!');
			}
		}
		
		return false;
	}
	
	function warning(message) 
	{ 
		if (wanted(level.warning))
			tell('WARN '+getClock()+message, { warning: true });
	
		return false;
	}
	
	function note(message)    
	{ 
		if (wanted(level.note))
			return tell('Note '+getClock()+message, { note: true }); 
	}

	function hint(message)    
	{ 
		if (wanted(level.hint))
			return tell('Hint '+getClock()+message, { hint: true }); 
	}
	
	function inspect(item, name)
	{ 
		var info = (name === undefined) ? 'Type: '+classOf(item) : name+" ('"+classOf(obj)+"')";
		
		tell("Check"+getClock()+info, { note: true });
		tell(item, { inspect: true }); 

		function classOf(o) { return o === undefined ? "undefined" : (o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift()); }
	}
	
    function tell(message, options) 
    { 
        if (typeof(console) == 'undefined')
            return false;
    
        options = options || {};
    
        if (messages.mode || options.always)
        {            
            if (prefs.formatted)
            {            
                if (window.Cordova)
                {
                    console.log(message);
                } else {
                    if (options.error) console.error(message); 
                    else if (options.warning) console.warn(message); 
                    else if (options.debug && !id.isIE()) console.debug(message); 
                    else if (options.note) console.info(message); 
                    else if (options.watch && !id.isIE()) console.debug(message); 
                    else if (options.inspect && !id.isIE()) console.dir(message); 
                    else console.log(message); 
                }
            }
            else console.log(message);
        }
            
        last = message;

        // TODO: Logging service ..
    }

	function setMessages(flag)
	{
		set(messages, flag);
		
		setDebug(messages.mode && (!messages.filter || id.isMember(messages.filter, level.debug) != null));
		setMeasure(messages.mode && (!messages.filter || id.isMember(messages.filter, level.measure) != null));
	}
	
	function setCriticalStop(flag)
	{
		if (flag == undefined) messages.criticalStop = !messages.criticalStop;
		else messages.criticalStop = flag;
		
		tell('Critical stop is now '+(messages.criticalStop ? 'on': 'off')+'.', {  always: true });
	}

	function wanted(level)
	{
		return messages.mode && (!messages.filter || id.isMember(messages.filter, level));
	}

	// ---------------------------------------------------------------------------------------------- //
	// Logging
	// ---------------------------------------------------------------------------------------------- //

	var debug = { id: 'debug', mode: false, filter: null, maxLength: 100 /* Windows clients .... */, counter: [] }

	function setDebug(flag) { return set(debug, flag); }

	function log(message, options) 
	{ 
		if (!debug.mode) 
			return false;
			
		options = options || {};
		
		if (options.type && debug.filter && !id.isMember(debug.filter, options.type)) return false;
		if (id.isIE())	if (message.length > debug.maxLength) message = message.slice(0, debug.maxLength-3) + ' ..';
			
		tell('Debug'+getClock()+message, { debug: true }); 
	
		if (options.hold)
			debugger;
	
		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Logging Tools
	// ---------------------------------------------------------------------------------------------- //

	function section(options)
	{
		if (typeof(console) == 'undefined')
			return false;
	
		options = options || {};
	
		if (prefs.grouped && console.group)
		{
			// Note: IE doesn't support
			// this feature.
		
			console.groupEnd();
			console.group(options.label || '');
		}
		else if (prefs.sectioned)
		{
			if (options.separator || last != prefs.separator)
			{
				var separator = options.separator ||prefs.separator;
				var out = options.label ? '>>>>> '+options.label : separator;
			
				id.tell(' ');
				id.tell(out, options);
			}
		}
	}
	
	function count(milestone, options)
	{
		if (!debug.mode) 
			return false;

		var counter = debug.counter;
	
		if (options && options.reset)
			for (var i in counter)
				counter[i] = 0;
	
		if (!counter[milestone])
			counter[milestone] = 0;
			
		counter[milestone]++;
		
		id.debug(me+'Counter at '+milestone+' is '+counter[milestone]);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Measurement
	// ---------------------------------------------------------------------------------------------- //
	
	var measure = { id: 'measure', mode: false, filter: null, stops: [] }

	function setMeasure(flag) { return set(measure, flag); }

	function measure(name, options)
	{
		if (typeof(console) == 'undefined')
			return false;

		// Measuring the time between two points,
		// connected by name.

		options = options || {};

		if (!measure.mode) return false;
		if (options.type && measure.filter && !id.isMember(measure.filter, options.type)) return false;

		var stops = measure.stops;
		var time = new Date;
		var i = name ? name : 'common';

		if (options.reset) stops[i] = 0;

		// Console time/timeEnd function delivers 
		// identical values, therefore disabled.

		if (stops[i])
		{
			// console.timeEnd(i);
			tell('Watch'+getClock()+id.firstLetter(i)+(options.info ? ': '+options.info : '')+': '+(time - stops[i])+' ms', { watch: true }); 
			if (!options.cont) stops[i] = 0;
		}
		else 
		{
			// console.time(i);
			stops[i] = time;
		}

		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Misc
	// ---------------------------------------------------------------------------------------------- //
	
	function stop(condition, note)
	{
		if (condition === undefined || condition)
		{
			if (note) id.tell(me+'STOP by '+note);
			debugger;
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Library
	// ---------------------------------------------------------------------------------------------- //
	
	function set(obj, flag)
	{
		var filtered = false;
		var before = obj.mode;
		
		if (flag === undefined) flag = !obj.mode;

		if (id.isString(flag)) 
		{
			if (flag == '') flag = '*';
			flag = flag.toLowerCase();

			if (id.isMember(['all', '*'], flag)) { obj.mode = true; obj.filter = null; }
			else { obj.filter = flag.split(' '); filtered = obj.mode = true; }
		}
		else if (id.isArray(flag)) { obj.filter = flag; filtered = obj.mode = true; }
		else if (flag == true || flag == false) obj.mode = flag;

		if (obj.mode != before || filtered) 
			id.note(me+(obj.mode ? 'START' : 'STOPP')+' '+obj.id+' mode'+(filtered ? ', filtered by { '+obj.filter+' }' : '')+'.', { always: true }); 
		
		return true;
	}

	function getClock()
	{
		var time = new Date;
		var clock = (time.getHours() < 10 ? '0' : '')+time.getHours()+':'+(time.getMinutes() < 10 ? '0' : '')+time.getMinutes()+':'+(time.getSeconds() < 10 ? '0' : '')+time.getSeconds(); 

		return ' ['+clock+'] ';
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Shell
	// ---------------------------------------------------------------------------------------------- //
	
	function help()
	{
		section({ label: 'Show settings and current resources:' });
		
		tell('id.sh.settings() - Show the console settings (level, filter, flags).');
		tell('id.sh.parameters() - Show the application parameters ste by META.');
		tell('id.sh.keys() - Show the bound keys.');
		tell('id.sh.timer() - Show in/active timer.');
		tell('id.sh.tests() - Show possible testcases.');
		tell('id.sh.objects() - Show active objects.');
		tell('id.sh.calls() - Show active service calls.');
		
		section({ label: 'Adjust console settings:'});
		
		tell('id.sh.setLevel([true|false|<filter>]) - Switch console logging on (true or filter like "error warning debug" or "*"), off (false) or toggle (no flag).');
		tell('id.sh.setDebug([true|false|<filter>]) - Switch debugging on (true or filter like "object service table" or "*"), off (false) or toggle (no flag).');
		tell('id.sh.setMeasure([true|false|<filter>]) - Switch time measuring on (true or filter like "service object chart" or "*"), off (false) or toggle (no flag).');
		tell('id.sh.setCriticalStop(true|false) - Switch stop at critical error on (true) or off (false).');

		return true;
	}
	
	function settings()
	{
		section({ label: 'Settings' });
		
		tell('Console is '+(messages.mode ? (messages.filter ? 'filtered by { '+messages.filter+' }' : 'on'): 'off')+'.', { always: true });
		tell('Debugging is '+(debug.mode ? (debug.filter ? 'filtered by "'+debug.filter+'"' : 'on'): 'off')+'.', { always: true });
		tell('Measuring is '+(measure.mode ? (measure.filter ? 'filtered by "'+measure.filter+'"' : 'on'): 'off')+'.', { always: true });
		tell('Critical stop is '+(messages.criticalStop ? 'on': 'off')+'.', {  always: true });

		return true;
	}
	
	function parameters()
	{
		section({ separator: ' '});

		for (var i = 0, n = 0; i < id.parameters.length; i++)
		{
			parameter = id.parameters[i];
		
			if (parameter.value)
			{
				tell('Parameter "'+parameter.name+'" = "'+parameter.value+'".', { always: true });
				n++;
			}
		}

		tell(n+' parameters set.', { always: true });
		section({ separator: ' '});
					
		return true;
	}
		
	function none(aPackage) { error(me+'Package "'+aPackage+'" not loaded!'); }
		
}());