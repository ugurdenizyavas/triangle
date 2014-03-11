/*
	File: key.js
	Purpose: Keyboard handling.
	
	$Author: udy $
*/


(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
 	// ---------------------------------------------------------------------------------------------- //
	
	id.key = 
	{
		id: 'key',
	
		isNumber: isNumber,	
		isAlpha: isAlpha,
		isNavigation: isNavigation,

		isaz: isaz,
		isAZ: isAZ,
	
		isAlt: function(key)     { return key == keys.alt.code; },
		isCtrl: function(key)    { return key == keys.ctrl.code; },
		isShift: function(key)   { return key == keys.shift.code; },
		isEnter: function(key)   { return key == keys.enter.code; },
		isEscape: function(key)  { return key == keys.esc.code; },
		isSpace: function(key)   { return key == keys.space.code; },
		isTab: function(key)     { return key == keys.tab.code },
		isLeft: function(key)    { return key == keys.left.code; },
		isRight: function(key)   { return key == keys.right.code; },
		isUp: function(key)      { return key == keys.up.code; },
		isDown: function(key)    { return key == keys.down.code; },
		isBackspace: function(key)    { return key == keys.backspace.code; },

		plusAlt: function(e)     { return e.altKey; },
		plusCtrl: function(e)    { return e.ctrlKey; },
		plusShift: function(e)   { return e.shiftKey; },
		
		init: init,
		register: register,
		unregister: unregister,
		start: start,
		stop: stop,

		debug: debug,
		dump: dump
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
 	// ---------------------------------------------------------------------------------------------- //
	
	var keys = 
	{ 
		enter:     { code: 13, label: 'Enter' }, 
		esc:       { code: 27, label: 'Escape' },
		backspace: { code:  8, label: 'Backspace' },
		del:       { code: 46, label: 'Delete' },
		insert:    { code: 45, label: 'Insert' },
		tab:       { code:  9, label: 'Tab' },
		space:     { code: 32, label: 'Space' },
		home:      { code: 36, label: 'Home' },
		end:       { code: 35, label: 'End' },
		
		pageUp:    { code: 33, label: 'PageUp' },
		pageDown:  { code: 34, label: 'PageDown' },
		left:      { code: 37, label: 'Left' },
		up:        { code: 38, label: 'Up' },
		right:     { code: 39, label: 'Right' },
		down:      { code: 40, label: 'Down' },
	
		shift:     { code: 16, label: 'Shift' },
		ctrl:      { code: 17, label: 'Ctrl' },
		alt:       { code: 18, label: 'Alt' },
		cmdLeft:   { code: 91, label: 'CommandLeft' },
		cmdRight:  { code: 93, label: 'CommandRight' },

		az:        { first: 65, last: 90 },
		AZ:        { first: 97, last: 122 },
		number:    { first: 48, last: 57 },
		padNumber: { first: 96, last: 105 }
	};

	id.Keys = id.keys = keys;

	var me = id.meOf(id.key);
	var ns = id.namespaceOf(id.key); 

	var clients = [];

	// ---------------------------------------------------------------------------------------------- //
	// Init 
 	// ---------------------------------------------------------------------------------------------- //

	function init()
	{
		setEvents();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Clients 
 	// ---------------------------------------------------------------------------------------------- //
	
	function register(obj, callback, filter, options)
	{
		var index = obj.id;
		options = options || {};
	
		var modifierList = { 'ctrl': { key: keys.ctrl }, 'shift': { key: keys.shift }, 'alt': { key: keys.alt } };
		var parts, key, modifier, bind;
		var list = 0;

		id.debug(me+'REGISTER keys ['+JSON.stringify(filter)+'] for "'+index+'".');
		
		if (filter) 
		{
			if (id.isArray(filter)) {
				filter = filter.keydown = filter;
			}
			
			clients = {};
		
			$.each(filter, function(i, item) 
			{	
				list = [];
				
				$.each(item, function(j, entry) 
				{	
				
					if (entry) {
						if (parts = entry.match(/^([A-Za-z]*)\+([A-Za-z]*)/))
						{
							modifier = parts[2].toLowerCase();
							key = parts[1];
							
							if (key.length > 1 && keys[key]) {
								key = keys[key].code;
							} else {
								key = key.toUpperCase().charCodeAt(0);
							}
						}
						
						else if (parts = entry.match(/^([A-Za-z]*)/))
						{
							modifier = 0;
							key = parts[1];
							
							if (key.length > 1 && keys[key]) {
								key = keys[key].code;
							} else {
								key = key.toUpperCase().charCodeAt(0);
							}
						}
					}
		
					list.push({ modifier: modifier && modifierList[modifier] ? modifierList[modifier].key.code : undefined, key: key, trigger: entry });
					
					clients/*[index]*/[i] = { obj: obj, callback: callback, filter: list };
					
				});
								
			});
		}

		if (options.start)
			start(index);
		
		return true;
	}
	
	function unregister(obj)
	{
		var index = obj.id;
		
		if (clients[index].filter) delete clients[index].filter;
		clients[index] = undefined;

		return true;
	}

	function start(obj)
	{
		var index = obj.id;
		
		if (clients)
			clients.active = true;
	}

	function stop(obj)
	{
		var index = obj.id;
		
		if (clients)
			clients.active = false;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Events 
 	// ---------------------------------------------------------------------------------------------- //

	function setEvents()
	{
		$(document).bind('keydown'+ns+' keyup'+ns, onKey);
	}

	function onKey(e)
	{
		var key = e.which;
		
		if (isModifier(key))
		{
			// id.debug(me+'Ignoring modifier only.');
			return false;
		}

		if (clients.length > 0)
			debug(e);
		
		var modifier = getModifier(e).code;
				
		$.each(clients, function(index, item) {
		
			if (index == e.type) {
				
				
				$.each(item.filter, function(j, entry) {

					if ((entry.key === undefined || entry.key == key) && entry.modifier == modifier)
					{
						if(index == 'keydown') e.preventDefault();
						return callback(e, clients[index], entry, clients[index].obj);
					}

				});
			}
		});
					
		function callback (e, client, filter, obj) {				
			
			if (filter.key !== undefined) {
				//id.debug(me+'Trigger callback for key"'+filter.key+'" by ['+ obj.id +'].', { type: 'trigger' });
			} else {
				//id.debug(me+'Trigger callback for key"'+e.which+'" by ['+ obj.id +'].', { type: 'trigger' });
			}
			
			if (client.callback !== null) {
				client.callback(e, filter, e.which, obj);
				return false;
			}
		}
					
		// id.debug(me+'IGNORE key ['+labelOf(key)+'].')
		return true;
	}
	

	// ---------------------------------------------------------------------------------------------- //
	// Tools 
 	// ---------------------------------------------------------------------------------------------- //

	function isNumber(key) 
	{ 
		return (key >= keys.number.first && key <= keys.number.last) || (key >= keys.padNumber.first && key <= keys.padNumber.last); 			
	}
	
	function isAlpha(key, options)
	{
		return isaz(key) || isAZ(key);
	}
	
	function isNavigation(key, options) 
	{
		var inputKeys = [keys.backspace.code, keys.del.code, keys.left.code, keys.right.code, keys.tab.code];
		var areaKeys  = [keys.home.code, keys.end.code, keys.pageUp.code, keys.pageDown.code];
		var moreKeys  = [keys.enter.code, keys.esc.code];
	
		var flag = undefined;
		options = options || { all: true }
	
		if (options.input) flag = id.isMember(inputKeys, key);
		if (options.aera)  flag = id.isMember(inputKeys, key) || id.isMember(areaKeys, key);
		if (options.all)   flag = id.isMember(inputKeys, key) || id.isMember(areaKeys, key) || id.isMember(moreKeys, key); 
		
		return flag;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
 	// ---------------------------------------------------------------------------------------------- //

	function isaz(key) { return key >= keys.az.first && key <= keys.az.last; }
	function isAZ(key) { return key >= keys.AZ.first && key <= keys.AZ.last; }
	function getModifier(e) { return e.shiftKey ? keys.shift : e.altKey ? keys.alt : e.ctrlKey ? keys.ctrl : 0;	}
	function isModifier(key) { return id.isMember([keys.shift.code, keys.alt.code, keys.ctrl.code, keys.cmdLeft.code, keys.cmdRight.code], key); }
	function labelOf(key) { for (var i in keys) if (key == keys[i].code) return keys[i].label; return 0;  }

	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function dump()
	{
		var cache;
	
		for (var i in clients)
		{
			cache = 'Client['+i+'] = { ';
			
			for (var j = 0; j < clients[i].filter.length; j++)
				cache += (j > 0 ? ', ' : '')+'"'+clients[i].filter[j].trigger+'"';
				
			cache += ' }';
		
			id.tell(cache);
		}
	}

	function debug(e, action) 
	{ 
		id.debug(me+(getModifier(e) ? getModifier(e).label+'+' : '')+(labelOf(e.which) ? labelOf(e.which) : e.which)+(e.which != e.keyCode ? ' ('+e.keyCode+')'+'" ': ' ')+(action ?  action : 'pressed')+'.'); 
	}

}());

	
