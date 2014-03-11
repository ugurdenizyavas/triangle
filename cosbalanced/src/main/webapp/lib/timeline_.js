/*
	File: timeline.js
	Purpose: timeline element.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.timeline = 
	{
		id: 'timeline',
		
		init: init,
		update: init
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	// Preferences
	
	var Prefs = { };

	// Vocabulary

	var Class = { isTimeline: 'isTimeline', timeline: 'timeline', table: 'table', header: 'header', hidden: 'none', isKey: 'isKey', data: 'data', selected: 'selected', empty: 'empty', label: 'label', item: 'item', stamp: 'stamp', weather: 'weather', first: 'first', last: 'last', info: 'info', index: 'index', root: 'root', child: 'child', isSelect: 'isSelect', internal: 'internal', withService: 'withService' };
	var COS = { text: 'text', number: 'number', key: 'key', flag: 'flag', list: 'list', select: 'select', timeline: 'timeline', weather: 'weather', index: 'index' };
	var Type = { timeline: 'timeline' };
	var Data = { obj: 'data-object', row: 'data-row', cell: 'data-cell', key: 'data-key' };
	var Status = { blank: 'blank', orangeWithBorder: 'orangeWithBorder', whiteWithBorder: 'whiteWithBorder' };
	var Event = { changed: 'changed' };

	
	// Identity
	
	var me = id.meOf(id.gui.timeline);
	var ns = id.namespaceOf(id.gui.timeline);
	
	// Object Management
	
	id.object.register(id.gui.timeline, { docType: Class.isTimeline, cosType: COS.table });
	
	id.serialize.register(Class.isTimeline, serialize);
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{
		id.serialize.register('th', serializeColumn);
		
		obj.getPlace().empty();
		
		obj.table = new Table(obj);

		return obj.table ? true : id.error(me+'Can\'t init timeline!');
	}
	
	
	// ---------------------------------------------------------------------------------------------- //
	// Table Object
	// ---------------------------------------------------------------------------------------------- //

	function Table(obj)
	{
		// ------------------------------------------------------------------------------------------- //
		// Object Interface
		// ------------------------------------------------------------------------------------------- //

		var interface = 
		{ 
			update: update
		};


		// ------------------------------------------------------------------------------------------- //
		// Private
		// ------------------------------------------------------------------------------------------- //

		var $place = addTable(obj);
		var rowIndex = 0;
		var options = obj.options = {};
		
		// ------------------------------------------------------------------------------------------- //
		// Main
		// ------------------------------------------------------------------------------------------- //
		
		if (obj.multiple) options.multiple = true;
		
		obj.getPlace().data(Data.obj, obj);
		
		addHeader(obj);
		addRows(obj);
		//addEvents(obj);
		addTooltips(obj);
				
		return interface;

		// ------------------------------------------------------------------------------------------- //
		// Table Init
		// ------------------------------------------------------------------------------------------- //

		function addTable(obj)         
		{ 
			obj.getPlace().html('<table></table>');
			if (!obj.getPlace().hasClass(Class.isTimeline)) obj.getPlace().addClass(Class.isTimeline);
			
			return obj.getPlace().find('table');
		}

		function addHeader(obj)
		{
			// Add the header labels
		
			var columns = obj.columns;
			
			$place.append(htmlOf(columns));

			return true;
			
			function htmlOf(columns)
			{
				var cache = '';

				cache += '<tr class="'+Class.header+'">';
				
				for (var i = 0; i < columns.length; i++) {
					if (columns[i].type != COS.index) {
						cache += '<th id="'+columns[i].id+'" class="'+(i == columns.length - 1  ? Class.last : '') + (columns[i].hidden ? ' '+Class.hidden : '') + (columns[i].type == COS.key || columns[i].type == COS.list ? '' : ' '+Class.internal)+'">'+(columns[i].type == COS.timeline ? '<div class="'+ Class.timeline +'">' + addHeaderTimeline(columns[i]) +'</div>' : '<div>' + id.cos.labelOf(columns[i]) +'</div>' )+'</th>';
					}
				}

				cache += '</tr>';
				
				return cache;
			}
		}
		
		function addRows(obj)
		{
			var options = {};
			// Add the row based criteria

			if (obj.rows && obj.rows.length) {
				for (var i = 0, rows = obj.rows; i < rows.length; i++) {
					if (i == rows.length - 1) {
						options.last = true;
					}
					addRow(obj, rows[i], options);
				}
			} else {
				addRow(obj);
			}
				
			return true;
		}
		
		function addRow(obj, row, options)
		{
			if (!row || row.length == 0)
				return false;
				
			options = options || {};
			//var cells = [];
			var columns = columnsOf(obj);
			var cell, $tr, $td, itemOptions;
			var rows = obj.$place.find('tr.'+Class.data);
			var indexRoot;
			var index;
			
			rowIndex =  rows.length - 1 == -1 ? 0 : rows.length - 1 ;
			
			for (var i = 0; i < columns.length; i++)
			{
				if (columns[i].type == COS.index) {
					index = id.cos.valueOf(row[i]); 
					index = index.split('.').length;
					//index = index.split('.');
				}
			}
			
			$tr = $('<tr class="'+ Class.data + (options.last ? ' '+Class.last : '') + (index ? ' '+Class.index +'-'+ index : '') +'">');
		
			for (var i = 0; i < columns.length; i++)
			{
				if (columns[i].type != COS.index) {
					
					if (id.typeOf(row[i]) == 'object') {
						row[i] = row[i];
					} else {
						var rowItem = {};
						rowItem.value = row[i];
						row[i] = rowItem;
					}
					
					cell = merge(columns[i], row && row[i] || {}); 
					
					$td = $('<td '+Data.cell+'="'+ i +'" class="'+ (i == columns.length - 1  ? Class.last : '') + (cell.status ? ' '+cell.status : '')+ (columns[i].hidden ? ' '+Class.hidden : '')+(columns[i].type == COS.key ? ' '+Class.isKey : '') +'"></td>');
					
					id.object.bind(cell, obj.getOwner(), $td);
					itemOptions = { skipID: true, classes: addClasses(cell), searchfield: false, clientValidation: false };
					//cells[i] = cell;
					
					cell.id = cell.id+'_row'+(obj.rowCount ? obj.rowCount : '0');
		
					
					switch (cell.type)
					{
						case COS.list: 
						{	
							var $div = $('<div></div>')
							$td.append($div);
							$div.append(id.gui.newSelect.init(cell, $.extend(itemOptions, { multiple: 'array' }))); 
								
							break;
						}
						
						case COS.key:
						{
							if (cell.value == undefined) {
								cell.value = rowIndex++;
							}

							$td.not(Class.empty).attr(Data.key, cell.value);
					
							//$td.append(id.cos.valueOf(cell)); 
							$td.append(id.gui.text.init(cell, itemOptions)); 
							break;
						}
						
						case COS.timeline:
						{
						
							$td.append(addTimeline(columns[i], cell)); 
							
							
							break;
						}
		
						case COS.text: $td.append($('<div><span>'+ (cell.value ? id.cos.valueOf(cell) : '') +'</span></div>')); break;
						case COS.number: $td.append($('<div><span>'+ (cell.value ? id.cos.valueOf(cell) : '') +'</span></div>')); break;
		
					}
		
					if (cell.info)
					{
						$td.addClass(Class.info);
						$td.attr('title', cell.info);
					}
					
					addEvents($td, merge(columns[i], cell || {}), options); 
										
					$tr.append($td);
					onSelectChange($td);
				}
			}
			

			
			//$tr.data(Data.row, cells);
			
			$place.append($tr);
			
			renumberRows(obj);
			markFirst($tr);
			
			
			return true;
			
			// Functions
			
			function addClasses(item)
			{
				var classes = '';
				
				// TODO: Examples yet ...
				
				if (item.type == COS.list) classes = (id.cos.isGroup(item) ? Class.asGroup : (id.cos.isTree(item) ? Class.asTree : ''));
				
				return classes;
			}
		}

		function renumberRows(obj) {
			$.each(obj.$place.find('tr.'+Class.data).not('.'+Class.empty), function(index, value) { 
  				$(this).attr(Data.row, index);
  				obj.rowCount = index + 1;
			});
		}
		
		function markFirst($tr) {
			$tr.find('td, th').not('.'+Class.hidden).each(function(index) {
				if (index == 0) $(this).addClass(Class.first);
			});
		}
		
		function onSelectChange($td) {
			$td.unbind(Event.changed).bind(Event.changed, function(){ 
				selectRow($td);
			});
		}
		
		function selectRow($td) {
			var $rows = $td.parent().parent().find('tr');
			var $row = $td.parent();
			$rows.removeClass(Class.selected);
			$row.addClass(Class.selected); 
		}

		// ------------------------------------------------------------------------------------------- //
		// Table Update
		// ------------------------------------------------------------------------------------------- //

		function update(obj)
		{
			id.warn(me+'update() is NOT implemented yet.');

			// Merge with insert, 
			// than init ...
		}
		

		// ------------------------------------------------------------------------------------------- //
		// Table Events
		// ------------------------------------------------------------------------------------------- //
		
		function addEvents($place, obj, options)
		{
			var service;
			
			if (obj.services && (service = id.cos.hasService(obj, COS.select)))
			{
				addEvent($place, obj, service, options);
			}
		}
		
		function addEvent($place, obj, service, options)
		{
			options.$place = $place;
			$place.addClass(Class.withService);
			$place.unbind('click'+ns).bind('click'+ns, { obj: obj, service: service, options: options }, onClick);
		}
		
		function onClick(e)
		{
			var data = e.data;
			var obj = data.obj;
			var options = data.options;
			var service = data.service;
			var $place = options.$place;
			
			selectRow($place)

			if (service) {			
				id.service.call(obj.getTask(), service, { $form: obj.getTask().getPlace() });
			}
		}
		
		// ------------------------------------------------------------------------------------------- //
		// Tooltips
		// ------------------------------------------------------------------------------------------- //
		
		function addTooltips(obj)
		{
			var $tooltips = obj.$place.find('.'+Class.info);
		
			if($tooltips.length > 0) {
				id.setTooltip($tooltips);
			}
		}

	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Serialize
	// ---------------------------------------------------------------------------------------------- //
	
	// ---------------------------------------------------------------------------------------------- //
	// Timeline
	// ---------------------------------------------------------------------------------------------- //

	function addTimeline(column, cell)
	{
		var items, $elm, sortedItems = [];
		
		var map = { 'nodata': 0, 'grey': 1, 'green': 2, 'yellow': 3, 'orange': 4, 'whiteWithBorder': 5, 'orangeWithBorder': 6, 'red': 7, 'blank': 8 };
		
		cell = merge(column, cell || {}); 
		items = itemsOf(cell);
        
        if (!items) return false;
				
		function customSort( a, b )
		{
			var A = map[ a.status ] || 999;
			var B = map[ b.status ];
			
			//console.log( a.status + ":" + b.status + " -> " + A + ":" + B + " = " + ( A - B ) );
			
			return A - B;
		}
		
		items.sort(customSort).reverse();
				
		$elm = $(htmlOf(cell));
			
		for (var i = 0; i < items.length; i++)
		{
			if (i == items.length -1 && items[i].type == COS.weather) {
				// do nothing
				$elm.find('.'+ Class.stamp).hide();
			} else {
				addItem(cell, items[i], $elm);
			}
		}
		
		return $elm;
		
		function htmlOf(cell) {
			var cache = '';
			
			cache += '<div class="'+ Class.timeline+'">';
			cache += '<div class="'+ Class.stamp +'" style="left:'+ getItemPosition(cell).left +'%;"></div>';
			cache += '</div>';
			
			return cache;
		}
	}
	
	function addItem(cell, item, $elm) 
	{
		var from, to, status, $item;
		
		from = item.from;
		to = item.to;
		status = item.status;
		
		$item = $(htmlOf(item));
		
		$elm.prepend($item);
		
		function htmlOf(item) {
			var cache = '', left = 0, width = 0;
			
			if (item.type == COS.weather) {
			}
			var position = getItemPosition(cell, item);
			
			left = position.left;
			width = position.width;
			
			cache += '<div class="'+ (item.type == COS.weather ? Class.weather : Class.item) + (item.status ? ' '+item.status : '') + (item.info ? ' '+Class.info : '') +'" style="left:'+ left +'%;'+(item.type != COS.weather ? 'width:'+ width +'%;' : '' )+'" '+(item.info ? 'title="'+item.info.toEntity()+'"' : '')+'></div>';
			
			return cache;
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Merge
	// ---------------------------------------------------------------------------------------------- //
	
	function merge(standard, update)
	{
		var _standard = $.extend(true, {}, standard);

		return $.extend(true, _standard, update);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Time conversion
	// ---------------------------------------------------------------------------------------------- //
	
	
	function getItemPosition(cell, item) {
		var left = 0, right = 0, width = 0, stamp = 0, corr = 0, corr2 = 0, obj = {};
		
		//if (item && !id.isMember([Status.blank, Status.orangeWithBorder, Status.whiteWithBorder], item.status)) corr = 1;  // with data gap
		if (item && !id.isMember([Status.blank, Status.orangeWithBorder, Status.whiteWithBorder], item.status)) corr = 0;
		if (item && id.isMember([Status.blank, Status.orangeWithBorder, Status.whiteWithBorder], item.status)) corr2 = -2;
		
		var timelineStart = getTime(cell.from);
		var timelineEnd = getTime(cell.to);
		var itemStart = getTime(item && item.from || cell.from) ;
		var itemEnd = getTime(item && item.to || cell.to) + corr + corr2;
		var stamp = getTime(cell.time);
		var weather = item && item.time ? getTime(item.time) : 0;
		
		var left =  ((itemStart - timelineStart) / (timelineEnd - timelineStart)) * 100;
		var right =  ((itemEnd - timelineStart) / (timelineEnd - timelineStart)) * 100;
		var width =  right - left;
		
		if (cell && cell.time && !item) {
			left =  ((stamp - timelineStart) / (timelineEnd - timelineStart)) * 100;
		}
		
		if (item && item.time) {
			left =  ((weather - timelineStart) / (timelineEnd - timelineStart)) * 100;
		}
				
		obj = {
			left: left,
			width: width
		};
	
		return obj;
	}
	
	function addHeaderTimeline(column) {
		var cache = '', step = 0, scope = 0, interval = 0, left = 0, hours, minutes, date;
		
		var timelineStart = getTime(column.from);
		var timelineEnd = getTime(column.to);
		var labelStart = timelineStart + 30;
		
		var scope = timelineEnd - timelineStart;
		var interval = (scope / 60);
		var step = labelStart;
						
		for (var i = 0; i < interval; i++) {
			date = new Date(step * 60000);
			hours = date.getHours();
			minutes = date.getMinutes();
			label = hours + ':' + (minutes < 10 ? '0' : '') + minutes;
			left =  ((step - timelineStart) / (timelineEnd - timelineStart)) * 100;
			
			cache += '<span class="'+ Class.label +'" style="left:'+ (left) +'%;">'+ label +'</span>';
			
			step = step + 60;
		}
		
		return cache;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Serialize
	// ---------------------------------------------------------------------------------------------- //
	
	function serialize(map, field, $element, wanted)
	{	
		var $table = $element;
		var $rows = $table.find('tr.'+Class.data);
		
		var $selectedRow = $rows.filter('tr.'+Class.selected); 
					
		$selectedRow.each(function(row) 
		{ 
			var $row = $(this);
			var $columns = $table.find('tr.'+Class.header);
			var n = $columns.children().length;
			var colId, $cp, $tp, parameter = null, value, col;

			for (col = 0; col < n; col++)
			{
				// Column by column ..
				// ID taken from the column title.
			
				$cp = $columns.children(/*td*/).eq(col);
				$tp = $row.children(/*td*/).eq(col);
				colId = $cp.attr('id');
				
				if (field == colId) {

					parameter = colId;
					
					if ($tp.find('.'+Class.isSelect).exist()) {
						value = $tp.find('li.'+Class.selected).attr(COS.key);
					} else if ($tp.hasClass(Class.isKey)) {
						value = $tp.attr(Data.key);
					}
					
					value = $.trim(value);
					
					if (!$cp.hasClass(Class.internal))
						if (wanted(parameter))
							id.serialize.addField(map, parameter, value);  
						
				}
			}
		});


		return map;
	}

	
	function serializeColumn(map, field, $element, wanted)
	{
		var $table;
		
		$table = $element.parent(/*tr*/).parent(/*tbody*/).parent(/*table*/);
		if (!$table.attr('id')) $table = $table.parent(/*div*/);
		
		id.debug(me+'Relegate to timeline via "'+field+'".');
		
		return serialize(map, field, $table, wanted);
	}




	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function tableOf(obj) { return obj.getInsert().table; }
	function columnsOf(obj) { return obj.columns || obj.getInsert().columns }
	function itemsOf(obj) { return obj.items }
	
	function getTime(dateTime) {
		if (!dateTime) 
			return 0;
			
		var date = dateTime.split('T')[0];
		var dateArray = date.split('-');
		var time = dateTime.split('T')[1];
		var timeArray = time.split(':');
		
		var dateObject = new Date(dateArray[2], dateArray[1], dateArray[0], timeArray[0], timeArray[1], 0);
		var minutes = dateObject.getTime() / 60000;
				
		return minutes;
	}
	
}());






