/*
	File: buttons.js
	Date: July 2009
	Purpose: Add buttons to several objects (dialog, table, ...)
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.button = 
	{
		id: 'button',

		init: init,
		update: update,
		reset: reset,
		destroy: reset,
		add: set
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { maxButtons: 5, suffix: '-button', footer: '-footer' };
	var COS = { add: 'add', remove: 'delete', cancel: 'cancel', close: 'close', multipart: 'multipart', sort: 'sort', up: 'up', down: 'down', none: 'none' };
	var Class = { button: 'button', select: 's2', disabled: 'disabled', hidden: 'none', dynamic: 'dynamic', action: 'action', wrap: 'wrap', isSelect: 'isSelect', internal: 'internal', sort: 'sort', up: 'sort_up', down: 'sort_down', changed: 'changed', showTooltip: 'showTooltip', calling: 'calling' };
	var Suffix = { footer: '-footer' };
	var Service = { button: 'button' };
	var Attr = { owner: 'data-owner' };
    var At = { broadcast: 'atBroadcast' };
	
	var me = id.meOf(id.gui.button);
	var ns = id.namespaceOf(id.gui.button); 
	
	// ---------------------------------------------------------------------------------------------- //
	// Init, Update
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj, $where, options)
	{
		reset($where, obj.type);
		return set(obj, $where, options);
	}
	
	function update(obj, $where, options)
	{
		var buttons = obj.hasButtons(/* updated = */ true);
		
		if (buttons) for (var i = 0; i < buttons.length; i++)
		{
			var button = buttons[i];
			var $button = $where.find('#'+idOf(button.id));
			
			if ($button.exist())	setButton(obj, $button, button, options);
			else addButton(obj, placeOf($where), button, options);
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Set
	// ---------------------------------------------------------------------------------------------- //

	function set(obj, $place, options)
	{
		if (!obj.hasButtons()) return false;
		
		var predefinedInDialog = 0, 
			 predefinedInFooter = 0,
			 sentByCOS = 0,
			 $button,
			 $dialog = obj.getPlace(),
			 $foot = $place,
			 buttons = obj.hasButtons(),
			 buttonInDOM;
			 
		$place.find('.'+Class.isSelect).remove();

		// id.debug( me+"COS buttons.length "+buttons.length );
        
      // Set the cancel button in modal dialogs
        
        $.each(buttons, function(i, button)
		{
			if (button.type == COS.cancel)
			{
				if (!$('#'+ idOf( button.id )).exist()) {
					addButton(obj, $place, button, options);
					button.exist = true;
				}
			}
		});
		
		// Then: Find the formed buttons ..

		$.each(buttons, function(i, button)
		{
			delete button.exist;
			
			buttonInDOM = '#' + button.id + ', #' + idOf( button.id );
			
			if (set($foot.find( buttonInDOM))) predefinedInFooter++ ;
			else if (set($dialog.find(buttonInDOM)))predefinedInDialog++ ;
			else sentByCOS++;
				
			function set($button)
			{
				if ($button.missed())
					return false;
			
				setButton(obj, $button, button, options);
				button.exist = true;
				return true;
			}
		});
		
		// Second: Add the dynamic buttons ..
		
		$place = placeOf($place);

		if ((buttons.length - predefinedInDialog) >= prefs.maxButtons) addButtonSelect(obj, buttons, $place, options);
		else addButtons(obj, buttons, $place, options, buttons.length);
	}

	function reset($place, typeOfOwner)
	{
		placeOf($place).find('['+Attr.owner+'='+typeOfOwner+']').remove();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Buttons
	// ---------------------------------------------------------------------------------------------- //

	function addButtons(obj, buttons, $place, options, count)
	{
		// Cancel button first ...
		
		$.each(buttons, function(i, button)
		{
			if (button.type == COS.cancel && !button.exist)
			{
				addButton(obj, $place, button, options);
				button.exist = true;
				
				return false /* break */;
			}
		});
		
		$.each(buttons, function(i, button)
		{
			if (!button.exist)
			{
				addButton(obj, $place, button, options);
				button.exist = true;
			}
		});
	}

	function addButtonSelect(obj, buttons, $place, options)
	{
		var $select;
		var select = {};
		var cache = '';
		
		select = {
			id: obj.id+Suffix.footer,
			label: '',
			type: COS.list,
			items: [],
			getTask: obj.getTask,
			getOwner: obj.getOwner,
			getPlace: obj.getPlace,
			broadcast: obj.broadcast
		};

		cache += '<div id="'+obj.id+prefs.footer+'" class="'+Class.isSelect+' '+Class.internal+'"></div>';
		
		$.each(buttons, function(i, button)
		{
			var item = {};
			
			item.label = id.cos.labelOf(button);
			item.value = button.id;
			item.id = idOf(button.id);
			if (button.locked) item.locked = true;
			if (button.hidden) item.hidden = true;
			
			if (i == 0) select.items.push({ label: id.lang.get('select') });
			
			if (!button.exist) 
			{ 
				item.services = []; 
				item.services.push(button); 
				select.items.push(item);
			}
			
		});
				
		$select = $(cache);
		$place.append($select);
		
		select.$place = $select;
		
		if (id.gui.select)
			id.gui.select.init(select, { button: true });
	}

	// ---------------------------------------------------------------------------------------------- //
	// Button
	// ---------------------------------------------------------------------------------------------- //

	function addButton(obj, $place, button, options)
	{ 
		var $button = $('<a id= "'+idOf(button.id)+'" '+Attr.owner+'="'+obj.type+'" class="'+Class.button+(button.requestFormat == COS.multipart ? ' disabled' : '')+'"><span></span></a>');
		
		setButton(obj, $button, button, options);
		$place.append($button);
		
		return $button;
	}
	
	function setButton(obj, $button, button, options)
	{
		// It is a Dropdown so move to Select package
		if ($button.is('li')) {
			id.gui.select.updateByButton(obj, button, $button, options);
			return false;
		}
		
		$button.attr('id', idOf(button.id));
		
		if ($button.hasClass(Class.showTooltip) || button.info) {
			$button.attr('title', button.info ? button.info : button.label);
			id.setTooltip($button);
		}

		if (button.type) $button.addClass(button.type);
		
		if (button.type == COS.sort && button.direction) { 
			$button.removeAttr('class');
			switch (button.direction) {
				case COS.up    : $button.addClass(Class.up); break;
				case COS.down	: $button.addClass(Class.down); break;
				case COS.none	: $button.addClass(Class.sort); break;
				case undefined	: $button.addClass(Class.sort); break;
			}
		}

		if (button.label)  $button.children('span').html(button.label);
		else $button.children('span').html(button.id); 

		if (button.hidden) $button.addClass(Class.hidden); 
		else $button.removeClass(Class.hidden);

		if (button.locked) { $button.addClass(Class.disabled); $button.unbind('click'+ns); }
		else $button.removeClass(Class.disabled);

		if (!(button.locked || button.hidden || button.requestFormat == COS.multipart))
			$button.unbind('click'+ns).bind('click'+ns, { obj: obj, sid: button.id, $button: $button, button: button, options: options }, onClick);

		// TODO
		// Move to Modal Package

		if (button.trigger == COS.cancel) $button.bind('click'+ns, function() { obj.hide(); return false; });
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //
	
	function onClick(e)
	{
		var obj = e.data.obj;
		var sid = e.data.sid;
		var options = e.data.options || {};
		var $button = e.data.$button;
		var button = e.data.button;
		options.afterInit = function() { endCall(obj, sid, $button, button, options); };
        options.afterCall = function() { if (obj.broadcast) { obj.broadcast(At.broadcast, obj); } };
		// var service = obj.getService(sid, { trigger: Service.button }) || obj.getService(sid, { trigger: Service.cancel })
		var service = obj.getService(sid, { trigger: Service.button });
		
		if (service.type == COS.cancel) 
		{ 
			obj.hide(); 
			if (!service.url) return false; 
		}
		
		if (options.before && (options.before(e, this) != true))	return false;
		
		if (service) {
			if (!(service.external || service.confirm)) startCall($button);
			id.service.call(obj, service, options); 
		}
		
		if (options.after) options.after(e, this);
		
		if (obj && obj.getTask && obj.getTask()) 
			if (obj.getTask().getPlace().hasClass(Class.changed)) 
				obj.getTask().getPlace().removeClass(Class.changed);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Calling
	// ---------------------------------------------------------------------------------------------- //
	
	function startCall($button) {
		$button.addClass(Class.calling);
		// $button.unbind('click'+ns);
	}
	
	function endCall(obj, sid, $button, button, options) {
		$button.removeClass(Class.calling);
		// $button.unbind('click'+ns).bind('click'+ns, { obj: obj, sid: button.id, $button: $button, button: button, options: options }, onClick);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //
	
	function placeOf($place)
	{
		// Interims
		// Support old'n'new placement 
		// of dynamic buttons ...
		
		var $dynamic = $place.find('.'+Class.dynamic);
	
		return $dynamic.exist() ? $dynamic : $place;
	}
	
	function idOf(buttonID)
	{
		return buttonID+prefs.suffix;
	}

}());