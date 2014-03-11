/*
	File: catalog.js
	Purpose: A widget for tree navigation and editing.
	Note: Using pattern (trial) 
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Preferences
	// ---------------------------------------------------------------------------------------------- //

	var prefs = 
	{ 
		minLevel: 0, 
		openLevel: 10, 
		autoClose: false, 
		nextOnCopy: true 
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Public
	// ---------------------------------------------------------------------------------------------- //
	
	id.gui.catalog =
	{
		id: 'catalog',
		
		init: init,
		add: add,
		update: update,
		
		prefs: prefs
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var COS = { catalog: 'catalog', text: 'text' };
	var Class = { isCatalog: 'isCatalog', icon: 'icon', comment: 'comment', label: 'text', source: 'source', level: 'l', root: 'root', status: 'status', message: 'message', opened: 'opened', disabled: 'disabled', focused: 'focused', selected: 'selected', none: 'none', list: 'list', item: 'item', withStatus: 'withStatus', isCatalog: 'isCatalog', error: 'error', isWarning: 'isWarning', warning: 'warning', view: 'view', edit: 'edit', selectbox: 'selectbox', done: 'done' };
	var Place = { view: 'view', comment: 'comment', entry: 'desc', save: 'save', buttons: 'actions', copy: 'copy', remove: 'delete', add: 'add', up: 'up', down: 'down', newEntry: 'questionLevel' };
	var Data = { level: 'data-level', key: 'key', mark: 'data-mark', adapter: 'data-adapter', openLevel: 'data-openLevel', text: 'data-text' };
	
	var me = id.meOf(id.gui.catalog);
	var ns = id.namespaceOf(id.gui.catalog); 
	
	var openLevel;
	var autoClose;
	
	// ---------------------------------------------------------------------------------------------- //
	// Package Load
	// ---------------------------------------------------------------------------------------------- //

	id.object.register(id.gui.catalog, { docType: Class.isCatalog, serializer: serialize, cosType: COS.catalog /* DEPRECATED */ });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		// Multiple select provided by one or two lists,
		//	one list for selecting elements,
		//	one list with editable elements.
			
		var $view = obj.getScope().find('.'+Class.view);
		var $edit = obj.getScope().find('.'+Class.edit);
		
		var setLevel = obj.editable ? false : $view.attr(Data.openLevel) || $edit.attr(Data.openLevel) || obj.openLevel;
		
		openLevel = (setLevel || prefs.openLevel) - 1;
		autoClose = (setLevel && setLevel > 0) || prefs.autoClose;
		
		if (obj.label) 
			setLabel(obj);
		
		if (obj.editable)
		{
			setEdit(obj, $edit);
			setButtons(obj, $edit, $view);

			addList(obj, $edit, { edit: true });
		}
		else // Only view/select mode
		{
			addList(obj, $view);
		}
	}
	
	function add(obj)
	{
		var $view = $('<div id="'+Place.view+'" class="'+Class.view+' '+Class.selectbox+' '+Class.isCatalog+'"></div>');

		addList(obj, $view);
		return $view;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Update
	// ---------------------------------------------------------------------------------------------- //
	
	function update(updates)
	{
		// Today, only fo tree select ...

		var obj = updates.getInsert();
		var $list = obj.getScope().find('.'+Class.view);
		var $item, $from, $selected;

		// First,
		// merge the object with the update.

		merge(obj, updates);

		// Second,
		// render the update.
		
		$from = $list.find('.'+Class.selected);
		$from.removeClass(Class.selected);
		
		id.cos.items(updates, function(item)
		{
			$item = $list.find('#'+item.value);
			
			if ($item.exist()) $item.getParent().open();
			else openBranch($list, obj, item.value);
			
			if (item.selected) 
				selectItem($list, $item, { force: true });
				

			if (item.status) 
				$item.children('span.'+Class.status).removeClass().addClass(Class.status).addClass(item.status);
		});

		if (autoClose)	
			$list.closeOthers();
	
		function merge(obj, updates)
		{
			var items = id.cos.collect(obj, { selected: true });
			
			if (items) $.each(items, function(i, item) { delete item.selected; });
			if (updates.items) $.each(updates.items, function(i, item) { $.extend(objOf(obj, item.value), item); });
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Set Label
	// ---------------------------------------------------------------------------------------------- //
	
	function setLabel(obj) 
	{
		if (!obj.label)	
			return false;

		var $label = obj.$place.parent(/*td*/).children('label');
		var required = obj.required != undefined ? obj.required : $label.text().indexOf('*') != -1;
	
		$label.text(obj.label + (required == true ? ' *' : ''));
	}

	// ---------------------------------------------------------------------------------------------- //
	// Edit Areas
	// ---------------------------------------------------------------------------------------------- //
			
	function setEdit(obj, $edit)
	{
		// #TODO
		// Not a common solution ...
	
		var $entry = obj.getScope().find('#'+Place.entry);
		var $comment = obj.getScope().find('#'+Place.comment);
		
		$edit.prev('label').text(id.lang.get('questions'));
		$entry.parent('div').prev('label').text(id.lang.get('question'));
		$comment.parent('div').prev('label').text(id.lang.get('aspects'));
	}

	// ---------------------------------------------------------------------------------------------- //
	// Add List
	// ---------------------------------------------------------------------------------------------- //
	
	function addList(obj, $list, options)
	{
		options = options || {};

		// Init list object
		
		$list.unbind();
		$list.cursor = $list;
		$list.level = -1;

		// Options		
		// Check on status element .. only the first element, which should work fine.

		options.init = true;
		options.status = obj.items && obj.items.length > 0 && obj.items[0].status;

		// Build up the tree .. 
		// for performance reasons in a cache, finally append by jQuery.
		
		addBranch(obj, $list, options);
		
		// Open the selected items
		
		var result = id.cos.collect(obj, { selected: true });
		
		if (result)
			for (var i = 0, n = result.length; i < n; i++)
				openBranch($list, obj, result[i].value);
		
		// Events
		// Note: Events set for the hole tree at once,
		// differentiated by the event handler. 
		
		$list
			.bind('click'+ns, { obj: obj, $list: $list, edit: (options && options.edit) }, onSelect)
			.bind('mouseover'+ns, onFocus).bind('mouseout'+ns, offFocus)
			.bind('keypress'+ns, { $list: $list }, onKey);

		var $cursor = $list.find('li.'+Class.selected).exist() ? $list.find('li.'+Class.selected): ($list.find('li:first').exist() ? $list.find('li:first') : $list.children());

		if ($cursor.exist())
		{
			selectItem($list, $cursor, { force: true });
			editItem(obj.getScope(), $list, $cursor);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Open Branch
	// ---------------------------------------------------------------------------------------------- //

	function openBranch($list, obj, value)
	{
		var branch = branchOf(obj, value);

		if (!branch)
		{
			id.error(me+'Invalid or unknown key "'+value+'".');
			return true /* continue */; 
		}

		for (var i = 0, n = branch.length; i < n; i++)
		{
			var item = branch[i];
			var $item = $list.find('#'+item.value);	

			if ($item.missed())
			{
				$at = $list.find('#'+parentOf(obj, item.value).value);
				addBranch(parentOf(obj, item.value), $list, { $at: $at, open: 1 });
				$item = $list.find('#'+item.value);	
			}

			if (i < (n-1))
				$item.addClass(Class.opened);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Add Branch
	// ---------------------------------------------------------------------------------------------- //
	
	function addBranch(obj, $list, options)
	{ 
		options = options || {};

		var $at = options.$at;
		var level = $at ? $at.getLevel() : $list.level;
		var open = options.open ||openLevel - level;
		var $cache = $(_addBranch(obj));

		if ($at) $list.insert($cache, $at);
		else $list.html($cache);
		
		return $cache;
		
		function _addBranch(obj, cache)
		{
			cache = cache || '';

			$list.level = ++level;
			open--; 

			cache += htmlStartOf(level, open, options);
				
			if (options.init)
				options.init = false /* only once */;
				
			if (obj.items) $.each(obj.items, function(i, item)
			{ 
				// id.debug(me+'ADD branch '+item.index+') '+item.label);
				cache += htmlEntryOf(item, level, open, options);
	
				if (open > 0 && item.items)
					cache = _addBranch(item, cache);
			});
			
			cache += htmlEndOf();
			$list.level = --level;
			open++;
			
			return cache;
		}
	}

	function htmlStartOf(level, open, options)
	{
		options = options || {};
		
		var cache = '';
	
		cache += '<ol '+Data.level+'="'+level+'"';
		cache += ' class="'+(Class.level+level)+(options.init ? ' '+Class.root : '')+(options.init && options.status ? ' '+Class.withStatus : '')+(open >= 0 ? '' : ' '+Class.none);
		cache += '">';
		
		return cache;
	}

	function htmlEntryOf(obj, level, open)
	{
		var value = id.cos.valueOf(obj);
		var cache = '';

		cache += '<li id="'+value+'"';
		cache += ' class="'+Class.item+(obj.selected ? ' '+Class.selected : '')+(obj.items ? ' '+Class.list+' '+(open > 0 ? Class.opened : '') : '')+'" '+Data.level+'="'+level+'">';
		if (obj.status) cache += '<span class="'+Class.status+' '+obj.status+'"></span>';
		cache += '<span class="'+Class.icon+'"></span>';
		cache += '<span class="'+Class.label+'" '+Data.text+'="'+escape(obj.label ? obj.label : value)+'">'+(obj.label ? obj.label.toEntity() : value)+'</span>';
		cache += '<span class="'+Class.source+' '+Class.none+'">'+(obj.source ? obj.source : '')+'</span>';
		cache += '<p class="'+Class.comment+' '+Class.none+'">'+(obj.comment ? escape(obj.comment) : '')+'</p>';
		cache += '</li>';

		return cache;
	}

	function htmlEndOf()
	{
		return '</ol>';
	}

	// ---------------------------------------------------------------------------------------------- //
	// Select
	// ---------------------------------------------------------------------------------------------- //
	
	function selectItems($list, $item)
	{
		// Select all items between
		// the first and selected item.

		$item.addClass(Class.selected);
		
		var $items = $list.find('li');
		var $selected = $items.filter('li.'+Class.selected);
		var count = 1;
		
		if ($selected.size() > 1)
		{
			var begin = false;

			$selected.filter('li:first').attr(Data.mark, '1');
			$selected.filter('li:last').attr(Data.mark, 'n');			

			$items.each(function(i, item)
			{
				if (!begin) 
				{ 
					// Find the first selected item ...
					// .. then begin to select.
					
					if ($(item).attr(Data.mark))
					{
						$(item).removeAttr(Data.mark);
						begin = true; 
					}
					
					count = i;
					return true /* = continue */;
				}				
				else 
				{
					// Find the last selected item ..
					// then stop to select.
		
					if ($(item).attr(Data.mark))
					{
						$(item).removeAttr(Data.mark);
						count = i+1-count; 
						
						return false /* = break */;
					}
				}
		
				$(item).addClass(Class.selected);
			});
		}

		switchButtons(count, $list.isEdit());
		return count;
	}

	function selectItem($list, $item, options)	
	{
		// Unique select ..
		// .. unselect a selected entry.
	
		options = options || {};
	
		if (!$item.isItem())
			return false;
	
		var $items = $list.find('.'+Class.selected);
		var selected = $items.size() > 1 ? false : $item.hasClass(Class.selected);

		if (!options.add)		
			$items.removeClass(Class.selected);

		if (!selected /* before */ || options.force) 
		{
			$list.setCursor($item);
			$item.addClass(Class.selected);

			if (autoClose)	
				$list.closeOthers();
		}
		else 
		{
			$list.setCursor();
			$item.removeClass(Class.selected);
		}
		
		//$item.parent().prev().open();
		
		switchButtons(!selected || options.force ? 1 : 0, $list.isEdit());
		return !selected || options.force ? 1 : 0;
	}			
	
	function editItem($scope, $list, $item, count)
	{
		if (count == undefined)
			count = $item ? 1 : 0;
		
		// Allow editing by input fields (question, aspects)
		//	synchronized with tree.
		
		if (count == 1)
		{
			var entry = $item.hasLabel() ? $item.getLabel().attr(Data.text) : '';
			var comment = $item.hasComment() ? $item.getComment().text() : '';

			$scope.find('#'+Place.entry)
				.val(unescape(entry).fromEntity())
				.bind('keyup'+ns, { $list: $list }, onEdit)
				.focus();
			
			$scope.find('#'+Place.comment)
				.val(unescape(comment).fromEntity())
				.bind('blur'+ns, { $list: $list }, onEditComment);
		}
		else
		{
			// Since there is a multiple select
			// no editing is allowed. 
		
			$scope.find('#'+Place.entry).unbind(ns).val('');
			$scope.find('#'+Place.comment).unbind(ns).val('');
		}

		$list.setCursor($item);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //
	
	function onFocus(e)
	{
		var $item = $(e.target); 

		if ($item.is('span'))
			$item = $item.parent('li');

		$item.addClass(Class.focused);	
	}

	function offFocus(e)
	{
		var $item = $(e.target); 

		if ($item.is('span'))
			$item = $item.parent('li');

		$item.removeClass(Class.focused);	
	}

	function onFold(e)
	{
		// Handled by the 
		// onSelect() 
	
		var $list = e.data.$list;
		var $item = $(e.target).parent('li');
		var obj = e.data.obj;
		
		if ($item.hasClass(Class.opened)) $item.close();
		else $item.open($list, obj);
			
		return false /* don't bubble */;
	}
	
	function onSelect(e)
	{
		var $item = $(e.target);

		// First: Un/fold functionality 

		if ($item.hasClass(Class.isCatalog))
		{
			// Click in catalog whitespace
			// not a click on item.
		
			e.stopPropagation();
			return false;
		}

		if ($item.hasClass(Class.icon))
			return onFold(e);
		
		// Second: Tree Select

		var obj = e.data.obj;
		var $scope = obj.getScope();
		var $list = e.data.$list;
		var edit = e.data.edit ||false;

		if ($item.is('span'))
		{
			// Click on children of list item means:
			// click on list item.

			$item = $item.parent('li');
		}

		if (obj.hasSelect())
		{
			if (obj.call(obj.hasSelect(), { $form: obj.getScope(), parameters: [{ id: obj.id, value: $item.attr('id') }]}) == false)
				return false;

			selectItem($list, $item);
			return /* done */;
		}

		// Third: Tree Edit Select

		count = e.shiftKey ? selectItems($list, $item) : selectItem($list, $item /* EXPERIMENTAL */ /*, { add: e.altKey ||e.ctrlKey }*/);

		// Forth: Tree Item Edit

		if (edit)
			editItem($scope, $list, $item, count);
	}

	function onEdit(e)
	{
		// Update the tree entry,
		// immediately.

		e.data.$list.getCursor().setLabel($(this).val()).getLabel().attr(Data.text, escape($(this).val()));
	}

	function onEditComment(e)
	{
		// Update the comment,
		// saved in the tree.
	
		e.data.$list.getCursor().getComment().text($(this).val()); 
	}

	function onAdd(e)
	{
		if (!e.data.isActive()) 
			return false;
		
		var $list = e.data.$edit;
		var $selected = e.data.obj.getScope().find('#'+Place.newEntry).find('.'+Class.selected);
		var level = $selected.attr(Data.key);
		var $item = $(htmlEntryOf({ label: $selected.text() }, level, 1));

		// .. then: add.

		addItem($list, $item, level);
		$item.click();
	}

	function onMove(e)
	{
		if (!e.data.isActive()) 
			return false;
		
		var obj = e.data.obj;
		var $list = e.data.$edit;
		var $item = $list.find('.'+Class.selected);
		var dir = e.data.place == Place.up ? 'up' : 'down';

		moveItem(obj, $list, $item, dir);
	}

	function onRemove(e)
	{
		if (!e.data.isActive()) 
			return false;
		
		var obj = e.data.obj;
		var $list = e.data.$edit;
		var $items = $list.find('.'+Class.selected);
		
		$items.each(function() { deleteItem(obj, $list, $(this)); });
	}
		
	function onCopy(e)
	{
		if (!e.data.isActive()) 
			return false;
		
		var $from = e.data.$view.children('ol');
		var $to = e.data.$edit;
		var $item = $(e.target);

		copyItems($from, $to);
	}
	
	function onKey(e)
	{
		if (e.which == id.keys.az.first && e.ctrlKey)
		{
			e.data.$edit.find('li').addClass(Class.selected);
			return false /* everything's done */;
		}

		return true /* bubbling */;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Buttons
	// ---------------------------------------------------------------------------------------------- //

	var buttons = 
	{ 
		// Add, Remove for changing the tree content.
		// Up, Down for changing the order.
		// Copy for importing from a view.
	
		add:    { place: Place.add,    onClick: onAdd },
		remove: { place: Place.remove, onClick: onRemove },
		copy:   { place: Place.copy,   onClick: onCopy },
		up:     { place: Place.up,     onClick: onMove },
		down:   { place: Place.down,   onClick: onMove }
	};
			
	function setButtons(obj, $edit, $view)
	{
		var button, $place; 
	
		// Driven by
		// dialog items 
	
		for (var i in buttons)
		{
			button = buttons[i];
			$place = obj.getScope().find('#'+button.place);
			
			if ($place.exist())
			{
				$.extend(button, { $place: $place, obj: obj, $edit: $edit, $view: $view });
				$place.children('span').text(id.lang.get(button.place));

				if (obj.locked) $place.addClass(Class.disabled);
				else $place.unbind('click'+ns).bind('click'+ns, button, button.onClick);
			}			

			button.isActive = function() { return this.$place && !this.$place.hasClass(Class.disabled); };
		}
	
		// Driven by
		// business logic
	
		switchButtons();
	}
	
	function switchButtons(selected, edit)
	{
		var button = edit ? buttons.remove : buttons.copy;

		switch (selected)
		{
			case 0: disable([button, buttons.up, buttons.down]); break;
			case 1: enable([button, buttons.up, buttons.down]); break;
			case undefined: disable([buttons.copy, buttons.remove, buttons.up, buttons.down]); break;
			default: enable([button]); disable([buttons.up, buttons.down]);
		}
		
		function enable(items)  { for (var i = 0; i < items.length; i++) if (items[i].$place) items[i].$place.removeClass(Class.disabled); }
		function disable(items) { for (var i = 0; i < items.length; i++) if (items[i].$place) items[i].$place.addClass(Class.disabled); }
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Save
	// ---------------------------------------------------------------------------------------------- //
	
	function serialize(map, field, $element, wanted)
	{
		// This function is called by the service form serializer.
		// If it find a attribute 'adapter', then it calls the
		// object based save() function.
	
		if (wanted(field))
		{
			var $list = $element;
			build(map.catalog = { id: field, type: 'catalog' }, $list.children('ol').children());
		}

		return map;
		
		function build(obj, $list)
		{
			// Build a JSON based presentation
			// of the HMTL based tree.

			var $ip, op, value;
			
			obj.items = [];
			
			for (var i = 0, j = 0; i < $list.length; i++)
			{				
				$ip = $list.eq(i);
				
				if ($ip.isItem())
				{
					op = obj.items[j++] = {};
					op.type = COS.text;
					
					value = $ip.attr('id'); if (value.length) op.value = value;
					value = $ip.find('span.'+Class.label).attr(Data.text); if (value.length) op.label = unescape(value); 
					value = $ip.find('span.'+Class.source).text(); if (value.length) op.source = value; 
					value = $ip.getComment().text(); if (value.length) op.comment = unescape(value);

					if ($ip.hasClass(Class.selected))
						op.selected = true;
				}
			
				if ($ip.hasChilds())	
					build(op, $ip.getChilds());
			}
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Errors ..
	// ---------------------------------------------------------------------------------------------- //

	function addMessage($place, message)
	{
		var $p = $('<p>'+id.lang.get(message)+'</p>');
	
		delMessage($place);
		$place.after($p);
		$p.addClass(Class.message).addClass(Class.error).fadeIn('slow');
	}
	
	function delMessage($place)
	{
		$place.next('p.'+Class.message).remove();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Basic Tree Operations
	// ---------------------------------------------------------------------------------------------- //

	function addItem($list, $item, level)
	{
		var addLevel = level || $item.getLevel() || prefs.minLevel;
		var curLevel = $list.getCursor().getLevel();
		
		if (addLevel > curLevel) { if (plusLevel($list, { level: addLevel }) == false) return false; }
		else if (addLevel < curLevel) minusLevel($list, { levels: curLevel-addLevel } );
		
		// Set an internal key
		// basic operations.
		
		$list.insert($item); 
		
		id.object.change();		
	}

	function deleteItem(obj, $list, $item)
	{
		var $prev, $listOfItem;

		if ($item.hasChilds())
			$item.getList().remove();

		var $listOfItem = $item.parent();
		var $prev;
		
		if (!($prev = $item.predecessor()))
			$prev = $item.successor();
			
		$item.remove();
		
		if ($listOfItem.isEmpty())
		{
			$listOfItem.removeList();
			if ($prev) $prev.removeClass(Class.list+' '+Class.opened);
		}
		
		if ($prev) $prev.click();
		else editItem(obj.getScope(), $list);
		
		switchButtons($list.find('.'+Class.selected).size(), $list.isEdit());
		
		$list.setCursor($prev);
		id.object.change();
	}

	function moveItem(obj, $list, $item, dir)
	{
		var $childs = 0;
		var $target;

		if (dir == 'up')
		{
			for ($target = $item.prev(); $target.exist() && !$target.isItem(); $target = $target.prev())
				/* Skip all <ol> lists, <p> comments, ... */;

			if ($target.exist())
			{
				if ($item.hasChilds()) $childs = $item.next();
				$target.before($item);			
				if ($childs) $item.after($childs);
			}
		}
				
		else // (dir == 'down')
		{
			for ($target = $item.next(); $target.exist() && !$target.isItem(); $target = $target.next())
				/* Skip all <ol> lists, <p> comments, ... */;

			if ($target.exist())
			{
				if ($item.hasChilds()) $childs = $item.next();
				if ($target.hasChilds()) $target = $target.next();
				$target.after($item);			
				if ($childs) $item.after($childs);
			}
		}
		
		id.object.change();
	}

	function copyItems($from, $to)
	{
		var $item, $copy;
		var n = 0;
	
		$from.find('.'+Class.selected).each(function () 
		{
			$item = $(this);
			$copy = $item.clone();
				
			$copy.removeClass(Class.opened+' '+Class.list+' '+Class.selected);
				
			if (addItem($to, $copy, $item.getLevel()) != false)
			{
				selectItem($to, $copy);
				delMessage($to);
				
				n++;
			}
		});
		
		if (prefs.nextOnCopy && n == 1 && $item.successor())
			selectItem($from, $item.successor());
		
		return true;
	}
	
	function plusLevel($list, options) 
	{
		var $cursor = $list.getCursor();

		var level = $cursor.getLevel(); 
		
		if (options)
			if (options.level && options.level > (level + ($cursor.isList() ? 0 : 1))) 
			{
				// Parent list element 
				// is missed
				
				addMessage($list, 'wrongLevel');
				return false;
			}
			else delMessage($list);

		if ($cursor.hasChilds())
		{
			$list.setCursor($cursor.getList());
			return true /* everything's done */;
		}	

		var $ol = $(htmlStartOf(options.level, 1)+htmlEndOf());

		$cursor.addClass(Class.list).addClass(Class.opened);
		$list.insert($ol);
		$list.setCursor($ol);

		return true;
	}
	
	function minusLevel($list, options) 
	{
		var n = options && options.levels ? options.levels : 1;
		
		for (; n > 0; n--)
			$list.setCursor($list.getCursor().parent().prev());
		
		if (!$list.getCursor().next())
			$list.getCursor().parent();
	}
	
	jQuery.fn.open = function($list, obj)
	{
		if (this.isTree())
			this.find('.'+Class.list).open();

		if (this.hasClass(Class.list) && this.isEmpty())
			addBranch(objOf(obj, this.attr('id')), $list, { $at: this })

		if (this.hasChilds() && !this.hasClass(Class.opened))
			this.addClass(Class.opened).getList().removeClass(Class.none);
	}

	jQuery.fn.close = function()
	{
		if (this.isTree())
			this.find('.'+Class.opened).close();

		if (this.hasChilds() && this.hasClass(Class.opened))
		{
			this.removeClass(Class.opened);
			this.getList().addClass(Class.none);
		}
	}

	jQuery.fn.closeOthers = function()
	{
		var $selected = this.find('.'+Class.selected);
		
		if ($selected.missed())
			return false;
			
		$selected.close();
			
		var $branch = $branchOf($selected);
		var $all = this.find('.'+Class.opened);
		
		$all.each(function(i, other)
		{
			var found = false;
		
			$branch.each(function(j, selected) 
			{
				if ($(other).attr('id') === $(selected).attr('id'))
				{
					found = true;
					return false /* break */;
				}
			});
			
			if (!found)
				$(other).close();
		});
	}
	
	jQuery.fn.select = function()
	{
		// Item
		
		// 1) De/Select
		// 2) Open path
		// 3) Select
	}

	jQuery.fn.deselect = function($root)
	{
/*		
		var $list = this;		
		$root = $root || $list;
		var $items = $root.find('.'+Class.selected);
		
		if ($items.exist()) $items.each(function() {selectItem($list, $(this)); });
		if ($root.hasChilds()) $list.deselect($root.getList());
*/
	}

	jQuery.fn.insert = function($item, $cursor) 
	{ 
		$cursor = $cursor || this.getCursor();
	
		if ($cursor.isItem()) 
		{
			// Insert after an item (maybe with childs)
			
			if ($cursor.hasChilds()) $cursor.next().after($item);
			else $cursor.after($item);
			// $cursor.before($item);
		}
		else 
		{
			// Insert to an empty list
			
			$cursor.prepend($item);
		}
		
		return this;
	}
	
	jQuery.fn.predecessor = function(options)
	{
		options = options || {};
		
		var $prev = this.prev();

		if (!$prev.isItem())
		{
			if ($prev.isList()) $prev = $prev.find('li:last') /* there must be one, at least */;
			else if (this.hasParent()) $prev = this.getParent();
			else $prev = 0;
		}

		// if ($prev) id.debug(me+'Predecessor is: "'+$prev.getLabel().text());

		return $prev;
	}

	jQuery.fn.successor = function(options)
	{
		options = options || {};
		
		var $next = this.next(); 

		// If there's no element in the list,
		// then go up to a higher level.

		if (!$next.isItem()) 
		{
			if ($next.isList()) $next = options.sameLevel || options.up /* way back */ ? $next.next(/* skip list */) : $next.find('li:first');
			if ($next.missed()) $next = this.hasParent() ? this.getParent().successor({ up: true }) : 0;
		}
		
		// if ($next) id.debug(me+'Successor is: "'+$next.getLabel().text());

		return $next;
	}
	
	jQuery.fn.first = function()
	{
		return this.children();
	}
	
	jQuery.fn.setCursor = function($item) 
	{ 
		if (!$item) $item = this.children();
		this.cursor = $item;
		this.level = $item.getLevel() != undefined ? $item.getLevel() : -1;
		
		return this.cursor;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Object Navigation
	// ---------------------------------------------------------------------------------------------- //
	
	function objOf(obj, value)
	{
		return id.cos.items(obj, { check: function(item) { return item.value === value; }, recursive: true })
	}

	function parentOf(obj, value)
	{
		var parent = null;
	
		for (var i = obj.items && obj.items.length; i--; )
		{
			var item = obj.items[i];
		
			if (item.value === value)
			{
				parent = obj;
				break;
			}
			
			if (item.items) 
				if ((parent = parentOf(item, value)))
					break;
		}
		
		return parent;
	}

	function branchOf(obj, value)
	{
		var result = [];
		
		traverse(obj.items, value);
		
		return result.length ? result : null;
			
		function traverse(items, value)
		{
			for (var i = items.length; i--; )
			{
				var item = items[i];
			
				if (item.items)
					if (traverse(item.items, value))
						return result.unshift(item);
			
				if (item.value === value)
					return result.unshift(item);
			}
				
			return null;
		}
	}

	function $branchOf($item, $result)
	{
		$result = $result || $();

		if ($item.exist()) $result = $result.add($item);
		else return $result;
			
		return $branchOf($item.getParent(), $result);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //
	
	jQuery.fn.getCursor  = function() { return this.cursor; }
	jQuery.fn.getLevel   = function() { return Number(this.attr(Data.level)); }
	jQuery.fn.getTree    = function() { for (var tp = this; !tp.isTree(); tp = tp.parent()); return tp; }
	jQuery.fn.isTree     = function() { return this.is('div'); }
	jQuery.fn.isEdit     = function() { return this.hasClass(Class.edit); }
	jQuery.fn.isView     = function() { return this.hasClass(Class.view); }
	jQuery.fn.isOpened   = function() { return this.hasClass(Class.opened); }
	jQuery.fn.isComment  = function() { return this.is('p.'+Class.comment); }
	jQuery.fn.hasComment = function() { return this.getComment().exist(); }
	jQuery.fn.getComment = function() { return this.children('p.'+Class.comment); }
	jQuery.fn.isItem     = function() { return this.is('li'); }
	jQuery.fn.isList     = function() { return this.is('ol'); }
	jQuery.fn.isEmpty    = function() { return this.isList() ? this.find('li').missed() : this.next('ol').find('li').missed(); }
	jQuery.fn.getList    = function() { return this.next('ol'); }
	jQuery.fn.hasChilds  = function() { return this.next().is('ol'); }
	jQuery.fn.getChilds  = function() { return this.next('ol').children('li'); }
	jQuery.fn.hasParent  = function() { return this.parent().is('ol :not(.'+Class.root+')'); }
	jQuery.fn.getParent  = function() { return this.parent('ol').prev('li'); }
	jQuery.fn.getLabel   = function() { return this.children('span.'+Class.label); }
	jQuery.fn.hasLabel   = function() { return this.getLabel().exist(); }
	jQuery.fn.setLabel   = function(label) { this.getLabel().text(label); return this; }	
	jQuery.fn.getKey     = function() { return this.attr('id'); }
	jQuery.fn.removeList = function() { if (!this.hasClass(Class.root)) this.remove(); }

}());