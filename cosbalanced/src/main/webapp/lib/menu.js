/*
	File: menu.js
	Purpose: Build and use a recursive menu (with nested lists).
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.menu = 
	{ 
		id: 'menu',
	
		init: init,
		update: init /* no difference yet */
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Vocabulary
	
	var Class = { isMenu: 'isMenu', menu: 'submenu', item: 'item', opened: 'opened', disabled: 'disabled', selected: 'selected', none: 'none', external: 'external', call: 'calling' };
	var COS = { menu: 'menu' };

	// Class variables

	var me = id.meOf(id.gui.menu);
	var ns = id.namespaceOf(id.gui.menu); 
	var applicationId = id.getParameter('application.id');
	var storage = [];	
	
	id.object.register(id.gui.menu, { docType: Class.isMenu, cosType: COS.menu /* DEPRECATED */ });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{
		var $place = obj.getPlace();
		var lang = id.lang.getLang();
				
		obj = setStorage(obj);
		
		addTitle();
		addMenu($place);
				
		// Functions
		
		function addTitle()
		{	
			$place.html('<h2><a'+(obj.link ? ' href="'+obj.link+'"' : '')+'>'+(obj.label ? obj.label : obj.id)+'</a></h2>').hide();
		}
		
		function addMenu($place, menu)
		{	
			var $menu = $('<ul>');

			menu = menu || obj;
			
			$.each(menu.items, function() 
			{ 
				var $item = $(htmlOf(this, lang));

				if ((this.items || this.service || this.services) && !this.locked) $item.unbind('click'+ns).bind('click'+ns, { obj: obj, $item: $item, item: this, storage: storage }, onSelect);
				if (this.items) addMenu($item, this);

				$menu.append($item);
			});

			$place.append($menu);
		}
		
		function htmlOf(obj, lang)
		{
			var cache = '', label;
			var classes = (obj.items ? Class.menu : Class.item) + (obj.hidden ? ' '+Class.none : '') + (obj.locked || (!obj.service && !obj.services && !obj.items)  ? ' '+Class.disabled : '') + (obj.service && obj.external ? ' '+Class.external : '') + (obj.selected ? ' '+Class.opened : '');
			var label = obj.label ? (obj.label[lang] ? obj.label[lang] : obj.label) : obj.id;

			cache += '<li'+(classes.length > 0 ? ' class="'+classes+'"' : '')+'>';
			cache += '<a>'+label+'</a>';
			cache += '</li>';
				
			return cache;
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //
	
	function onSelect(e)
	{	
		var obj = e.data.obj;
		var $place = obj.getPlace();
		var item = e.data.item;
		var $item = e.data.$item;
		
		var appStorage = e.data.appStorage;
		var index;
				
		if (item.items /* submenu */)
		{
			menuIndex = $.inArray(item.id, obj.appStorage.menu);
			
			if ($item.hasClass(Class.opened)) {
				
				if (menuIndex >= 0) {
					obj.appStorage.menu.splice(menuIndex, 1);
					storage.splice(obj.appStorage.appIndex, 1, obj.appStorage );
					if (window.store) {
						store.set('menu', storage);
					}
				}
				
				$item.removeClass(Class.opened).children('ul').addClass(Class.none);
								
			} else {
				
				if (menuIndex >= 0) {
					obj.appStorage.menu.splice(menuIndex, 1, item.id);
				} else {
					obj.appStorage.menu.push(item.id);
					
				}
				
				storage.splice(obj.appStorage.appIndex, 1, obj.appStorage );
				if (window.store) {
					store.set('menu', storage);
				}
				
				$item.addClass(Class.opened).children('ul').removeClass(Class.none);
			}
		}
		else
		{
			var service = item.service && id.isString(item.service) ? { url: item.service }: item.services[0 /* only one .. */];
			var options = { $item: $item, $menu: $place, afterInit: finalize };
			
			if (!service.external) {
			    $item.addClass(Class.call);
			} else  {
			    options.direct = true;
			}
	
			id.service.call(obj, service, options);
		}

		return false /* event handled */;

		function finalize(obj, status, options)
		{
			var $elems = options.$menu.find('.'+ Class.call);
			
			$elems.each( function() {
				$(this).removeClass(Class.call);
			});
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Storage
	// ---------------------------------------------------------------------------------------------- //
	
	function setStorage(obj)
	{	
		var menu = 'menu';
		var appId;
		var time = new Date();
		var today = new Date(); today.setHours(0); today.setMinutes(0); 
		var appStorage = { appId: applicationId, time: time, menu: [], appIndex: 0 };
		
		//store.clear();
		if (window.store && window.store.get(menu)) {
			
			storage = store.get(menu);
			
			var i = id.arrayIndexOf(storage, function(item) {
				if (item.appId == applicationId) {
    				obj.appStorage = item;
    				return item.appId == applicationId;
    			}
			});
			
			var appTime = (obj.appStorage ? new Date(obj.appStorage.time) : new Date(time));

			if(today.valueOf() >= appTime.valueOf()) {		
				obj.appStorage = appStorage;
				storage.splice(i, 1, appStorage);
			} else {
				if (i == -1) {
    				obj.appStorage = appStorage;
    				storage.push(appStorage);
				} else if (i >= 0) {
					storage.splice(i, 1, obj.appStorage);
				}
			}
			
			$.each(storage, function(i, app) {
				obj.appStorage.appIndex = i;
			});
			
		} else {
			obj.appStorage = appStorage;
			storage.push(obj.appStorage);
		}
		
		$.each(obj.appStorage.menu, function(i, entry) {
			$.each(obj.items, function(j, item) {
				if(item.id == entry) item.selected = true;
			});
		});
		
		return obj;
	}

}());


