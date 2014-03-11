/*
	File: object.js
	Purpose: Object management and rendering
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	id.object = 
	{
		id: 'object',
		
		init: init,
		destroy: destroy,
		bind: bind,
		register: register,
		service: service,
		download: download,
		upload: upload,
		atOffline: atOffline,
		atOnline: atOnline,

		leave: function(causedBy) { return cursor ? parts[cursor].leave(causedBy) : false; },
		unload: function(causedBy) { return cursor ? parts[cursor].unload(causedBy) : false; },
		enter: function() { return cursor ? parts[cursor].enter() : false; },
		change: function() { return cursor ? parts[cursor].change() : false; },

		getObject: getObject,
		getCursor: getCursor,
		getContent: getContent,

		isMultiPart: function(flag) { if (flag) multiPart = flag; return multiPart; },
		setTypecastSearch: function(flag) { prefs.typecastSearch = flag; }
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Privacy
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { fadeIn: false, typecastSearch: false };

	// Vocabulary (COS, CSS, ...)

	var COS = { multipart: 'multipart', message: 'message', cancel: 'cancel', transaction: 'transaction' };
	var Class = { subdialog: 'subdialog', isProcess: 'isProcess', isTask: 'isTask', isWidget: 'isWidget', isChart: 'isChart', isMenu: 'isMenu', isExtras: 'isExtras', isModules: 'isModules', isHotlinks: 'isHotlinks', part: 'part', selected: 'selected', boxy: 'boxy-wrapper', isQueryTable: 'isQueryTable', isSwapSelect: 'isSwapSelect', isSelect: 'isSelect', isRadio: 'isRadio', isCheck: 'isCheck', isCheckSelect: 'isCheckSelect', isLegend: 'isLegend' };
	var Type = { process: 'process', task: 'task', panel: 'panel', dialog: 'dialog', menu: 'menu', extras: 'extras', modules: 'modules', hotlinks: 'hotlinks', chart: 'chart', queryTable: 'queryTable', swapSelect: 'swapSelect', select: 'select', radio: 'radio', check: 'check', checkSelect: 'checkSelect', legendGroup: 'legendGroup' };
	var Service = { init: 'init', exit: 'exit', change: 'change', select: 'select', paging: 'paging', timer: 'timer', auto: 'auto', insert: 'insert', all: '*', update: 'update', error: 'error', cancel: 'cancel', button: 'button' };
	var Mode = { prepare: 'prepare', init: 'init', reinit: 'reinit', update: 'update', none: 'none' };
	var Tag = { keys: 'keys', services: 'services', type: 'type', selected: 'selected', error: 'error', status: 'status', warning: 'warning' };
	var State = { init: 'init', wait: 'wait', final: 'final', update: 'update', leave: 'leave' };
	var Place = { buttons: 'actions', content: 'content' };
	var At = { unload: 'atUnload', leave: 'atLeave', enter: 'atEnter', update: 'atUpdate' };

	// Session based Variables

	var parts = [];
	var cursor = null;
	var modal = null;
	var multiPart = false;
	var $content = 0;
	
	var me = id.meOf(id.object);
	var ns = id.namespaceOf('all'); 

	// ---------------------------------------------------------------------------------------------- //
	// Init, ...
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj, options)
	{
		// Transaction wraps multiple cosobjects, which need to be handled separately

		if (obj.type === COS.transaction) {
			$.each(obj.items, function(i, item){
				init(item, $.extend({},options));     // copy options, so that the second item won't get the options of the first.
			});
			return true;
		}

		// Package setup 
		// like profile, ...
		if (options && options.prefs)
			return setup(obj, options);

		// System messages 
			
		if (obj.type === COS.message) 
			return id.message.init(obj, options);

		// Measuring, Logging

		id.measure(id.object.id, { type: id.object.id, reset: true });
		id.section({ label: 'Object "'+obj.id+'"' });

		// Integration 
		// in object layer

		if (!parts[obj.id]) new Part(obj, options, true);
		else parts[obj.id].update(obj, options);

		obj.realize();

		// Measuring
		
		id.measure(id.object.id, { type: id.object.id, info: obj.getInfo() });
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Exit  
	// ---------------------------------------------------------------------------------------------- //

	function destroy()
	{
		for (var index in parts)
			parts[index].destroy();
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Setup 
	// ---------------------------------------------------------------------------------------------- //

	function setup(obj, options)
	{
		// Preference objects like templates, dictionary, ...
		// have no 'parts', but package only.
			
		var package = packageOf(obj.type);
		
		if (!package)
			return id.error(me+'Missing package "'+obj.type+'" for "'+obj.id+'"!');
		
		package.init(obj, options);
		
		if (options.afterRealize) 
			options.afterRealize(obj);
	
		return true;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Register Packages
	// ---------------------------------------------------------------------------------------------- //

	// Type Mapping
	// For compatibility reasons only,
	// have to be replaced by id.object.register() pattern,
	// step by step.
	
	var packages = 
	[
		{ type: Type.swapSelect,  docType: Class.isSwapSelect },
      { type: Type.select,      docType: Class.isSelect },
		{ type: Type.checkSelect, docType: Class.isCheckSelect },
		{ type: Type.radio,       docType: Class.isRadio },
		{ type: Type.checkSelect, docType: Class.isCheckSelect },
      { type: Type.legendGroup, docType: Class.isLegend }
	];

	// register(package, { cosType: 'table' });
	// register(package, { docType: 'isChart' });
	// register(package, { docType: 'isChart', services: ['/cxx/chart/init', '/cxx/table/init' ] });
	// register(package, { cosType: 'table', docType: 'isChart', serializer: serialize });

	var registered = 0;

	function register(package, options)
	{
		options = options || {};
		
		var cosType = options.cosType || null;
		var docType = options.docType || null;
	
		var item;
	
		for (var i = packages.length, pi; i--; )
		{
			pi = packages[i];

			if (pi.docType === docType || pi.cosType === cosType)
			{
				item = pi;
				break;
			}
		}
				
		if (!item) 
			packages.push(item = {});
			
		item.package = package;
		
		if (options.docType) item.docType = options.docType;
		if (options.cosType) item.cosType = options.cosType;
		if (options.services) item.services = options.services;
		if (options.serializer) item.serializer = options.serializer;
		if (options.name) $.extend(item.package, { id: options.name, me: id.meOf(options.name), ns: id.namespaceOf(options.name) });
	
		item.type = item.package.id;
	
		if (item.serializer)
			id.serialize.register(item.docType, item.serializer);
			
		if (item.services)
		{
			// Fired by Device Manager 
			// like PhoneGap ...
		
			$(document).bind('offline', atOffline);
			$(document).bind('online', atOnline);
		}

		if (!registered) id.section({ label: 'Loading packages ..' });
		id.note(me+'LOAD '+(item.services ? 'offline service' : 'package')+' "'+item.type+'".');
		registered++;

		return true;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Register Packages
	// ---------------------------------------------------------------------------------------------- //

	function packageOf(type)
	{
		if (!type)
			return null;
		
		for (var i = packages.length, pi; i--; )
		{
			pi = packages[i];
			
			if (!pi.services && pi.package && (pi.type && pi.type === type))
				return pi.package;
		}

		// Compatibility .. 
		// .. have to be removed, later.

		return id.package(type); 
	}
	
	function download()  { fire('atDownload'); }
	function upload()    { fire('atUpload'); }
	
	function atOnline()  
	{ 
		id.debug(me+'ONLINE again ..'); 
		// alert(me+'ONLINE again ..');
		
		fire('atOnline'); 
		fire('atUpload'); 
	}
	
	function atOffline() 
	{ 
		id.debug(me+'OFFLINE ..'); 
		// alert(me+'OFFLINE ..');
		fire('atOffline'); 
	}
	
	function fire(fn)
	{
		for (var i = packages.length, pi; i--; )
		{
			pi = packages[i];
			
			if (pi.services && pi.package && pi.package[fn])
				pi.package[fn]();
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// (Offline) Services
	// ---------------------------------------------------------------------------------------------- //

	function service(url, request, obj)
	{
		if (!url)
			return null;
		
		for (var i = packages.length, pi; i--; )
		{
			pi = packages[i];
			
			if (pi.services && pi.package)
				for (var j = pi.services.length, sj; j--; )
				{
					sj = pi.services[j]; 
				
					if (sj.url === url && sj.fn)
						return sj.fn(url, request, obj);
				}
		}

		return null; 
	}

	// ---------------------------------------------------------------------------------------------- //
	// Schema
	// ---------------------------------------------------------------------------------------------- //

	var ItemSchema =
	{
		isPackage:  function() { return false; },
		isItem:     function() { return true; },

		change:     function() { var obj = getObject(this.owner); if (this.hasChange()) obj.call(this.hasChange(), { $form: obj.getPlace() }); obj.change(); }, 
		enter:      function() { var obj = getObject(this.owner); if (this.hasInit())   obj.call(this.hasInit(),   { $form: obj.getPlace() }); obj.enter();  }, 
		leave:      function() { var obj = getObject(this.owner); if (this.hasExit())   obj.call(this.hasExit(),   { $form: obj.getPlace() }); obj.leave();  },
		call:       function(service, options) { return getObject(this.owner).call(service, options); },
		
		getPlace:   function() { return this.$place; }, 
		getScope:   function() { return getObject(this.owner).getPlace(); },
		getTask:    function() { return getObject(this.owner).getTask(); },
		getIndex:   function() { return this.self; },
		getOwner:   function() { return getObject(this.owner); },

		hasService: function(trigger, recursion) { return id.cos.hasService(this, trigger, recursion); },
		hasSelect:  function() { return this.hasService(Service.select); },
		hasChange:  function() { return this.hasService(Service.change); },
		hasInit:    function() { return this.hasService(Service.init); },
		hasExit:    function() { return this.hasService(Service.exit); },
		
        // added for chart inside group functionality
		isContent: function(flag) { if (flag != undefined) var content = flag; return content; },
		getInfo: function(mode, aObj) { var op = getObject(this.owner) || aObj; return (mode ? mode.toUpperCase()+' ' : '')+ (op ? op.getIndex()+' ('+op.getType()+')' : ''); }
	};

	function bind(obj, owner, $place)
	{
		obj.owner = owner.getIndex();
		obj.self  = obj.owner+'/'+obj.id;
		if ($place) obj.$place = $place;

		$.extend(obj, ItemSchema);

		return obj;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// The Part Object: The COS Object at Home. 
	// ---------------------------------------------------------------------------------------------- //

	function Part(aObj, options)
	{
		options = options || {};
		
		var obj = aObj;

		// ---------------------------------------------------------------------------------------------- //
		// Schema		
		// ---------------------------------------------------------------------------------------------- //

		var PackageSchema = 
		{
			isPackage: function() { return true; },
			isItem: function() { return false; },

			// Public
		
			update: update,
			show: show, hide: hide, 
			enter: enter, leave: leave, 
			call: call,
			change: change, unchange: unchange, 
			unload: unload, forget: destroy,
            broadcast: broadcast,

			getRoot: getRoot, getOwner: getOwner, getSelf: getSelf,
			getProcess: getRoot,	getTask: getTask, 	
			getIndex: getIndex, getKeys: getKeys, 
			getPlace: getPlace, getScope: getScope,
			getService: getService,			
			getInsert: getInsert, getUpdates: getUpdates,
			getType: getType,
			getTaskName: getTaskName,

			isCursor: isCursor, isModal: isModal, isWidget: isWidget,
			isProcess: isProcess, isTask: isTask, isSubtask: isSubtask,
			isSelected: isSelected,	isHandled: isHandled, isContent: isContent, 
			isInit: isInit, isUpdate: isUpdate,

			hasErrors: hasErrors, hasWarnings: hasWarnings, hasStatus: hasStatus, 
			hasService: hasService, hasButtons: hasButtons, 
			hasInit: hasInit, hasExit: hasExit, hasSelect: hasSelect, 
			hasChange: hasChange, hasTimer: hasTimer,
			hasChanges: hasChanges, hasUpdates: hasUpdates,	
			hasSubtasks: hasSubtasks, hasModal: hasModal,
			hasRequestFormat: hasRequestFormat,

			setPlace: setPlace, setScope: setScope,

			// Private
			
			// TODO
			// Bringing back to privacy by substitution obj.f() > f(obj)
			// step by step.
	
			realize: realize, destroy: destroy,
			getRoot: getRoot, getOwner: getOwner,
			getInfo: getInfo, isReset: isReset
		};
		
		$.extend(obj, PackageSchema);

		// ------------------------------------------------------------------------------------------- //
		// Private
		// ------------------------------------------------------------------------------------------- //

		// Family references

		var owner = options.owner || null;
		var self = (owner ? owner+'/' : '')+obj.id;
		var root = options.root || self; 

		// Object table

		// id.debug('Self: '+self);

		parts[self] = obj;

		// Object proprties

		var type = obj.type;
		var task = obj.type == Type.task ? self : (getOwner() ? getOwner().getTaskName() : undefined); 

		var updates = 0;
		var content = false;
		var $place = options.$place || placeOf();
		var package = undefined;

		// ------------------------------------------------------------------------------------------- //
		// Compatibility Interface (Interims)
		// ------------------------------------------------------------------------------------------- //

		obj.$place = $place;
		obj.$scope = owner ? objectOf(owner).getPlace() : getHome();

		// ------------------------------------------------------------------------------------------ //
		// Before Init
		// ------------------------------------------------------------------------------------------ //
	
		if (!needTemplate())
			init(obj, options);
	
		return obj;
		
		// ------------------------------------------------------------------------------------------ //
		// Init
		// ------------------------------------------------------------------------------------------ //

		function init(obj, options)
		{
			setState(State.init);
	
			// Tasks ..
			// .. after the template has loaded.

			if ($place.missed()) 
				$place = placeOf(options.$place);
				
			if (!(type = options.type || typeOf($place, obj.type)))
				return id.error(me+'Unknown type for '+self+'.');
			
			// Changing COS based object 
			// for usage in the packets ..
			// .. might be removed later.
			
			obj.type = type;
			
			if (!(package = packageOf(type)))
				return id.error(me+'Unknown package for type "'+type+'".', { critical: true });

			if (modeOf(obj) == Mode.update)
			{
				id.hint(me+getInfo('force')+' to mode "init", was "'+modeOf(obj)+'".');		
				obj.mode = Mode.init;
			}

			if ($place.hasClass(Class.isWidget))
				getProcess().isWidget(true);
		
			if (obj.isTask())
			{
				getTask().hasChanges(0);
				getTask().hasUpdates(0);
				// getTask().hasErrors(0);
			}

			if (obj.items)
				childs(obj);
		}

		// ------------------------------------------------------------------------------------------- //
		// Update
		// ------------------------------------------------------------------------------------------- //

		function update(news, options, recursion)
		{
			setState(State.update);

			var mode = modeOf(news);
			var part;
			
			// Init on an exisiting object
			// must be handled ..
			
			if (mode == Mode.init)
			{
				// Although the object is known,
				// it is initted again ..

				// debug(getInfo('reinit'));

				// Is there an package handler for re-inits?
				// Then call this, otherwise destroy the part.

				// if (package.reinit) 
				// ...
				// else
				{
					var index = obj.getIndex();
					
					parts[index].destroy();
					parts[index] = new Part(news, options); 
				}
			}
			else // Update 
			{
				if (obj.isTask() && obj.isSelected())
					delete obj.selected;
                
				obj.isReset(false);
				copy(obj, news);
				$.extend(news, PackageSchema);
				updates = news;
				obj.mode = Mode.update;

				// Handle the childs ..
			
				if (news.items) 
					childs(obj, news);
			}
			
			return true;
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Childs
		// ------------------------------------------------------------------------------------------- //
		
		function childs(obj, updates)
		{
			var items = (updates || obj).items;
			var item, inserted;
			
			for (var i = 0; i < items.length; i++)
			{
				item = items[i];
				inserted = null;
				
				if (updates && obj.items) 
					for (var j = 0; j < obj.items.length; j++)
						if (item.id == obj.items[j].id)
						{
							inserted = obj.items[j];
							break;
						}

				// First: Which type is it?
				// It may be adjusted by HTML class,
				// or set by the insert of this object.

				item.self = indexOf(item.id);
				item.$scope = obj.getPlace();
				item.$place = placeOf(item.$scope, item);
				item.type = typeOf(item.$place, item.type, inserted && inserted.type);

				// Now work with the 
				// adjusted type ..

				if (packageOf(item.type))
				{
					// It's a package type 
					// so do the full job ..

					var options = { owner: obj.getIndex(), root: obj.getRoot().getIndex(), $place: item.$place, type: item.type };
					var index = item.self;

					if (!parts[index]) new Part(item, options);
					else parts[index].update(item, options); 
				}
				else
				{
					// It's a simple element,
					// so add some useful functions,
					// nothing more.

					item.owner = obj.getIndex();
					$.extend(item, ItemSchema); 
					
					if (inserted && updates)
					{
						if (item.services) updateServices(inserted, item);
						else item.services = inserted.services;
					}
				}
			}
		}
	
		// ------------------------------------------------------------------------------------------- //
		// Template
		// ------------------------------------------------------------------------------------------- //

		function needTemplate()
		{
			if ($place.exist() || options.prefs /* don't need any template */)
				return false;
				
			// Template must be loaded before
			// with additional infos.

			setState(State.wait);

			options.afterInjection = function(obj, options) { init(obj, options); };
			options.async = false;
			
			id.template.load(obj, options);
			
			return true;
		}
	
		// ------------------------------------------------------------------------------------------- //
		// Destroy
		// ------------------------------------------------------------------------------------------- //
		
		function unload(causedBy)
		{
			debug(getInfo('unload'));
			
			if (modal) closeModal(objectOf(modal.index));
			
			at(getCursor(), At.leave);
			at(getCursor(), At.unload);
			
			id.service.cancel();

			getRoot().destroy(true);
			setCursor();
		}
		
		function destroy(family) 
		{ 
			if (family)
			{
				family = getIndex();

				for (var index in parts)
					if (index == family /* root */ || index.indexOf(family+'/') == 0 /* childs */)
						_destroy(parts[index]);
			}
			else _destroy(this)
			
			// Functions
			
			function _destroy(obj)
			{
				// debug(getInfo('destroy', obj));	
				
				var package = obj.isHandled();
			
				if (package && package.destroy)
					package.destroy(obj);
			
				delete parts[obj.getIndex()];
				delete obj;
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Object Realizer
		// ------------------------------------------------------------------------------------------- //

		function realize(options)
		{
			// id.measure('Realize', { reset: true });
		
			options = options || {};

			var mode = modeOf(this);		
			var obj = this;
		
			if (obj.isProcess()) handleProcess(obj);
			else if (obj.isTask()) handleTask(obj);

			// The realization of objects/packages

			if (package && package[mode])
			{
				// Operation given by mode (init, update, ...)
				// is known by the package.
			
				debug(getInfo(mode));

				// id.measure('package', { type: obj.type, reset: true });
				
				package[mode](obj);
				
				if (!obj.isSubtask() && obj.isTask())
				{
					if (obj.items && (obj.selected || obj.hasSubtasks()))
						id.gui.panel.showDialog(obj);
				}
				else show();
	
				if (package.afterShow)
					package.afterShow(obj);
	
				// id.measure('package', { type: obj.type, info: getInfo(mode) });
	
				if (obj.afterRealize)	
					obj.afterRealize(obj);
			}
			else if (mode == Mode.none) 
			{ 
				debug(getInfo(mode));
				
				// TODO: this triggers the layout size without necessity
				if (package && package.afterShow)
					package.afterShow(obj);
			}
			else if (mode == Mode.prepare)
			{
				// ....
			}
			else id.error(me+'Unknown function '+getInfo(mode)+'!', { critical: true }); 

			if (mode !== Mode.none)
			{
				handleButtons(obj);
				handleMessages(obj);
				handleServices(obj);
			}
			
			// id.measure('Realize', { info: obj.id+' ('+obj.type+')' });
		
			// Handling of
			// child objects.
				
			id.cos.items(obj, { check: function(item) { return item.realize }, f: function(item) { item.realize(options); }});

			// After all

			setState(State.final);
			handleServices(obj);
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Process
		// ------------------------------------------------------------------------------------------- //

		function handleProcess(obj)
		{
			var modalTask = 0, activeTask = 0;
			
			// Analyse items
			
			id.cos.items(obj, { check: function(item) { return item.type == Type.task; }, recursive: true,
				f: function(item) 
				{ 
					if (modal && item.getIndex() == modal.index) modalTask = item; 
					if (item.selected) activeTask = item; 
				} 
			});
			
			// Handling of 
			// (modal) subtasks
			
			if (modalTask)
			{
				if (modalTask.selected == false) modalTask.hide(); 
				else obj.hasModal(true);
				
				if (modalTask != activeTask) modalTask.hide(); 
			}
			
			if (modal && !modalTask)
			{
				// There's a lonely modal task 
				// out there ..
				
				//objectOf(modal.index).hide();
				modal.boxy.hide();
			}
			
			if (activeTask)
			{
				if (activeTask.isSubtask())
					activeTask.getOwner().hasSubtasks(true);
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Task
		// ------------------------------------------------------------------------------------------- //

		function handleTask(obj)
		{
			if (obj.isSelected())
			{
				// If a selected task with init mode has no items,
				// but an init service, so call it automatically.

				if (modeOf(obj) == Mode.init && obj.hasInit() && !obj.items)
				{
					// Autocall of task service
					// to get the items.

					debug(getInfo('autocall', obj));
					
					// ### LR: TOCHECK
					// Note (IE)
					// Async calls on filesystem works only with async function call ... 
					// ... and should work under normal conditions also.

					// obj.call(obj.hasInit());
					// id.timer.call(function(obj) { obj.call(obj.hasInit()); }, 1, obj);
					id.thread(function(obj) { obj.call(obj.hasInit()); }, obj)
					
					return;
				}

				// Handle modal tasks
				// Handle subtasks

				if (obj.isSubtask())
				{
					if (obj.isModal()) handleModal(obj);
					else handleSubtask(obj);
				}
				else setCursor(obj);
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Messages		
		// ------------------------------------------------------------------------------------------- //
		
		function resetMessages(obj)
		{
			if (obj.isReset() /* already */)
				return false;
				
			if (obj.isProcess() || obj.isTask())
				if (obj.isInit() || (obj.error !== undefined || obj.warning !== undefined || obj.status !== undefined))
				{
					id.gui.panel.resetMessages(obj);
					obj.isReset(true);
				}
		}
		
		function handleMessages(obj)
		{		
			//if (!obj.isSelected())
			//	return false;
			
			resetMessages(obj);
		
			if (obj.error !== undefined)   id.gui.panel.showError(obj);
			if (obj.warning !== undefined) id.gui.panel.showWarning(obj);
			if (obj.status !== undefined)  id.gui.panel.showStatus(obj);
		}

		// ------------------------------------------------------------------------------------------- //
		// Object's Visibility
		// ------------------------------------------------------------------------------------------- //
		
		function show()
		{
			if ($place.is(':visible'))
				return false;
				
			if (multiPart)
				handleParts($place);
				
			if (obj.beforeShow) 
				obj.beforeShow();
		
			if (package.show)
			{
				// Show done by
				// the package itself.
			
				package.show(obj);
			}
			else if (id.isIE())
			{
				// Bug (IE)
				// IE can't fade in input/textarea,
				// and it's, anyhow, too slow for fading.

				$place.show();
			}
			else if (prefs.fadeIn) 
			{
				var speed = 'normal';
	
				if (id.isMember([Type.process, Type.task, Type.table], type)) speed = 'fast';
				if (id.isMember([Type.menu, Type.hotlinks, Type.infobox, Type.news], type)) speed = 'slow';
	
				$place.fadeIn(speed); 
			}
			else
			{
				$place.show();
			}
			
			if (obj.afterShow)	
				obj.afterShow();
				
			return true;
		}
		
		function hide()
		{
			if (this.isModal())
				return closeModal(this);
		
			$place.hide();
		}
		
		function handleParts($place)
		{
			var $to = $place.parent(':first');
		
			if ($to.hasClass(Class.part))
			{
				var $from = $('#'+Place.content).find('.'+Class.part+'.'+Class.selected);
				
				// if ($from.children().attr('id') != $to.children().attr('id'))
				{
					if (id.isIDevice())
					{
						// Animation
						// Frank ...
					}
					else
					{
						$from.removeClass(Class.selected);
						$to.addClass(Class.selected);
						
						setContent($to);
					}
				}
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Object Focus
		// ------------------------------------------------------------------------------------------- //

		function enter()
		{
			var from = getCursor();
			var to = this;
		
			if (from && from.getIndex() == to.getIndex()) 
				return false;

			debug(getInfo('enter'));

			at(to, At.enter);
			id.timer.start(to);
			setCursor(to);
					
			return true;
		}
		
		function leave(causedBy, options)
		{
			var from = getCursor(); 
			var to = this;
			
			if (!from)
				return false;

			if (causedBy)
			{
				// if (causedBy.getIndex() == from.getIndex()) 
				//if (causedBy.getIndex().indexOf(from.getIndex()) !== -1) 
				if (causedBy.getIndex() == to.getIndex()) 
				{
					// Object doesn't exit itself
					// (it's an update operation).
				
					return false;
				}
	
				if (causedBy.isWidget())
				{
					// The causer of exit is a widget, but it works independently,
					// so skip the exit function ot the regular object.
			
					return false;
				}
			}
	
			// Exit ...
			
			debug(getInfo('leave'));
	
			at(from, At.leave);
			id.timer.stop(to);

			if (causedBy)
			{
				if (causedBy.type == Type.menu)
				{
					// Menu calls skip auto exits .. by convention.
					// So reset all changes.
				
					unchange();
					return false;
				}
			}

			if (options)
			{
				if (options.panelSwitch)
				{
					// The exit call should be done
					// only by the provoked service call ..
					
					return false;
				}
			}
			
			var service = from.hasExit();

			if (service)
			{
				if (from.hasChanges() || from.hasErrors() || service.always)
				{
					// Only call the auto exit service
					// if there are changes, errors (from changes before)
					// or if the service have to be called always.

					id.service.call(from, service, { $form: from.getPlace(), whileExit: true })
				}
			}
	
			// setCursor();
			return true;
		}
		
		function setCursor(obj) 
		{ 
			cursor = obj ? obj.getIndex() : 0;
			
			if (cursor)
			{
				obj.getPlace().unbind('change'+ns).bind('change'+ns, { obj: obj }, onChange);
				// debug(getInfo('cursor'));
			}
		}		
		
		function getCursor() { return parts[cursor]; }
		
		// ------------------------------------------------------------------------------------------- //
		// Object's Changes
		// ------------------------------------------------------------------------------------------- //
		
		function onChange(e) { e.data.obj.change(); }
		function unchange() { return change(false); };

		function change(flag) 
		{ 
			if (flag == undefined) flag = true;
		
			if (flag && !getTask().hasChanges()) debug(getInfo('change'));
			if (!flag && getTask().hasChanges()) debug(getInfo('reset'));

			getTask().hasChanges(flag ? getTask().hasChanges()+1 : 0);

			var service = obj.hasChange();
			
			if (flag && service)
				id.service.call(obj, service, { $form: obj.getPlace(), afterCall: afterCall });
				
			if (id.test)
				id.test.afterChange(obj);
		
			function afterCall(obj, status, options)
			{
				if (!status)
					broadcast(At.update, obj);
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Services
		// ------------------------------------------------------------------------------------------- //
		
		function services()
		{
			// #TODO
			// Change services to at<Function>, 
			// therefore they will be called automatically by the at() function ...
			// ...		
		}
		
		function handleServices(obj)
		{
			var services = obj.services; 
			
			if (!obj.services)
				return false;
		
			// Some Service have to be executed 
			// automatically at receipt.  
		
			for (var i = 0; i < services.length; i++)
			{
				var service = services[i];
			
				if (service.done)
				{
					// Already called by 
					// an earlies state.
				
					continue;
				}
				
				if (service.trigger == Service.auto || modeOf(obj) == Mode.prepare)
				{
					if (!isState(State.final) && id.cos.hasCallByReference(service))
					{
						// The service expects parameters call by reference,
						// therefore it have to wait for the final state
						// after realization.

						debug('SKIP auto trigger "'+(service.id || service.url)+'".');
						continue;
					}
					
					id.note(me+'TRIGGER "'+(service.id || service.url)+'" automatically.'); 
					// id.service.call(data.obj, data.service, { $form: data.obj.getScope() }); 
					// id.timer.call(function(data) { id.service.call(data.obj, data.service, { $form: data.obj.getScope() }); }, 1, { obj: obj, service: service }); 
					id.thread(function(data) { id.service.call(data.obj, data.service, { $form: data.obj.getScope() }); }, { obj: obj, service: service }); 
					service.done = true;
				}

				if (service.trigger == Service.timer)
				{
					id.timer.init(obj, service);
					service.done = true;
				}
				
				if (service.requestFormat == COS.multipart)
					id.gui.upload.init(obj, service);
			}
		}
		
		function updateServices(obj, services)
		{
			if (!obj.services)
				obj.services = [];
			
			for (var i = services.length, si; i--; )
			{
				si = services[i];

				for (var j = obj.services.length, done = false; j-- && !done; )
					if (obj.services[j].id === si.id)
					{
						// Always replace 
						// the whole service object
						
						debug('UPDATE service "'+obj.getIndex()+'/'+si.id+'".');
						obj.services[j] = si;
						// $.extend(obj.services[j], services[i]);
						done = true;
					}
					
				if (!done)
				{
					// Service is unknown yet ..
					// .. add this.
					
					debug('ADD service "'+obj.getIndex()+'/'+si.id+'".');
					obj.services.push(si);
				}
			}
		}
		
		function updateKeys(obj, keys)
		{
			if (!obj.keys)
				return false;
		
			for (var i = 0; i < keys.length; i++)
				for (var j = 0; j < obj.keys.length; j++)
					if (obj.keys[j].id == keys[i].id)
					{
						// Always replace 
						// the whole keys object
						
						debug('UPDATE keys ..');
						obj.keys[j] = keys[i];
					}
		}

		function hasButtons()
		{
			var buttons = [];
		
			// Process based services 
			// have to be re-used in every task

			var services = obj.isUpdate() && obj.isProcess() ? this.getInsert().services : this.services; 
			
			if (services) for (var i = 0; i < services.length; i++)
			{
				var service = services[i];

				if (!service.trigger || (service.trigger == Service.button))
				{
					if (!service.id) service.id = 'id'+i; 
					if (!service.trigger) service.trigger = Service.button;
					
					buttons.push(service);
				}
			}
			
			return buttons.length ? buttons : null;
		}
		
		function handleButtons(obj)
		{
			// ### TODO
			// Move this to Button Package?
		
			var $root, $form;
			var buttons = obj.hasButtons();
		
			if (obj.isModal()) 
			{
				// Place the buttons in the modal dialog
				// (outside the process, due to boxy package).
			
				$root = placeOf(getHome());
				$form = $root;
				
				// ### Todo
				// Move to Modal Package ...
				// Add Ok/Cancel service to modal dialogs.
				
				var cancel = null;
				
				if (buttons)
				{
					for (var i = 0; i < buttons.length; i++)
						if (buttons[i].type == COS.cancel)
						{
							// Everything's done.
							
							cancel = buttons[i]; 
							break;
						}
						
					if (!cancel)
						obj.services.push({ id: 'cancel', label: id.lang.get('cancel'), type: COS.cancel, trigger: Service.button });
				}				
				else
				{
					if (!obj.services) obj.services = [];
					obj.services.push({ id: 'cancel', label: id.lang.get('cancel'), type: COS.cancel, trigger: Service.button });
				}
			}
			else if (obj.isSubtask())
			{
				// Place the buttons
				// in the status bar of the objectOf(getTask()).
			
				$root = obj.getOwner().getPlace();
				$form = obj.getPlace();
			}
			else if (obj.isTask())
			{
				// As usual ...
			
				$root = obj.getPlace();
				$form = $root;
			}
			else if (obj.isProcess()) 
			{
				if (buttons)	
				{
					var task = getActiveTask(obj);
					if (!task) return id.error(me+'Process service exists, but no selected task for inheritance!');
					 
					$root = task.getPlace();
					$form = $root;
				}
			}

			if ($root && $form)
				id.gui.button[modeOf(obj)](obj, $root.find('#'+Place.buttons), { $form: $form });
		}
		
		function getService(aID, options)
		{
			options = options || {};
		
			if (obj.services) 
			{
				if (aID == '*') 
					return obj.services;
			
				for (var i = 0; i < obj.services.length; i++)
				{
					var service = obj.services[i];
					
					if (!aID)
						return /* first */ service;

					// There's only one service 
					// at a time .. may be filtered 
					// by another options.
				
					if (service.id && service.id === aID)
						if (!options.trigger || (options.trigger && (options.trigger === service.trigger)))
							return service;
				}
			}

			return null; 
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Sub Tasks
		// ------------------------------------------------------------------------------------------- //

		function handleSubtask(obj)
		{
			var $place = obj.getPlace();

			// #TODO
			// Focus (Leave, ..)
		
			$place.parent()
				.find('.'+Class.subdialog)
				.not(Class.none)
				.not('#'+id.cos.jQueryID(obj.id))
				.hide();

			setCursor(obj);
			show();

			return true;
		}

		// ------------------------------------------------------------------------------------------- //
		// Modal subtasks
		// ------------------------------------------------------------------------------------------- //

		// #TODO
		// Move this to a modal package ...

		function isModal(flag, options) 
		{ 
			if (flag == true)
			{
				if (modal) closeModal(objectOf(modal.index));
				modal = $.extend({ index: getIndex() }, options || {});
			}
			
			if (flag == false)
				 closeModal(objectOf(modal.index));

			return modal && modal.index == this.getIndex() ? objectOf(modal.index) : false; 
		}

		function handleModal(obj)
		{
			var mp = obj.isModal();

			if (!mp)	return false;

			id.timer.stop(mp.getOwner());
			setCursor(obj);
			
			return true;
		}

		function closeModal(obj)
		{
			var mp = obj.isModal();

			if (!mp)	return false;

			debug('CLOSE modal '+mp.getInfo());
	
			modal.boxy.hide();
			setCursor(id.gui.panel.getDialog());
			if (mp.getOwner()) id.timer.start(mp.getOwner());

			mp.destroy(true);
			obj.hasModal(false);
			modal = null;
			
			return true;
		}

		// ------------------------------------------------------------------------------------------- //
		// Object 'at home'
		// ------------------------------------------------------------------------------------------- //

		function placeOf($scope, item)
		{
			item = item || obj;
			$scope = $scope || (owner ? objectOf(owner).getPlace() : getHome());
			
			// Find the right place in the DOM ..
			// inside the parent's scope ..
			// or the right part ...
			
			var typecast = prefs.typecastSearch ? (item.type == Type.process ? '.'+Class.isProcess : (item.type == Type.task ? '.'+Class.isTask : '')) : '';
			var $place = $scope.find('#'+id.cos.jQueryID(item.id)+typecast);

			if (!$place.exist())
			{
				// Variations
				
				// First
				// Modal dialogs by Boxy are out of COS scope
				// in DIVs at the body root.
				
				$place = $('body .'+Class.boxy+' #'+id.cos.jQueryID(item.id));
			}

			// Variations
			
			// First
			// Multi content (iPad, iPhone, ...)
			// find the right content.

			if (multiPart && $place.length > 1)
				$place = $content.find('#'+id.cos.jQueryID(item.id)+typecast);

			return $place;
		}
		
		function typeOf($where, type, insertedType)
		{
			$where = $where || $place;
			type = type || insertedType;
			var element = $where.eq(0);
		
			// Type specified at least
			// by the document type (class="is...").
			
			for (var i = packages.length; i--; ) 
				if (element.hasClass(packages[i].docType))
				{
					type = packages[i].type;
					break;
				}
			
			return type;
		}
		
		function indexOf(id)			{ return getIndex()+'/'+id; }
		function modeOf(obj)			{ return obj.mode || Mode.update; }
		function isInit(obj)			{ return modeOf(obj) == Mode.init; }
		function objectOf(index)	{ return index ? parts[index] : null; }

		// ------------------------------------------------------------------------------------------- //
		// Small Message Bus
		// ------------------------------------------------------------------------------------------- //
	
		function broadcast(method, causedBy)
		{
			// #TODO
			// Good idea, but quick ..
			// Object should register to broadcast service ..
		
			for (var i in parts)
				at(parts[i], method, causedBy);				
		}
	
		function at(obj, method, causedBy)
		{
			if (obj && method && obj[method])
			{
				debug(getInfo(method));
				obj[method](obj, causedBy);
			}
			
			id.cos.items(obj, function(item) { at(item, method, causedBy); });
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Library
		// ------------------------------------------------------------------------------------------- //
	
		function copy(obj, update)
		{
			// Update the inserted object.
			// Only a subset is needed.
			
			for (var item in update)
				switch (item)
				{
					case Tag.services: 
						updateServices(obj, update[item]); 
						break;

					case Tag.keys: 
						//getProcess().keys = update[item].copy();
						updateKeys(obj, update[item]);
						break;

					case Tag.selected:
						// TODO: Unselect ...
						obj.selected = update[item]; 
						break;
				}
		}
	
		function has(obj, what)
		{
			return obj[what] ? obj : id.cos.items(obj, { check: function(item) { return item[what]; }, recursive: true }); 
		}
		
		function setState(state)
		{
			// if (getProcess().state != state) debug('Set state "'+state+'".');
			getProcess().state = state;
		}
		
		function getActiveTask(obj /* = process */)
		{
			var item;
		
			// First, 
			// prefer the COS driven choice. 
			
			if (obj.items) for (var i = obj.items.length; i--; )
			{
				item = obj.items[i];
			
				if (item.isTask() && item.isSelected())
					return item;
			}
			
			// Second,
			// take the given choice by the DOM.
			// Maybe not the best solution ...
			
			var $task = obj.getPlace().find('div.'+Class.selected);
			
			if ($task.exist())
			{
				var tid = $task.attr('id');

				if (obj.items) for (var i = obj.items.length; i--; )
				{
					item = obj.items[i];
			
					if (item.isTask() && item.id === tid)
						return item;
				}
			}

			return null;
		}
	
		// ------------------------------------------------------------------------------------------- //
		// Snippets for Package
		// ------------------------------------------------------------------------------------------- //
	
		// Basic References
	
		function getRootName()         { return root; } 
		function getOwnerName()        { return owner; }
		function getMyName()           { return self; }
		function getIndex()            { return self; }
		
		function getRoot()             { return objectOf(getRootName()); }
		function getOwner()            { return objectOf(getOwnerName()); }
		function getSelf()             { return objectOf(getMyName()); }
		
		// Business Objects References

		function getProcessName()      { return root; }
		function getTaskName()         { return task; }

		function getProcess()          { return objectOf(getProcessName()); } 
		function getTask()             { return objectOf(getTaskName()); }
		function getKeys()             { return getProcess().keys || null; }
		
		// Home
		
		function getHome()             { return $(document.body); }
		function getContent($content)  { return $content || $('#'+Place.content); }
		function getScope()            { return owner ? objectOf(owner).getPlace() : getHome(); }
		function getPlace()            { return $place; }
		function setContent($aContent) { return $content = $aContent; }
		function setScope($aPlace)     { return owner ? objectOf(owner).setPlace($aPlace) : null; }
		function setPlace($aPlace)     { return $place = $aPlace; }

		// Properties
		
		function getInsert()           { return obj; }
		function getUpdates()          { return updates; }
		function getType()             { return type; }
		function getInfo(mode, aObj)   { var op = obj || aObj; return (mode ? mode.toUpperCase()+' ' : '')+ (op ? op.getIndex()+' ('+op.getType()+')' : ''); }

		// Is ...

		function isCursor(flag)         { if (flag != undefined) cursor = this.getIndex(); return obj.getIndex() == cursor.getIndex(); }
		function isWidget(flag)         { if (flag != undefined) getRoot().widget = flag; return getRoot().widget ? true : false; }
		function isSubtask()            { return isTask() && getOwner().isTask(); }
		function isTask()               { return type == Type.task; }
		function isProcess()            { return type == Type.process; }
		function isRoot()               { return getOwner() == undefined; }
		function isSelected()           { return obj.selected; }
		function isHandled()            { return package; }
		function isContent(flag)        { if (flag != undefined) content = flag; return content; }
		function isInit()               { return modeOf(this) == Mode.init; }
		function isUpdate()             { return modeOf(this) == Mode.update; }
		function isReset(flag)          { if (flag != undefined) getRoot().reset = flag; return getRoot().reset; }
		function isState(state)         { return getProcess().state == state; }
		
		// Has ...

		function hasSubtasks(flag)     { if (!task) return false; if (flag != undefined) getTask().hasSubtask = flag ? true : false; return getTask().hasSubtask; }
		function hasModal(flag)        { if (flag != undefined) getProcess().hasModal = flag ? true : false; return getProcess().hasModal;  }
		function hasChanges(n)         { if (!task) return 0; if (n != undefined) getTask().changed = n; return getTask().changed; }
		function hasUpdates(n)         { if (!task) return 0; if (n != undefined) getTask().updated = n; return getTask().updated; }
		function hasErrors()           { return has(this, Tag.error); }
		function hasWarnings()         { return has(this, Tag.warning); }
		function hasStatus()           { return has(this, Tag.status); }
		function hasInit()             { return this.hasService(Service.init); }
		function hasExit()             { return this.hasService(Service.exit, true); }
		function hasChange()           { return this.hasService(Service.change); }
		function hasSelect()           { return this.hasService(Service.select); }
		function hasTimer()            { return this.hasService(Service.timer); }
		function hasService(trigger, recursion) { return id.cos.hasService(this, trigger, recursion); }
		function hasRequestFormat(requestFormat, recursion) { return id.cos.hasRequestFormat(this, requestFormat, recursion); }

		// Misc ...

		function call(service, options) { return id.service.call(obj, service, options); }
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function getObject(index)
	{
		index = index || cursor; 
		
		return parts[index] ? parts[index] : id.error(me+'Sorry, object ['+index+'] is unknown.');
	}
	
	function getCursor()  { return parts[cursor]; }
	function getContent() { return $content || $('#'+Place.content); }
	
	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function debug(message, options) { id.debug(me+message, $.extend({ type: id.object.id }, options)); }

	id.object.all = function(show) { return all({ show: show }); }
	id.object.dump = function() { all({ show: true }); }

	function all(options)
	{
		if (options)
		{
			if (options.show)
			{
				if (options.index) show(parts[options.index], options.prefix);
				else { id.tell('Table of Parts:'); for (var i in parts) if (parts.hasOwnProperty(i)) show(parts[i]); }
			}
		}

		return parts;

		function show(obj, prefix)
		{
			id.tell((prefix ? prefix : '')
				+ 'Object['+(obj.getIndex ? obj.getIndex() : obj.id) +'] = '
				+ '{ '
				+ 'type: \'' + (obj.getType ? obj.getType() : obj.type)+'\''
				+ ', $place: \''+ (obj.getPlace ? obj.getPlace().selector : obj.$place)+'\''
				+ (obj.isContent && obj.isContent() ? ' [content]' : '')
				+ (obj.isModal && obj.isModal() ? ' [modal]' : '')
				+ (obj.hasUpdates && obj.hasUpdates() ? ', '+obj.hasUpdates()+' update' + (obj.hasUpdates() != 1 ? 's ' : ' ') : '')
				+ (obj.hasChanges && obj.hasChanges() ? ', '+obj.hasChanges()+' change' + (obj.hasChanges() != 1 ? 's ' : ' ') : '')
				+ ' }'
			);
		}
	}

}());