/*
	File: panel.js
	Purpose: Handling of multi tabbed dialog, called 'panel'. The functionality is simple: There
	are several DIVs with the content switched by tabs. The binding based on IDs of the DIVs and
	the tabs (which prefixed the IDs with 'tab-<ID>' to have unique IDs on a page. The object
	works with the JSON object type 'process'.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.panel = 
	{
		id: 'panel',
		
		init: init,
		update: update,
		shift: shift,
		
		showDialog: showDialog,
		getDialog: getCurrentDialog, 
		
		showProgress: showProgress,
		hideProgress: hideProgress,
		showStatus: showStatus,
		showError: showError,
		showWarning: showWarning,
		hideStatus: hideStatus,
		hideError: hideError,
		hideWarning: hideWarning,
		resetMessages: resetMessages
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Vocabulary

	var Pref = { showIconDelay: 200, fadeIn: 500, fadeOut: 1000, hideStatus: 5000 }
	var Class = { selected: 'selected', disabled: 'disabled', tabSuffix: '-tab', tabs: 'tabNav', markPrefix: 'mark-', panel: 'tabPanel', call: 'calling', status: 'status', error: 'error', warning: 'warning', changed: 'changed', asSelect: 'asSelect', isSelect: 'isSelect', internal: 'internal', tabSelect: 'tabSelect', reload: 'reload', showTooltip: 'showTooltip', taskTitle: 'taskTitle' }
	var Place = { status: 'servicestatus', sign: 'callsign', content: 'content' }
	var Event = { changed: 'changed' }
	var Suffix = { tabs: '-tabs'}
	var COS = { list: 'list', init: 'init' }

	// Session based variables
	
	var me = id.meOf(id.gui.panel);
	var ns = id.namespaceOf(id.gui.panel); 
	var box = id.gui.panel.id;

	// ---------------------------------------------------------------------------------------------- //
	// Init 
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{	
		var $tabs = obj.getPlace().find('ul.'+Class.tabs);
		
		setLayout();
		setTitle(obj);
		
		if ($tabs.exist()) {
			replaceTabs(obj, $tabs);
			id.cos.items(obj, function(item) { setTab(item); });
		} else {
            setTaskTitle(obj);
			setSelect(obj);
		}
	}

	function update(obj)
	{
		setTitle(obj);
	
		id.cos.items(obj, function(item) { setTab(item); });
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Title of Content
	// ---------------------------------------------------------------------------------------------- //

	function setTitle(obj)
	{
		// The title bar
		// above the panel
	
		if (obj.label)
			// obj.getPlace().parent().find('h2').text(obj.label).show();
			obj.getPlace().parent().find('h2.title').text(obj.label).show();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Set Layout
	// ---------------------------------------------------------------------------------------------- //

	function setLayout()
	{
		id.layout.initResolution({ panel: true });
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Tabs
	// ---------------------------------------------------------------------------------------------- //

	function replaceTabs(obj)
	{
		var $tabs = obj.getPlace().find('ul.'+Class.tabs);
		
		deselect();
		$tabs.empty();
	
		id.cos.items(obj, function(item) { $tabs.append($('<li id="'+item.id+Class.tabSuffix+'" class="'+(item.selected ? Class.selected : '' )+'"><a>'+id.cos.labelOf(item)+'</a></li>').objectOf(item)); });
	}
	
	function setTab(obj, go)
	{
		var item = { obj: obj, $tab: getTab(obj) };
		
		if (obj.label) setLabel(item, obj.label)
		if (obj.locked) disableTab(item); else enableTab(item);
		if (obj.hidden) hideTab(item); else showTab(item);
		if (obj.info) setInfo(item); else if (obj.info == '') hideInfo(item);
	}
    
    // ---------------------------------------------------------------------------------------------- //
	// Tab Dropdown and Task Title
	// ---------------------------------------------------------------------------------------------- //
	
	function setTaskTitle(obj)
	{
		var task = getSelectedTask(obj);
		
		if (task) {
			var $dialog = task.getPlace();
		
			$dialog.find('h2.'+ Class.taskTitle).text(task.label || task.id);
		}
	}

	function setSelect(obj)
	{
		var $select;
		var select = {};
		var cache = '';
		var options = {};
		
		var task = getSelectedTask(obj);
		
		if (!task) return false;
		
		var $dialog = task.getPlace();
		var $place = $dialog.find('div.'+ Class.tabSelect);
		
		if (!$place.exist()) return false;
		
		if ($place.hasClass(Class.reload)) options.reload = true;
		if ($place.hasClass(Class.showTooltip)) options.tooltip = true;
		
		$place.empty();
		
		select = {
			id:  obj.id.replace(/\./g, '-') + '-' + task.id + Suffix.tabs,
			label: '',
			type: COS.list,
			items: []
		};
		
		$.each(obj.items, function(i, task)
		{
			if (task.selected) {
				select.getTask = task.getTask,
				select.getOwner = task.getOwner,
				select.getPlace = task.getPlace
			}
			
			var item = {};
			
			item.label = id.cos.labelOf(task);
			item.value = task.id;
			item.id = idOf(task.id);
			if (task.selected) item.selected = true;
			if (task.locked) item.locked = true;
			if (task.hidden) item.hidden = true;			
			
			if (task.services && task.services.length > 0) {
				item.services = []; 
				$.each( task.services, function(i, service) {
					if (this.trigger == COS.init) {
						item.services.push(service); 
					}
				})
			}
			select.items.push(item);
		});
		
		$place.attr('id', select.id ).objectOf(task);
		
		if (options.tooltip) {
			$place.attr('title', id.lang.get('menu') );
			
			if(jQuery().tipTip && $place.length > 0) {
				id.setTooltip($place);
			}
		}
		
		select.$place = $place;
		
		if (id.gui.select)
			id.gui.select.init(select, options);
			
		function idOf(taskID) {
			return taskID + '-tabItem';
		}
		
	}
	
	function getSelectedTask(obj) {
		if (obj.items.length == 0)
			return;
			
		for (var i = 0; i < obj.items.length; i++) {
			var task = obj.items[i];
			if (task.selected) {
				return task;
			} else {
				continue;
			}
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //
	
	function onClick(e)
	{
		shift({ $tab: $(e.target).is('li') ? $(e.target) : $(e.target).parent(/*li*/) }, true);	
		// RADAR: this will break the closing of the datepicker, because it stopps event bubbling
		//return false;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Usage
	// ---------------------------------------------------------------------------------------------- //
	
	function showDialog(obj)
	{
		select( { obj: obj, $tab: getTab(obj), $dialog: getDialog(obj) });
	}
	
	function getCurrentDialog()
	{
		return getTab().objectOf();
	}
	
	function shift(item, go)
	{
		var obj = item.$tab.objectOf(); if (!obj) { debugger; }
		var service = obj.hasInit();
		
		item.obj = obj;
		item.$dialog = getDialog(obj);

		if (service && go) 
		{
			// Switch tab/panel by calling the service ..
			// .. which switch the panel by itself.

			id.debug(me+'TRIGGER '+service.url+'.', { type: id.gui.panel.id });
			obj.call(service);
		}
		else
		{
			// Switch directly to the other dialog 
			// without service call.

			select(item);
		}
	}

	function select(to)
	{
		var from = deselect(to);
		
		to.$tab.addClass(Class.selected);
		to.$dialog.addClass(Class.selected);
		
		to.obj.enter();
		//to.obj.show();
		
		// .. and also
		
		//to.$dialog.parent().show();
		//to.$tab.parent().show();

		// id.debug(me+'Height: '+to.$dialog.height() /*, { hold: !to.$dialog.height() } */);
		
		to.$dialog.unbind(Event.changed).bind(Event.changed, function(){ $(this).addClass(Class.changed); });
			
		if (!to.obj.hasModal(false)) 
		{	
			id.layout.setContainer(to.$dialog, false); /* reset container width */;
		}
        
        if (window.Elastic) Elastic.refresh(to.$dialog[0]);
	}	
	
	function deselect(to)
	{
		var from = {};
	
		from.$tab = getTab();
		if (from.$tab.missed()) return undefined;

		from.obj = from.$tab.objectOf();
		if (to && to.obj.id == from.obj.id) return undefined;

		from.$dialog = getDialog(from.obj);
		from.$tab.removeClass(Class.selected);
		from.$dialog.removeClass(Class.selected);
		
		if (from.obj)
			from.obj.leave(to && to.obj, { panelSwitch: true });
		
		id.layout.setSemiFlexContainer(from.$dialog, false);

		return from;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Messages
	// ---------------------------------------------------------------------------------------------- //
	
	function resetMessages(obj)
	{
		getStatus(obj).empty();
	}
	
	// Status
	
	var timerStatus = 0;
	
	function showStatus(obj)
	{
		hideStatus(obj);
        
		if (obj.status === null) 
			return false;
	
		var $place = getStatus(obj);
		
		$place.append('<p class="'+Class.status+'">'+obj.status+'</p>');
		showMessage($place);

		timerStatus = id.timer.call(function(obj)
		{ 
			if (id.isIE()) hideStatus(obj);
			else getStatus(obj).find('p.'+Class.status).fadeOut(Pref.fadeOut, function() { hideStatus(obj); }); 
		}, Pref.hideStatus, obj, { jobByClearing: true });
	}
	
	function hideStatus(obj)  
	{ 
		if (timerStatus) { id.timer.clear(timerStatus); timerStatus = 0; }
		getStatus(obj).find('p.'+Class.status).remove(); 
	}
	
	// Error
	
	function showError(obj)
	{
		hideError(obj);

		var $place = getStatus(obj);
		$place.prepend('<p class="'+Class.error+'">'+obj.error+'</p>');

		showMessage($place);
	}

	function hideError(obj)   
	{ 
		getStatus(obj).find('p.'+Class.error).remove();	
	}
	
	// Warning
	
	function showWarning(obj)
	{
		hideWarning(obj);

	   var $place = getStatus(obj);
		$place.append('<p class="'+Class.warning+'">'+obj.warning+'</p>');

		showMessage($place);
	}
	
	function hideWarning(obj) 
	{ 
		getStatus(obj).find('p.'+Class.warning).remove(); 
	}
	
	// Snippet
	
	function showMessage($place) { if (id.isIE()) $place.show(); else $place.fadeIn(Pref.fadeIn); }
	
	// ---------------------------------------------------------------------------------------------- //
	// Progress signs
	// ---------------------------------------------------------------------------------------------- //

	var timerProgress = 0;

	function showProgress(that, info)
	{
		if (!info) return false;

		var options = info.options;
		var obj = info.obj;

		if (!obj) return false;

		// id.debug(me+'Show progress for '+obj.id);

		// Show AJAX sign,
 		// immediately and everytime.
 		
 		if (obj.getTask)
 			getTab(obj.getTask()).addClass(Class.call);
 		
		// Show service call
		// after a short while.
		
		if (timerProgress) { id.timer.clear(timerProgress); timerProgress = 0; }
        inject(obj, info.url);
		timerProgress = id.timer.call(show, Pref.showIconDelay, { obj: obj, url: info.url });
		
		return true;
		
		// Functions
		
		function inject(obj, url) {
			var i = url.indexOf('?');
			var url = i != -1 ? url.slice(0, i) : url;
			var $place = getStatus(obj);
			
			var $p = $('<p class="'+Class.call+'">'+url+'</p>');
			
			$p.hide();
			
			$place.prepend($p);
		}
		
		function show(data) {
			var obj = data.obj;
			var $place = getStatus(obj);

			timerProgress = 0;
			
			var $p = $place.find('.'+Class.call);
				
			if (id.isIE()) $p.show(); 
			else $p.fadeIn(Pref.fadeIn); 
		}
	}
	
	function hideProgress(that, info)
	{
		if (!info) return false;
		
		var obj = info.obj;
		
		if (!obj) return false;
		
		// id.debug(me+'Hide progress for '+obj.id);

		// Reset progress signs
	
		if (timerProgress) { id.timer.clear(timerProgress); timerProgress = 0; }
		
		if (obj.getTask)
 			getTab(obj.getTask()).removeClass(Class.call);
 			
		getStatus(obj).find('p.'+Class.call).remove();
		
		return true;
	}
	
	
	// ---------------------------------------------------------------------------------------------- //
	// Places
	// ---------------------------------------------------------------------------------------------- //

	function getStatus(obj) 
	{ 
		// Use always the 
		// cursor based place.
		
/*		var cursor = id.object.getCursor();
		
		if (cursor) if (cursor.isSubtask() && !cursor.isModal()) cursor = cursor.getOwner();
		var $place = cursor ? cursor.getPlace() : id.object.getContent();
		
		return $place.find('#'+Place.status);
*/
		return obj.getPlace().find('#'+Place.status);

	}
	
	function getTab(obj) 
	{ 
		var $selected, $tabNav;
				
		if (obj) {
			return obj.getScope().find('#'+id.cos.jQueryID(obj.id)+Class.tabSuffix);
		} else {
			var $tabNav = id.object.getContent().find('.'+Class.tabs);
			
			if ($tabNav.exist()) {
				$selected = $tabNav.find('.'+Class.selected);
			} else {
				$selected = getDialog().find('.'+Class.tabSelect);
			}
			
			return $selected;
		}
	}
	
	function getDialog(obj) 
	{ 
		return obj ? obj.getScope().find('#'+id.cos.jQueryID(obj.id)+'.'+Class.panel) : id.object.getContent().find('.'+Class.panel+'.'+Class.selected);		
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function disableTab(item) { item.$tab.attr('disabled', 'yes').addClass(Class.disabled).unbind('click'+ns); }
	function enableTab(item) { item.$tab.removeAttr('disabled').removeClass(Class.disabled).unbind('click'+ns).bind('click'+ns, onClick); }
    function hideTab(item) { item.$tab.css("display","none"); }
	function showTab(item) { item.$tab.css("display","block"); }		
	
	function setInfo(item)  { 
		var $tab = $(item.$tab[0]);
		var regex = new RegExp( '\\b' + Class.markPrefix + '[a-z0-9]*', 'g' );
		if ($tab && $tab[0]) {
			$tab[0].className = $tab[0].className.replace(regex, ' ');
			$tab.addClass(Class.markPrefix+item.obj.info);
		}
	}
	
	function hideInfo(item)  { 
		var $tab = $(item.$tab[0]);
		var regex = new RegExp( '\\b' + Class.markPrefix + '[a-z0-9]*', 'g' );
		if ($tab && $tab[0]) {
			$tab[0].className = $tab[0].className.replace(regex, ' ');
		}
	}

	function setLabel(item, label) { item.$tab.children('a').text(label); }
	
}());

