/*
	File: dialog.js
	Purpose: Task/Dialog Handling
	
	$Author: udy $

*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.dialog =
	{
		id: 'dialog',
	
		init: init,
		update: update,
		resetMessages: function(obj) { id.gui.message.clearAll(obj) },
		setResetDynamicByUpdate: function(flag) { prefs.resetDynamicByUpdate = flag; }
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { resetDynamicByUpdate: false };

	// Vocabulary
	
	var css = { dynamic: 'dynamic', tableWrapper: 'tableWrapper', internal: 'internal', readonly: 'readonly', none: 'none', grid: 'gridTable', pagingBox: 'pagingBox', dataTable: 'dataTable', dataFooter: 'dataFooter', isNote: 'isNote', tooltip: 'tiptip_holder', isChart: 'isChart' };
	var attr = { readonly: 'readonly', checked: 'checked' };
	var cos = { init: 'init', update: 'update', prepare: 'prepare', list: 'list', time: 'time', text: 'text', number: 'number', flag: 'flag', label:'label', tip: 'tip', index: 'index', paging: 'paging', password: 'password', plain: 'plain', html: 'html', upload: 'upload', image: 'image', swapSelect: 'swapSelect', select: 'select', radio: 'radio', check: 'check', checkSelect: 'checkSelect', group: 'group', calling: 'calling', legendGroup: 'legendGroup', label: 'label', table: 'table' };
    
    var Mode = { init: 'init', update: 'update' };
    
	var me = id.meOf(id.gui.dialog);
	var ns = id.namespaceOf(id.gui.dialog); 

	// ---------------------------------------------------------------------------------------------- //
	// Init or update a dialog
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{	
		reset(obj);
		id.gui.message.clearAll(obj) 
		
		set(obj);	
	}
	
	function update(obj)
	{
		if (obj.hasErrors() || obj.hasWarnings() || obj.hasStatus() || obj.status === null)
			id.gui.message.clearAll(obj);
	
		if (prefs.resetDynamicByUpdate)
		{
			var $place = obj.getPlace();
			var $dynamic = $place.find('.'+css.tableWrapper + ' .' +css.dynamic);
		
			$dynamic.empty();
		}
	
		set(obj);
	}
	
	function reset(obj)
	{
		var $place = obj.getPlace();
		var $dynamic = $place.find('.'+css.tableWrapper + ' .' +css.dynamic);
		
		$dynamic.empty();
	
		// Remove all errors
		// and empty fields and textareas, Data Tables, Paging Areas
		// which maybe set by previous services
		// or HTML designer.
	
		$place.find('input, textarea').not('.'+css.internal).val('');
		$place.find('input:checked').not('.'+css.internal).attr(attr.checked, false);
		
		$place.find('.'+css.isNote).empty();
		$place.find('.'+css.pagingBox).empty();
		$place.find('.'+css.dataTable+', .'+css.dataFooter).remove();

		// Interims ..
		$place.children('form').submit(function () { return false; });
		// .. end.
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Set an existing dialog
	// ---------------------------------------------------------------------------------------------- //

	function set(obj)
	{
		var $place = obj.getPlace() || obj.$place;
		var $dynamic = $place.find('.'+css.tableWrapper + ' .' +css.dynamic);
				
		for (var i = 0; obj.items && i < obj.items.length; i++) 
		{
			var item = obj.items[i];
		
			// Object elements handled
			// by other packages (catalog, table, ...).
		
			if (item.isHandled)
			{
				// Handled by the 
				// general object manager.
			
				continue;
			}
			
			if (item.type === cos.group)
			{
				item.$place = $place.find('#'+item.id);
				var $label = item.$place.find('label:first');
				
				$label.text(id.cos.labelOf(item));
				
				if (item.mode === cos.prepare)
				{
					id.debug(me+'PREPARE "'+item.getIndex()+'" ...');
					$label.addClass(cos.calling);

					// TEST 
					// id.timer.call(function(data) { id.service.call(data, data.services[0]); }, 1000, item);
					
					id.service.call(item, item.services[0]);
				}
				else 
				{
					// ### TODO Hide ...?
					
					$label.removeClass(cos.calling);
					
					id.cos.items(item, function(member) { member.$place = item.$place.find('#'+member.id); id.object.bind(member, item.getOwner()); });
					set(item);

					// ### TODO Fade in ...?
				}
				
				continue;
			}
			
			// Missing elements or
			// adding elements dynamically.
			
			if ($dynamic.exist())
			{
				item.$place = obj.getPlace().find('#'+id.cos.jQueryID(item.id));
				
				//if (!item.hidden && item.$place.missed())
				if (item.$place.missed())
				{
					// There is a HTML area,
					// where non-set attributes can be added. 
				
					add($dynamic, item);
					item.$place = $dynamic.find('#'+item.id);
				}
			}
			else if (item.$place.missed())
			{
				id.warning(me+'Missing HTML element '+obj.getIndex()+':'+item.id+'.');
				continue;
			}
			

			// Simple elements		
	
			switch (item.type)
			{
                case cos.label      : id.gui.label.init(item); break;
				case cos.text       : id.gui.text.init(item); break;
                case cos.password       : id.gui.text.init(item); break;
				case cos.number     : id.gui.number.init(item); break;
				case cos.time       : id.gui.time.init(item); break;
				case cos.flag       : id.gui.flag.init(item); break;
				case cos.index      : id.gui.index.add(item); break;
				case cos.image      : id.gui.image.init(item); break;
				case cos.swapSelect : id.gui.swapSelect.init(item); break;
				case cos.select 	  : id.gui.newSelect[modeOf(item)](item); break;
				case cos.radio      : id.gui.radio.init(item); break;
				case cos.check      : id.gui.check.init(item); break;
				case cos.checkSelect: id.gui.checkSelect.init(item); break;
                case cos.legendGroup: id.gui.legendGroup.init(item); break;
                
                case cos.table: (item.getPlace().hasClass(css.isChart) ? id.gui.chart.init(item) : id.gui.table.init(item)); break;
				
				case cos.upload     : id.gui.upload.set(item); break;

				case undefined: id.gui.value.set(item); break;
			}
			
			//setLocked(item);
			//setHidden(item);

			if (item.selected) setFocus(item);
			if (item.check) setCheck(item);
			
			if (item.tip) id.gui.tooltip.init(item);
			if (item.error && item.type != cos.list) id.gui.message.add(item);
			if (item.warning && item.type != cos.list) id.gui.message.add(item);
			if (item.status && item.type != cos.list) id.gui.message.add(item);

			setService(item);
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Hiding, Checks, Focus, ..
	// ---------------------------------------------------------------------------------------------- //

	function setLocked(obj)
	{
		//if (obj.mode != cos.init && obj.locked == undefined) 
		//	return false;

		if (obj.locked) obj.$place.attr(attr.readonly, true).addClass(css.readonly).prev(/*label*/).addClass(css.readonly);
		else obj.$place.removeAttr(attr.readonly).removeClass(css.readonly).prev(/*label*/).removeClass(css.readonly);
	}

	function setHidden(obj)
	{
		//if (obj.mode != cos.init && obj.hidden == undefined) 
		//	return false;
	
		if (obj.hidden) obj.$place.addClass(css.none);	
		else obj.$place.removeClass(css.none);
	}
	
	function setCheck(obj, f)
	{
		obj.getPlace().unbind('change'+ns).bind('change'+ns, f ? f : obj.check);
	}
	
	function setFocus(obj) 
	{
		// Some browsers need a short break (after rendering ..),
		// before focusing.
		
		setTimeout(function() { obj.$place.focus(); }, 1);
	}

	function setService(obj)
	{
		if (obj.service)
		{
			switch (obj.service.trigger)
			{
				case cos.init: obj.getPlace().bind('focus'+ns, function() { id.service.call(obj, obj.service); }); break;
				case cos.exit: obj.getPlace().bind('change'+ns, function() { id.service.call(obj, obj.service); }); break;
			}
		}
	}
    
    function modeOf(obj) { return obj.mode || Mode.init; }

	// ---------------------------------------------------------------------------------------------- //
	// Add Elements
	// ---------------------------------------------------------------------------------------------- //
	
	function add($area, obj) 
	{
		addElement(addGrid($area), obj);
	}

	function addGrid($area)
	{
		var $grid = $area.find('.'+css.grid);
			
		if ($grid.missed())
		{
			$grid = $('<table class="'+css.grid+'"></table>');
			$area.append($grid);
		}
			
		return $grid;
	}
		
	function addElement($grid, obj)
	{
		var cache = '';
			
		cache += '<tr><td>';
		
		switch (obj.type)
		{
			case cos.text  : cache += id.gui.text.htmlOf(obj, { dynamic: true} ); break;
			case cos.number: cache += id.gui.number.htmlOf(obj, { dynamic: true} ); break;
			
			case cos.time  : cache += id.gui.time.htmlOf(obj, {dynamic: true});  break;
			case cos.flag  : cache += id.gui.flag.htmlOf(obj, {dynamic: true});  break;
			case cos.list  : cache += id.gui.newSelect.htmlOf(obj, {dynamic: true}); obj.type = cos.select; break;
			case cos.select  : cache += id.gui.newSelect.htmlOf(obj, {dynamic: true}); break;
			case cos.label : cache += id.gui.label.htmlOf(obj, {dynamic: true}); break;
			case cos.password : cache += id.gui.text.htmlOf(obj, {dynamic: true}); break;
		}
		
		cache += '</td></tr>';
		
		$grid.append(cache);
	}
	

}());