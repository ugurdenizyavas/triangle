/*
	File: test.js
	Purpose: Organize and run test cases
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.test = 
	{
		id: 'test',
	
		// Call by
		// META/Startup/Console
	
		setPath: function(aPath) { prefs.path = aPath; },
		setFile: function(aFile) { prefs.file = aFile; },
		setHotkey: function(aHotkey) { prefs.hotkey = aHotkey; },

		// Call by 
		// Startup/Console

		init: init,
		load: load, 
		run: run,
		stop: stop,
		cont: cont,
		dump: dump,

		isActive: function() { return plan != null; },

		// Call by 
		// Service package
		
		afterCall: afterCall,
		afterInit: afterInit,
		afterChange: afterChange
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	var Tag =
	{
		stopAtCritical: 'stopAtCritical', stopAtError: 'stopAtError', stopAtWarning: 'stopAtWarning', stopAtFailedCheck: 'stopAtFailedCheck',
		wait: 'wait', check: 'check', service: 'service', url: 'url',
		loops: 'loops', stop: 'stop', pause: 'pause', async: 'async'
	};

	var prefs = 
	{ 
		path: null, 
		file: null, 
		
		pause: 500 /* ms */, 
		pauseAfterLoop: 1000 /* ms */,
		hotkey: 'ctrl+t',
		stopAtCritical: true,
		stopAtError: true,
		stopAtWarning: false,
		stopAtFailedCheck: false,
		loops: 1,
		async: false
	};

	var me = id.meOf(id.test);
	var ns = id.namespaceOf(id.test); 

	var plan = null;
	var running = null;

	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init()
	{
		if (!prefs.file)
			return id.error(me+'No plan set for testing!');
			
		load();
		initKeys();
	}
	
	function initKeys()
	{
		id.key.register(id.test.id, onKey, [ prefs.hotkey ]);
		id.key.start(id.test.id);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Run 
	// ---------------------------------------------------------------------------------------------- //

	function run(testcase, options)
	{
		if (!plan)
			return id.error(me+'No plan set for testing!');
			
		for (var i = 0; i < plan.cases.length; i++)
			if (plan.cases[i].id == testcase)
			{
				var cp = plan.cases[i];
				var n = cp.steps.length;
			
				running = 
				{ 
					job: cp, label: labelOf(cp), 
					step: 0, steps: n, loop: 0, loops: cp.loops ||prefs.loops, 
					criticals: 0, errors: 0, warnings: 0, checks: 0 
				};

				section();
				note('START testcase'+running.label+'with '+running.steps+' step'+(running.steps != 1 ? 's' : '')+(running.loops > 1 ? 'and '+running.loops+' loops' : '.')); 
				
				exec();
				break;
			}
	}

	function exec()
	{
		var job = running.job;
		var step = job.steps[running.step];
		var pause = hasCondition(step, Tag.pause); 
	
		step.options = step.options ||{};
		step.options.async = hasOption(step, Tag.async);

		note('STEP'+labelOf(job)+'['+(running.step+1)+'/'+running.steps+']');
		section(); 
	
		call(step);
		checkStop(step);

		if (running.stopped)
			return false;

		running.step++;

		if (running.step == running.steps)
			return repeat();
		
		if (pause) note('PAUSE '+pause+' ms'); 
		setTimeout(exec, pause ||1);
	}
	
	function repeat()
	{
		if (running.loop < running.loops) 
		{
			++running.loop;
			running.step = 0;
			
			section();
			note('REPEAT testcase'+labelOf(running.job)+' loop '+running.loop+'/'+running.loops+'.');
		
			setTimeout(exec, prefs.pauseAfterLoop);
		}

		else finish();
	}
	
	function stop(reason)
	{
		if (running &&!running.stopped)
		{
			running.stopped = true;

			section();
			note('STOPPED by '+('"'+reason+'"' ||'user') +'!');
		}
	}

	function cont(reason)
	{
		if (!(running ||running.stopped))
			return id.warning(me+'Nothing to do ..')
	
		running.stopped = false;
		running.step++;
	
		section();
		note('CONTINUE '+(reason ? 'due to '+reason+'.' : '..'));
		section();

		exec();
	}
	
	function finish()
	{
		section();
		note('FINISHED testcase'+running.label+'with '+running.steps+' step'+(running.steps != 1 ? 's' : '')+(running.loops > 1 ? 'and '+running.loops+' loops' : '.')); 
		
		for (var i in running.result)
		{
			var result = running.result[i];
		
			if (result > 0) 
				note(result+' '+i+(result > 1 ? 's' : '')+' occured');
		}
		
		section();
		
		running = null;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Call 
	// ---------------------------------------------------------------------------------------------- //

	function call(step)
	{
		var obj = id.object.getCursor();
		var service = step.service ? obj.getServices(step.service) : null; 

		if (step.service && !service)
		{
			id.error(me+'SKIP call of unknown service "'+step.service+'"!');
			section();
			
			return false;
		}

		var url = step.url;
		var parameters = step.parameters;
		var options = step.options;
	
		if (id.isString(parameters)) 
		{
			url += '?'+parameters;
			parameters = null;
		}
		
		options.$form = obj && obj.getPlace();

		return id.service.call(obj, service ? service : { url: url, parameters: parameters }, options);	
	}

	// ---------------------------------------------------------------------------------------------- //
	// Callbacks 
	// ---------------------------------------------------------------------------------------------- //

	function afterCall(obj, status, options)
	{
		// Nothing yet ..
	
		return false;
	}

	function afterInit(obj, status, options)
	{
		if (!running)
			return false;
	
		checkStatus(obj, status, options);
		checkValue(obj, status, options);
		checkFunction(obj, status, options);
		
		if (!running.stopped)
			return false;
			
		checkWait(obj, status, options);
	}

	function afterChange(obj)
	{
		if (!running)
			return false;
	
		if (!running.stopped)
			return false;
			
		checkWait(obj);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Checks
	// ---------------------------------------------------------------------------------------------- //

	function checkStop(step)
	{
		if (step.wait)
		{
			if (step.wait.call)    stop('wait for call "'+step.wait.call+'"'); 
			if (step.wait.service) stop('wait for service "'+step.wait.service+'"');  
		}
		
		if (step.stop) stop('step');
	}

	function checkStatus(obj, status, options) 
	{
		if (!obj)
			return false;
			
		var step = currentStep();
		
		// TODO
		// Critical Errors
	
		if (status != 0 /* = critical */) 
		{
			running.result.criticals++;
			stop('critical error');
		}
		
		if (obj.hasErrors())
		{
			running.result.errors++;
			if (hasCondition(step, Tag.stopAtError)) stop('error');
		}
	
		if (obj.hasWarnings())
		{
			running.result.warnings++;
			if (hasCondition(step, Tag.stopAtWarning)) stop('warning');
		}
	}
	
	function checkFunction(obj, status, options)
	{
		var step = currentStep();
		
		if (step.check && step.check.f)
			return step.check.f(obj, status, options);
	}
	
	function checkValues(obj)
	{
		if (!obj)
			return false;

		var step = currentStep();
		
		if (!(step.check && step.check.values))
			return false;
			
		// Check on expected values
		// and stop if necessary

		var failed = false;

		// TODO
		// ...
		// ......

		if (failed)
		{
			running.checks++;
			if (hasCondition(step, Tag.stopAtFailedCheck)) stop('failed check of value');
		}
	}
	
	function checkWait(obj, status, options)
	{
		var step = currentStep();
			
		if (step.wait)
			return false;
		
		if (step.wait.call) 
		{
			if (!options)
				return false;

			// The Test package is still waiting
			// for the expected service call (by url) execution

			if (options.url.indexOf(step.wait.call) != -1)
				cont('after awaited call');
		}

		if (step.wait.service) 
		{
			if (!options)
				return false;
		
			// The Test package is still waiting
			// for the expected service call (by service id) execution

			if (options.sid && options.sid == step.wait.service)
				cont('after awaited service');
		}
			
		if (step.wait.value)
		{
			if (!obj)
				return false;
		
			if (obj.id != step.wait.value.id)
				return false;
				
			if (step.wait.value.value && step.wait.value.value != obj.value)
				return false;
				
			cont('after awaited value');
		}

		return true;		
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Assistant
	// ---------------------------------------------------------------------------------------------- //
	
	function onKey(e)
	{
		if (!plan)
			return id.error(me+'No plan set for testing!');
			
		note('Sorry, dialog for selecting a testcase not implement yet.');
		
		// TODO
		// Open dialog for selecting 
		// a testcase from the testplan.
			
		run("default");
	}

	// ---------------------------------------------------------------------------------------------- //
	// Load 
	// ---------------------------------------------------------------------------------------------- //
	
	function load(file, finalize)
	{
		file = fileOf(file);
	
		note('LOAD testplan "'+file+'"');
		id.service.load(file, { file: file, finalize: finalize, replyFormat: 'json' }, afterLoad);
		
		return true;
		
		function afterLoad(aPlan, status, options)
		{
			if (status)
				return id.error(me+'LOAD of testplan "'+options.fileName+'" failed!');
			
			plan = aPlan;
			note('ACTIVATE plan'+labelOf(plan));
			
			if (options.finalize) options.finalize();
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets 
	// ---------------------------------------------------------------------------------------------- //

	function hasCondition(step, item) 
	{ 
		if (step[item] != undefined) return step[item];
		if (running && running.job[item] != undefined) return running.job[item];
		if (plan[item] != undefined) return plan[item];
	
		return prefs[item]; 
	}
	
	function hasOption(step, item) { return step.options[item] ||prefs[item]; }
	function fileOf(file) { return (prefs.path ? prefs.path + '/' : '') + (file ||prefs.file); }
	function labelOf(item) { return ' "'+item.label+'" ' ||''; }
	function currentStep() { return running ? running.job.steps[running.step] : null; }
	function note(message) { return id.note(me+message); }
	function section(separator) { return id.section(separator); }


	// ---------------------------------------------------------------------------------------------- //
	// Shell 
	// ---------------------------------------------------------------------------------------------- //

	function dump()
	{
		if (!plan)
		{
			id.tell('There\'s no testplan at the moment.');
			return true;
		}
		
		id.tell('Testplan "'+(plan.label || 'DEFAULT')+'" with '+plan.cases.length+' testcase'+(plan.cases.length > 1 ? 's': '')+' is loaded.');
		
		for (var i = 0; i < plan.cases.length; i++)
		{
			var cp = plan.cases[i];
			id.tell('- Testcase ['+cp.id+']'+(cp.label ? ' "'+cp.label+'"' : '')+' with '+cp.steps.length+' step'+(cp.steps.length > 1 ? 's': '')+'.');
		}
		
		return true;
	}

}());
