/*
	File: template.js
	Purpose: Managing the services related templates (HTML files).
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.template =
	{
		id: 'template',
	
		init: init,
		update: init /* no difference yet */,
		load: load,

		getFile: getFile,
		getVersion: function() { return templates ? templates.version : false; },
		
		setPath: function(path) { prefs.path = path; },
		setPreload: function(flag) { prefs.preload = flag || false; },
		setPreset: function(flag) { prefs.preset = flag || false; },

		isHTML:  function() { return Type.html; },
		isChart: function() { return Type.chart; },

		isModal: function(service) { var t = get(service); return t ? t.modal : false; }
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Preferences

	var prefs = { preload: false, preset: false };

	// Vocabulary
	
	var Class = { part: 'part', slide: 'slide', isModal: 'isModal'};
	var Place = { content: 'content' };
	var COS = { authorization: 'authorization' };
	var Type = { html: 'html', chart: 'chart' };
	var Reply = { html: 'html', script: 'script' };

	// Object Variables

	var me = id.meOf(id.template);
	var ns = id.namespaceOf(id.template); 

	var templates = 0;

	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
//		if (!check(obj))
//			return id.error(me+'Template map is invalid or maybe obsolete!', { critical: true });
	
		var version = versionOf(obj);
	
		if (version == 1)	id.warning(me+'Using DEPRECATED template map "'+obj.id+'"!');
		else id.note(me+'Using newest version of template map.');
	
		templates = obj;
		templates.version = version;
		
		if (prefs.preload) preload();
		if (prefs.preset)  preset();
	}
	
	function versionOf(obj)
	{
		// Template format have changed a lot,
		// so check for compatibility.
	
		for (var i = 0; i < obj.items.length; i++)
			if (!obj.items[i].index) 
				return /* version */ 1;
		
		return /* version */ 2;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Load
	// ---------------------------------------------------------------------------------------------- //

	function load(obj, options)
	{
		// Templates are HTML or JSON based structures,
		// which have to loaded on the fly
		// and filled then by the object.

		if (!templates)
			return id.error(me+'No templates map loaded!', { critical: true });

		var type = options.templateType || Type.html;
		var reply = type == Type.chart ? Reply.script : Reply.html;  
		var template = find(obj, type);

		if (!template)
			return id.error(me+'No template found for "'+obj.getIndex()+'".');

		$.extend(options, { obj: obj, template: template });

		if (template.loaded)
		{
			if (!prefs.preload) debug('CACHE '+obj.getIndex());
			finalize(template.loaded, true, options);
		}
		else
		{
			id.note(me+'LOAD "'+template.file+'" for "'+obj.getIndex()+'".');
			id.service.load(urlOf(template, type), $.extend(options, { replyFormat: reply }), finalize);
		}

		return true;

		// Functions

		function finalize(file, status, options)
		{
			var obj = options.obj;
			var template = options.template;
			var version = templates.version;
			
			template.modal = template.modal || $(file).find('.'+Class.isModal).exist();
			template.loaded = file;
			
			if (!template.modal)	
				id.object.unload();
			
			if (options.afterLoad)
				return options.afterLoad(file, obj, options);
			
			if (version == 1 || template.type == Type.html)
			{
				if (template.modal)
				{
					// TODO: Move to Modal Package
					// Show a modal dialog
					// using third party 'Boxy'.
		
					var dialog = new Boxy(file, { title: id.cos.labelOf(obj), windowMode: (obj.type == COS.authorization ? 'login' : ''), draggable: true, modal: false, unloadOnHide: true, cache: true, afterHide: function() { obj.hide(); }});
	
					options.$place = dialog.boxy;
					dialog.obj = obj;
					
					obj.isModal(true, { boxy: dialog });
				}
				else
				{
					// Replace the content in
					// the given Place.
	
					options.$place = $('#'+Place.content);
					options.$place.empty().html(file /* inclusive place */).children(/*DIVs*/)/*.hide()*/;
					
					obj.isContent(true);
				}
	
				// Maybe there are some auto called services
				// in the loaded conent.
	
				id.service.autocall({ $place: options.$place, startup: options.startup });
			}

			// And now .. realize the object
			// in the loaded template.
			
			if (options.afterInjection)
				options.afterInjection(obj, options);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Preload
	// ---------------------------------------------------------------------------------------------- //
	
	function preload()
	{
		// Preload all templates
		// at startup for using the cache.
	
		id.section();
		id.note(me+'Starting preload of templates.');
		
		for (var i = 0; i < templates.items.length; i++)
		{
			var template = templates.items[i];
			
			template.loaded = localStorage.getItem(urlOf(template)); 
			debug('PRELOAD '+template.url+(template.loaded ? 'from local storage' : '')+'.');

			if (!template.loaded)
				id.service.load(urlOf(template), { template: template , replyFormat: Reply.html }, function(file, status, options)
				{
					options.template.loaded = file;
				});
		}
		
		id.section();
		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Preset
	// ---------------------------------------------------------------------------------------------- //
	
	function preset()
	{
		// Build up a multi part content
		// for animation between content switches.
	
		id.section();
		id.note(me+'Starting preset of templates.');
		
		var $place = $('#'+Place.content);
		
		$place.empty();
		
		for (var i = 0; i < templates.items.length; i++)
		{
			var part = templates.items[i].loaded;
			
			if (part) 
			{
				id.debug(me+'PRESET "'+id.htmlOf(part)+'".');
				$place.append('<div class="'+Class.part+' '+Class.slide+'">'+part+'</div>').hide();
			}
		}
				
		id.object.isMultiPart(true);
				
		$place.show();
		id.section();
		
		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function getFile(obj, type) 
	{ 
		var template = find(obj, type);
		
		return template ? urlOf(template) : null; 
	}

	function find(obj, type)
	{
		// The result of a service call may fill a HTML based structure.
		// Maybe the HTML based structure isn't on the page already -
		// in this situation the right template is find via map.
		// This map is defined in template.json (typically).

		if (!templates)
			return 0;
			
		var items = templates.items;
		var version = templates.version;
		type = type || Type.html;

		for (var i = 0; i < items.length; i++)
		{
			if (items[i].index && items[i].index == obj.getIndex() && items[i].type == type) return items[i];
			if (items[i].id && items[i].id == obj.id) return items[i];
		}

		return 0;
	}
	
	function urlOf(template) {	return (templates.version == 1 && prefs.path ? prefs.path : templates.path)+'/'+template.file; }
	
	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function debug(message) { id.debug(me+message, { type: id.template.id }); }

	id.template.dump = function dump()
	{
		if (templates) for (var i = 0; i < templates.items.length; i++)
		{
			var template = templates.items[i];
			id.tell('Template['+template.id+'] = { '+template.file+(template.loaded ? ', loaded ['+id.htmlOf(template.loaded)+']' : '')+(template.modal ? ', modal' : '')+' }', { always: true });
		}
	}

}());
