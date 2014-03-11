/*
	File: timer.js
	Purpose: Object timer (automatic reloads, ...).

	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Preferences
	// ---------------------------------------------------------------------------------------------- //
	
	var Prefs = 
	{
		debugTimeout: 0 /* Use this as a preferred timer (seconds) for debugging, should be 0. */
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Package Public Interface
	// ---------------------------------------------------------------------------------------------- //
	
	id.timer /* Namespace */ =
	{
		id: 'timer',
	
		call: call,
		clear: clear,
		
		init: init,
		update: init,
		exit: exit,

		start: function(obj) { if (clients[obj.getIndex()]) clients[obj.getIndex()].start(); },
		stop: function(obj) { if (clients[obj.getIndex()]) clients[obj.getIndex()].stop(); },
		
		setDebugTimeout: function(timeout) { Prefs.debugTimeout = Number(timeout); }
	};

	$.extend(id, 
	{ 
		thread: function(fn, data) { return id.timer.call(fn, 1, data); } 
	});

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var clients = [];
	var me = id.meOf(id.timer);
	var meNew = 'New '+id.meOf(id.timer);
	var cos  = { init: 'init' };

	// ---------------------------------------------------------------------------------------------- //
	// Call - substitute of setTimeout with data and other missed features
	// ---------------------------------------------------------------------------------------------- //

	var jobs = [];
	
	// call(fn, timeout)
	// call(fn, { at: time })
	// call(fn, { after: timeout })
	// call(fn, { every: interval })
	// call(fn, timeout, data)

	function call(fn, timeout, data, options)
	{
		options = options || {};
	
		// First,
		// some time conversions.
	
		if (id.isValue(timeout)) timeout = { after: timeout };
		if (timeout.after) id.toSeconds(timeout.after);
		if (timeout.every) id.toSeconds(timeout.every);

		var now = id.now();
		var at = timeout.at || now+(timeout.after || timeout.every);

		// Second
		// register the timer event
	
		// id.debug(me+'REGISTER '+idOf(data));
		jobs.push({ at: at, every: timeout.every, fn: fn, data: data, options: options });

		reset();

		return next(now);
	}
	
	function next(now)
	{
		var job = null;
	
		for (var i = 0, n = jobs.length; i < n; i++)
		{
			if (!job) job = jobs[i];
			else if (job.at > jobs[i].at) job = jobs[i];
		}
			
		if (job) 
		{
			job.timer = setTimeout(kick, Math.max(job.at-now, 1));
			// id.debug(meNew+'START '+idOf(job.data)+' ['+job.timer+'('+(job.at-now)+')'+']');
			
			return job.timer;
		}
		
		return 0;
	}

	function kick()
	{
		var now = id.now();

		for (var i = 0; i < jobs.length; i++)
			if (now > jobs[i].at)
			{
				var job = jobs[i];

				// id.debug(meNew+'KICK '+idOf(job.data)+' ['+(job.timer || '-')+']');
				job.fn(job.data);
	
				if (job.every) job.at += job.every;  
				else jobs.remove(i);
			}
		
		next(now);
	}	
		
	function clear(timer)
	{
		for (var i = 0; i < jobs.length; i++)
		{
			if (jobs[i].timer)
			{
				var job = jobs[i];
				
				if (timer && job.timer !== timer)
					continue;
			
				reset(job);

				// id.debug(me+'CLEAR '+idOf(job.data)+' ['+job.timer+']'+(jobs.length-1 ? ', '+jobs.length-1+' job'+id.pluralOf(jobs.length-1)+' left.' : ''));

				if (job.options.jobByClearing) job.fn(job.data);
				jobs.remove(i);
	
				next(id.now());
	
				return true;
			}
		}
	
		return false;
	}
	
	function reset(job)
	{
		if (job) _reset(job);
		else for (var i = jobs.length; i--; )
			if (jobs[i].timer)
				_reset(jobs[i]);
			
		function _reset(job)
		{
			// id.debug(me+'RESET '+idOf(jobs[i].data)+' ['+jobs[i].timer+']');
				
			clearTimeout(job.timer);
			delete job.timer;
		}
	}
	
	function idOf(data) { return data ? (id.isObject(data) ? (data.obj && data.obj.getIndex()) || (data.obj && data.obj.id) || data.getIndex() || data.id || 'UNKNOWN': data) : 'UNKNOWN'; }
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //

	function init(obj, service)
	{
		var index = obj.getIndex();
		
		// Interims
		
		obj.atEnter = id.timer.start;
		obj.atLeave = id.timer.stop;
	
		if (!clients[index]) {
			clients[index] = new Timer(obj, service);
		} else {
			//if (obj.mode && obj.mode == cos.init) {
			// we need more robustness in COS workflows, so erase and set again
				exit(obj);
				clients[index] = new Timer(obj, service);
			//}
		}
	
		clients[index].start(obj, service);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Exit
	// ---------------------------------------------------------------------------------------------- //
	
	function exit(obj)
	{
		var index = obj.getIndex();
	
		if (clients[index])
		{
			// debug('EXIT '+index+'.');

			clients[index].stop();
			
			delete clients[index];
			clients[index] = 0;
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Timer (OLD)
	// ---------------------------------------------------------------------------------------------- //

	function Timer(obj, service)
	{
		// Init

		var index = obj.getIndex();
		var label = service.label ? service.label : (service.id ? service.id : service.url);
		var clock = 0, time = 0, setTimer;

		if (service.after) 
		{
			setTimer = setTimeout;
			time = id.toSeconds(service.after); 
		}
		else // service.every 
		{
			setTimer = setInterval;
			time = id.toSeconds(service.every);
		}
		
		// debug('INIT '+info()+'.');

		// Public functions

		return public =  
		{
			start: function(aObj, aService)
			{
				var action = 'START';
	
				// The parameters ..
				// may have been changed.
	
				obj = aObj || obj;
				service = aService ||service;
	
				if (clock /* timer already set */) 
				{
					action = 'RESTART';
					this.stop(true);
				}
				
				clock = setTimer(atTime, timeOf(time));
		
				debug(action+' '+info()+'.');
		
				function atTime()
				{
					// First,
					// is there a timed callback without
					// timer .. 
					
					if (!clock)
					{
						debug('IGNORE zombie timer '+jobOf());
						return false;
					}

					var $part = id.object.getContent().find('#'+id.cos.jQueryID(obj.id)).first();
					
					// Second,
					// have the element been removed meanwhile?
					// TODO
					// Will be redesigned with object broadcast feature,
					// which automatically disabled timers at content switch.
					
					if ($part.exist()) 
					{
						id.note(me+'KICK '+jobOf());
						id.service.call(obj, service, { $form: obj.getPlace() });
	
						if (setTimer === setTimeout)
							clock = 0;
					}
					else
					{
						debug('IGNORE late timer '+jobOf());

						if (setTimer === setInterval)
							clearInterval(clock);
			
						clock = 0;
					}
				}
			},
	
			stop: function(intern)
			{
				if (clock)
				{
					if (!intern)
						debug('STOP '+jobOf());
		
					clearTimeout(clock);
					clock = 0;
				}
			},
			
			info: info,
			isActive: isActive
		}
		
		// Private functions
			
		function jobOf() { return index+(clock ? ' ['+clock+']' : ''); }
		function info() { return jobOf()+' (call '+(setTimer == setTimeout ? 'after' : 'every')+' '+time+' second'+(time == 1 ? '' : 's')+')'; }
		function isActive() { return clock; }
	}

	function timeOf(time) 
	{ 
		var factor = 1000 /* milliseconds */; 
	
		if (Prefs.debugTimeout)
		{
			id.warn(me+'Using DEBUG TIMEOUT of '+Prefs.debugTimeout+' seconds!');
			return Prefs.debugTimeout*factor;
		}
		
		return time*factor;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function debug(message) { id.debug(me+message, { type: id.timer.id }); }

	id.timer.dump = function()
	{
		for (var i in clients)
		{
			if (clients[i].info)
				id.tell('Timer['+i+'] = { '+(clients[i].info())+(clients[i].isActive() ? ' > ACTIVE' : '')+' }');
		}
	}

	id.timer.dump2 = function()
	{
		for (var i = 0; i < jobs.length; i++)
			id.tell('Timer '+idOf(jobs[i].data)+'['+jobs[i].timer+']');
	}

}());