/*
	File: startup.js
	Purpose: Setup by META tags and Startup.
	
	$Author: udy $
*/

$(function() 
{ 	
	var me = 'Startup: ';
	
	// ---------------------------------------------------------------------------------------------- //
	// Settings
	// ---------------------------------------------------------------------------------------------- //

	// Parameters, which are important
	// for the application, debugging, ...

	id.parameters = 
	[ 
		// DEPRECATED
	
		{ name: 'debug.log',          f: id.console && id.console.setDebug, deprecated: 'console.debug' },
		{ name: 'debug.measure',      f: id.console && id.console.setMeasure, deprecated: 'console.measure' },
		{ name: 'services.logout',    f: id.authorize && id.authorize.setLogout, deprecated: 'authorize.logout' },
		{ name: 'application.home',   deprecated: 'services.home' },
		
		// Services (see also precalls below)
		
		{ name: 'services.path',            f: id.service && id.service.setPath, mandatory: true },
		{ name: 'services.reload',          f: id.service && id.service.setReload },
		{ name: 'services.AJAXHistory',     f: id.service && id.service.setAJAXHistory, note: true, experimental: true },
		{ name: 'services.requestFormat',   f: id.service && id.service.setRequestFormat, note: true },
		{ name: 'services.sync',            f: id.service && id.service.setSync, note: true },
		{ name: 'services.offlinePriority', f: id.service && id.service.setOfflinePriority, note: true },
		{ name: 'services.mothership', 		f: id.service && id.service.setMothership, note: true },
		{ name: 'services.jsonp', 				f: id.service && id.service.setJsonpCallback, note: true },

		// Templates
		
		{ name: 'templates.path',		f: id.template && id.template.setPath },
		{ name: 'templates.html',		f: id.template && id.template.setPath },
		{ name: 'templates.chart',		f: id.gui.chart && id.gui.chart.setPath },
		{ name: 'templates.preload',	f: id.template && id.template.setPreload },
		{ name: 'templates.preset',	f: id.template && id.template.setPreset },

		// Layout

		{ name: 'layout.child',	f: id.service && setChildWindow },

		// Messages
		
		{ name: 'message.to',      f: id.message && id.message.setReceiver },
		{ name: 'message.subject', f: id.message && id.message.setSubject },

		// Reload

		{ name: 'reload.active',    f: id.service && id.service.setReload },
		{ name: 'reload.ie',       f: id.service && id.service.setReloadIE },
		{ name: 'reload.ff',       f: id.service && id.service.setReloadFF },
		{ name: 'reload.webkit',   f: id.service && id.service.setReloadWebkit },

		// Misc
		
		{ name: 'debug.timer',                f: id.timer && id.timer.setDebugTimeout, warn: true },
		{ name: 'authorize.logout',           f: id.authorize && id.authorize.setLogout },
		{ name: 'object.typecastSearch',      f: id.object && id.object.setTypecastSearch, note: true },
		{ name: 'patch.resetDynamicByUpdate', f: id.gui.dialog && id.gui.dialog.setResetDynamicByUpdate, note: true },
		{ name: 'iso.timeFormat',             f: id.gui.element && id.gui.element.setISOTimeFormat, note: true },

		// Debug
		
		{ name: 'console.level',         f: id.console && id.console.setMessages },
		{ name: 'console.debug',         f: id.console && id.console.setDebug },
		{ name: 'console.measure',       f: id.console && id.console.setMeasure },
		{ name: 'console.formatted',     f: id.console && id.console.setFormatted },
		{ name: 'console.grouped',       f: id.console && id.console.setGrouped },
		{ name: 'console.criticalStop',  f: id.console && id.console.setCriticalStop },
		
		// Test
		
		{ name: 'test.path',   f: id.test && id.test.setPath },
		{ name: 'test.file',   f: id.test && id.test.setFile },
		{ name: 'test.hotkey', f: id.test && id.test.setHotkey }
	];

	// Services, that have to be called
	// initially, before calling others.
	
	id.precalls = 
	[
		{ name: 'services.dictionary' },
		{ name: 'services.profile', async: false },
		{ name: 'services.templates' }
	];

	// ---------------------------------------------------------------------------------------------- //
	// Setup
	// ---------------------------------------------------------------------------------------------- //

	if (!settings())
		return error('Setup failed!', { critical: true });
		
	// ---------------------------------------------------------------------------------------------- //
	// Misc tests, only - without startup, parameters, ...
	// ---------------------------------------------------------------------------------------------- //

	if (id.misc && (id.misc.before() == true))
	{
		// Misc jobs are all done,
		// nothing else to do.
		
		return false;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Startup
	// ---------------------------------------------------------------------------------------------- //

	// if (bookmarks)
	//	bookmarks.initialize();
	
	initIDevice();
	initBrowser();
	initLayout();
	initEvents();
	initApplication();
	
	// ---------------------------------------------------------------------------------------------- //
	// Misc tests, after all 
	// ---------------------------------------------------------------------------------------------- //

	if (id.misc && id.misc.after) 
		id.misc.after();

	// ---------------------------------------------------------------------------------------------- //
	// End 
	// ---------------------------------------------------------------------------------------------- //

	return true;
	
	// ---------------------------------------------------------------------------------------------- //
	// Setup (defined by META tags)
	// ---------------------------------------------------------------------------------------------- //
	
	function settings()
	{
		var value;
	
		id.section({ label: 'Settings' });
	
		for (var i = 0; i < id.parameters.length; i++)
		{
			parameter = id.parameters[i]; 
			value =  id.getParameter(parameter.name);
			if (value === undefined) value = parameter.preset;
		
			if (value !== undefined)
			{
				parameter.value = value;
			
				if (parameter.deprecated) id.warning(me+'Please use "'+parameter.deprecated+'" instead of DEPRECATED META tag "'+parameter.name+'".');
				if (parameter.experimental) id.warning(me+'Using EXPERIMENTAL parameter "'+parameter.name+'".');
				if (parameter.note) id.note(me+'Setting "'+parameter.name+'" with "'+value+'".');
				if (parameter.warn) id.warn(me+'Setting "'+parameter.name+'" with "'+value+'".');
				if (parameter.f) parameter.f(parameter.value);
			}
			
			else if (parameter.mandatory)
				return id.error(me+'Missing mandatory parameter "'+parameter.name+'"!');
		}
		
		return true;
	}	
		
	// ---------------------------------------------------------------------------------------------- //
	// Init Application
	// ---------------------------------------------------------------------------------------------- //

	function initApplication()
	{ 
		// Essential services,
		// which have to be called before other services:
		// - Profile of user, language, ...
		// - Templates for ad hoc loading HTML content.
		// - Dictionary for direct multi language support.

		if (!id.service)
			return error('Missing Service package!', { critical: true });

		var n = 0;
		
		id.section({ label: 'Precalls' });
		
		for (var i = 0; i < id.precalls.length; i++)
			id.service.call(0, { url: id.getParameter(id.precalls[i].name) }, { startup: true, prefs: true, afterRealize: wait, async: id.precalls[i].async });

		// Functions

		function wait(obj)
		{
			id.debug(me+'Service "'+obj.id+'" precalled.');
			n++;

			if (n == id.precalls.length) 
			{
				id.debug(me+'Precalls are completed.');
				
				// Now start the regular jobs,
				// kicked by HTML content, URL, ...
				
				startApplication();
			}
		}
	}

	function startApplication()
	{
		id.section({ label: 'Startup' })
	
		id.object.download();
		id.service.autocall(/* all auto services on current page */ { startup: true });
		
		if (id.getParameter('test.file'))
			if (id.test) id.test.init();

		id.service.call(0, { url: (location.hash != '' ? location.hash.slice(1 /* skip '#' */) : id.getParameter('services.home') ||id.getParameter('application.home')) }, { startup: true });
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Child Windows
	// ---------------------------------------------------------------------------------------------- //
	
	function setChildWindow(value) 
	{
		var set, windowSettings = '';
		
		set = value.split(' ');

		for (var i = 0; i < set.length; i++) {
			windowSettings += ( i == set.length -1 ? set[i] : set[i]+', ' );
		}
		
		windowSettings += (((screen.width < 1280) || (screen.height < 1024)) ? ', scrollbars=yes' : '');
		
		if (id.service.setExternal) id.service.setExternal(windowSettings);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Init Devices
	// ---------------------------------------------------------------------------------------------- //

	function initIDevice()
	{	
		if (id.idevice && id.isIDevice()) 
			id.idevice.init();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Init Browser
	// ---------------------------------------------------------------------------------------------- //

	function initBrowser()
	{	
		// Init some browser specifica.
	
		if (id.isIE())
		{
			// Global IE settings
		
			document.onselectstart = function() 
			{ 
				// Allow only for the following objects
				// a select on the content (not: lists, ...).
				
				if (id.isMember(['INPUT', 'TEXTAREA', 'P', 'STRONG', 'EM', 'FONT', 'U', 'H1', 'H2', 'TD', 'B', 'I'], event.srcElement.tagName))
					return true;
					
				return false; 
			}
			
			document.ondrag = function() { return false; }
		}


		// Nothing else ..
	}

	// ---------------------------------------------------------------------------------------------- //
	// Init Layout
	// ---------------------------------------------------------------------------------------------- //

	function initLayout()
	{
		// Init screen related resolution mode
	
		if (!id.isIDevice()) 
			if (id.layout) 
				id.layout.initResolution(); 	
	}

	// ---------------------------------------------------------------------------------------------- //
	// Init Global Events
	// ---------------------------------------------------------------------------------------------- //

	function initEvents()
	{
		// Init global keyboard handler.
	
		if (id.key)	
			id.key.init(); 
	}

	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function error(message, options) { if (id.console) id.error(me+message, $.extend(options, { type: 'startup' })); return false; }
	function debug(message) { if (id.console) id.debug(me+message, { type: 'startup' }); }

});
