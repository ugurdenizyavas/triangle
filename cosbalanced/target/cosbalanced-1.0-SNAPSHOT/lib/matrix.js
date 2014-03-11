/*
	File: matrix.js
	Purpose: matrix element.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.matrix = 
	{
		id: 'matrix',
		
		init: init,
		update: init
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	// Preferences
	
	var Prefs = { };

	// Vocabulary

	var Class = { isMatrix: 'isMatrix', matrix: 'matrix', header: 'header', hidden: 'hidden', data: 'data', selected: 'selected', empty: 'empty', label: 'label', xLabel: 'xLabel', yLabel: 'yLabel' };
	var COS = { text: 'text', key: 'key', flag: 'flag', list: 'list', select: 'select' };
	var Type = { matrix: 'matrix' };
	var Data = { obj: 'data-object', row: 'data-row', cell: 'data-cell' };

	
	// Identity
	
	var me = id.meOf(id.gui.matrix);
	var ns = id.namespaceOf(id.gui.matrix);
	
	// Object Management
	
	id.object.register(id.gui.matrix, { docType: Class.isMatrix, serializer: serialize });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{
		obj.getPlace().empty();
		
		obj.table = new Table(obj);

		return obj.table ? true : id.error(me+'Can\'t init matrix!');
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
		
		//addHeaderCols(obj)
		addHeader(obj);
		addHighlight(addRows(obj, options));
		addEvents(obj, options);
				
		return interface;

		// ------------------------------------------------------------------------------------------- //
		// Table Init
		// ------------------------------------------------------------------------------------------- //

		function addTable(obj)         
		{ 
			obj.getPlace().html('<table class="'+Class.matrix+'"></table>');
			if (!obj.getPlace().hasClass(Class.isMatrix)) obj.getPlace().addClass(Class.isMatrix);
			
			return obj.getPlace().find('table');
		}
		
		function addHeaderCols(obj)
		{
			// Add the Header Columns
		
			var columns = obj.columns;
			
			if (!columns || !columns.items)
				return false;
		
			$place.append(htmlOf(columns.items));

			return true;
			
			function htmlOf(colItems)
			{
				var cache = '';

				for (var i = 0; i < colItems.length; i++) 
					cache += '<col class="'+colItems[i].id+' '+(colItems[i].type == COS.key ? ' '+Class.hidden : '' )+'"/>';
				
				return cache;
			}
		}

		function addHeader(obj)
		{
			// Add the header labels
		
			//var columns = obj.columns;
			
			$place.append(htmlOf(obj));

			return true;
			
			function htmlOf(obj)
			{
				var columns = obj.columns;
				var rows = obj.rows;
				var cache = '';
				
				cache += '<tr class="'+Class.xLabel+'"><th rowspan="1"></th><th class="'+ Class.label +'" colspan="'+ columns.items.length +'"><span>'+ (columns.label ? columns.label : '') +'</span></th></tr>';
				cache += '<tr class="'+Class.yLabel+'"><th rowspan="'+ parseInt(rows.items.length + 2) +'"><div><span>'+ (rows.label ? rows.label : '') +'</span></div></th></tr>';

				cache += '<tr class="'+Class.header+'">';
				
				for (var i = 0; i < columns.items.length; i++)
					//if (i == 0) cache += '<th colspan="'+columns.items.length+'">ddd</th></td>';
					cache += '<th id="'+columns.items[i].id+'"'+(columns.items[i].hidden ? ' class="'+Class.hidden+'"' : '')+'><div>'+ (i != 0 ? id.cos.labelOf(columns.items[i]) : '')+'</div></th>';

				cache += '</tr>';
				
				return cache;
			}
		}
		
		function addRows(obj, options)
		{
			// Add the row based criteria
			var selected, row;
			
			if (obj.rows && obj.rows.items) {
				for (var i = 0, rowItems = obj.rows.items; i < rowItems.length; i++) {
					row = addRow(obj, rowItems[i], options);
					if (row !== undefined) selected = row;
				}
					
			}
			return selected;
		}
		
		function addRow(obj, rowItem, options)
		{
			var cells = [];
			var colItems = columnsOf(obj);
			var cell, $tr, $td;
			var rows = obj.$place.find('tr.'+Class.data);
			var selected;
			
			rowIndex =  rows.length - 1 == -1 ? 0 : rows.length - 1 ;
			
			
			
			$tr = $('<tr class="'+Class.data+'">');
			
			
		
			for (var i = 0; i < colItems.length; i++)
			{
				cell = merge(colItems[i], rowItem && rowItem[i] || {}); 
				
				if (!cell.type) {
					if (options.multiple) {
						cell.type = COS.flag;
						cell.id = cell.id+'_row'+(obj.rowCount ? obj.rowCount : '0');
					} else {
						cell.id = obj.id;
						cell.type = COS.list;
						cell.items = [$.extend(true, {}, cell)];
					}
				}
				
				$td = $('<td '+Data.cell+'="'+ i +'" class="'+ (cell.status ? cell.status : '') + (i == 0 ? Class.label : '') +'"></td>');
				
				id.object.bind(cell, obj.getOwner(), $td);
				cells[i] = cell;
				
				switch (cell.type)
				{
					case COS.key:
					{
						if (cell.value == undefined) {
							cell.value = rowIndex++;
						}

						$tr.not(Class.empty).attr('row', cell.value).attr('key', cell.value);
					
						$td.append($td.append(id.cos.valueOf(cell))); 
						break;
					}

					case COS.text: $td.append($('<div>'+ id.cos.valueOf(cell) +'</div>')); break;
					case COS.flag: $td.append(id.gui.flag.init(cell)); break;
					case COS.list: $td.append(id.gui.radio.init(cell)); break;
					
					rowIndex++;
				}
				
				$tr.append($td);
				
				if (cell.selected) selected = $td;
			}
			
			//$tr.prepend($th);
			
			$place.append($tr);
			
			renumberRows(obj);
			
			return selected;
			
			function merge(standard, update)
			{
				var _standard = $.extend(true, {}, standard);

				return $.extend(true, _standard, update);
			}
		}

		function renumberRows(obj) {
			$.each(obj.$place.find('tr.'+Class.data).not('.'+Class.empty), function(index, value) { 
  				$(this).attr(Data.row, index);
  				obj.rowCount = index + 1;
			});
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
		// Table Highlight
		// ------------------------------------------------------------------------------------------- //
		
		function addHighlight($cell)
		{
			if (!$cell) 
				return false;
			
			var $row = $cell.parent();
			var $rows = $row.parent().find('tr.'+Class.data);
			var rowIndex = $row.attr(Data.row);
			$rows.each(function(index) {
				var $td = $(this).find('td').filter(':first');
				$td.removeClass(Class.selected);
				if (index == rowIndex) $td.addClass(Class.selected);
			});

			var cellIndex = $cell.attr(Data.cell);
			var $header = $row.parent().find('tr').eq(2);
			var $columnLabels = $header.find('th').removeClass(Class.selected);
			$columnLabels.eq(parseInt(cellIndex)).addClass(Class.selected);			
		}

		// ------------------------------------------------------------------------------------------- //
		// Table Events
		// ------------------------------------------------------------------------------------------- //

		function addEvents(obj, options)
		{
			var service;
			
			//if (obj.services && (service = id.cos.hasService(obj, COS.select)))
			//{
				addEvent(obj, service, options);
			//}
		}
		
		function addEvent(obj, service, options)
		{
			obj.$place.unbind('change'+ns).bind('change'+ns, { obj: obj, service: service, options: options }, onChange);
		}
		
		function onChange(e)
		{
			var data = e.data;
			var obj = data.obj;
			var options  = e.data.options;
			var service  = obj.getService();
			var $cell;
			
			if ( $(e.target).is('td')) {
				$cell = $(e.target);
			} else if ( $(e.target).is('div')) {
				$cell = $(e.target).parent('td');
			} else if ( $(e.target).is('label') || $(e.target).is('input')) {
				$cell = $(e.target).parent('div').parent('td');
			}
			
			addHighlight($cell);

			if (service) {
				var parameters = [];
				var value = getSelection(obj, options);
				
				parameters[0] = { id: obj.id, value: value };
				
				id.service.call(obj.getTask(), service, { $form: obj.getTask().getPlace(), parameters: parameters  });
			}
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Serialize
	// ---------------------------------------------------------------------------------------------- //
	
	function serialize(map, field, $element, wanted)
	{	
		var obj = $element.data(Data.obj);
		var options = obj.options;
		
		id.serialize.addField(map, field, getSelection(obj, options)); 
		
		return map;
	}
	
	function getSelection(obj, options)
	{
		var value;
		
		var $elm = obj.getPlace().find(':checked');
		if ($elm.exist()) {
			var x = columnValue(obj, $elm);
			var y = rowValue(obj, $elm);
			value = x +','+ y;
		} else {
			value = '';
		}
		
		return value;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function tableOf(obj) { return obj.getInsert().table; };
	function columnsOf(obj) { return obj.columns.items || obj.getInsert().columns.items };
	
	function columnValue(obj, $element) { 
		var columnIndex = $element.parents('td').attr(Data.cell);
		var item = getItemByIndex( obj.columns, columnIndex );
		var value = id.cos.valueOf(item) || id.cos.labelOf(item);
		
		return value; 
	};
	
	function rowValue(obj, $element) { 
		var rowIndex = $element.parents('tr').attr(Data.row);
		var item = getItemByIndex( obj.rows, rowIndex );
		var value = id.cos.valueOf(item[0]) || id.cos.labelOf(item[0]);
		
		return value; 
	};
	
	function getItemByIndex( obj, index ) {
		return obj.items[ index ];
	}
	
}());




