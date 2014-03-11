/*
	File: querytable.js
	Purpose: Using table based dialogs.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.queryTable = 
	{
		id: 'queryTable',
		
		init: init,
		remove: remove,

		update: update,
		updateTable: update,
		updateRow: updateRow,
		updateCell: updateCell
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	// Preferences
	
	var Prefs = { };

	// Vocabulary

	var Class = { isQueryTable: 'isQueryTable', plus: 'plus', minus: 'minus', empty: 'empty', hidden: 'none', empty: 'empty', isKey: 'isKey', queryTable: 'queryTable', header: 'head', data: 'data', edit: 'edit', asTree: 'asTree', asGroup: 'asGroup', disabled: 'disabled' };
	var COS = { text: 'text', time: 'time', number: 'number', list: 'list', key: 'key', catalog: 'catalog', table: 'table' };
	var Type = { queryTable: 'queryTable' };
	var Sign = { plus: 'plus', minus: 'minus', empty: 'none' };
	var Data = { row: 'row' };
	
	// Identity
	
	var me = id.meOf(id.gui.queryTable);
	var ns = id.namespaceOf(id.gui.queryTable);
	
	// Object Management
	
	id.object.register(id.gui.queryTable, { docType: Class.isQueryTable });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{
		obj.table = new Table(obj);

		return obj.table ? true : id.error(me+'Can\'t init query table!');
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Update
	// ---------------------------------------------------------------------------------------------- //

	function update(obj)     { return tableOf(obj).update(obj); }
	function updateRow(obj)  { return tableOf(obj).updateRow(obj); }
	function updateCell(obj) {	return tableOf(obj).updateCell(obj); }
	
	// ---------------------------------------------------------------------------------------------- //
	// Remove
	// ---------------------------------------------------------------------------------------------- //

	function remove(obj)
	{
		var table = tableOf(obj);

		id.debug(me+'REMOVE table select "'+obj.getIndex()+'".');

		delete table;
		delete obj.getInsert().table;
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
			update: update, 
			updateRow: updateRow, 
			updateCell: updateCell 
		};

		// ------------------------------------------------------------------------------------------- //
		// Private
		// ------------------------------------------------------------------------------------------- //

		var $place = addTable(obj);
		var rowIndex = 0;

		// ------------------------------------------------------------------------------------------- //
		// Main
		// ------------------------------------------------------------------------------------------- //

		$place.addClass(Class.edit);
		
		addHeaderCols(obj)
		addHeader(obj);
		addRows(obj);
		if (obj.editable) addEmptyRow(obj);

		id.serialize.register(Class.isQueryTable, serialize);
		id.serialize.register('th', serializeColumn);
		
		return interface;

		// ------------------------------------------------------------------------------------------- //
		// Table Init
		// ------------------------------------------------------------------------------------------- //

		function addTable(obj)         
		{ 
			obj.getPlace().html('<table class="'+Class.queryTable+'"></table>');
			return obj.getPlace().find('table');
		}
		
		function addHeaderCols(obj)
		{
			// Add the Header Columns
		
			var columns = obj.columns;
			
			if (!columns || !columns.length)
				return false;
		
			$place.append(htmlOf(columns));

			return true;
			
			function htmlOf(columns)
			{
				var cache = '';

				for (var i = 0; i < columns.length; i++) 
					cache += '<col class="'+columns[i].id+' '+(columns[i].type == COS.key ? ' '+Class.hidden : '' )+'"/>';

				cache += '<col class="sign" />';
				
				return cache;
			}
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
				
				for (var i = 0; i < columns.length; i++)
					cache += '<th id="'+columns[i].id+'"'+(columns[i].hidden ? ' class="'+Class.hidden+'"' : '')+'>'+id.cos.labelOf(columns[i])+'</th>';

				cache += htmlOfPlusMinus(Sign.empty);
				cache += '</tr>';
				
				return cache;
			}
		}
		
		function addRows(obj)
		{
			// Add the row based criteria
			
			if (obj.rows && obj.rows.length) 
				for (var i = 0, rows = obj.rows; i < rows.length; i++)
					addRow(obj, rows[i]);
			else
				addRow(obj);
				
			

			return true;
		}
		
		function addRow(obj, row, $at, cells, options)
		{
			cells = cells || [];
			options = options || {};
			
			var columns = columnsOf(obj);
			var cell, $tr, $td, itemOptions;
			var insert = !options.update;
			var rows = obj.$place.find('tr.'+Class.data);
			var disabled;
			
			rowIndex =  rows.length - 1 == -1 ? 0 : rows.length - 1 ;
			
			
			
			$tr = $('<tr class="'+Class.data+'">');
		
			for (var i = 0; i < columns.length; i++)
			{
				$td = $('<td class="'+ (columns[i].hidden ? ' '+Class.hidden : '')+(columns[i].type == COS.key ? ' '+Class.isKey : '') +'">');
				
				if (cells[i] && cells[i].id) cells[i].id = null;
				if (cells[i] && cells[i].format) cells[i].format = null;
				if (cells[i] && cells[i].error) cells[i].error = null;
				if (cells[i] && cells[i].warning) cells[i].warning = null;
				cell = insert ? merge(columns[i], row && row[i] || {}) : (row[i] !== null ? ( row[i].mode == 'init' ? row[i] : merge(cells[i], row[i])) : cells[i]); 
				id.object.bind(cell, obj.getOwner(), $td);
				itemOptions = { skipID: true, classes: addClasses(cell), clientValidation: false };
				cells[i] = cell;
				
				cell.id = cell.id+'_row'+(obj.rowCount ? obj.rowCount : '0');

				
				switch (cell.type)
				{
					case COS.list: 
					{	
						//if (cell.items && cell.items.length) {
							var $div = $('<div></div>')
							$td.append($div);
							//cell.$place = $div;
							$div.append(id.gui.newSelect.init(cell, $.extend(itemOptions, { multiple: 'array' }))); 
							
						//}
							
						break;
					}

					case COS.key:
					{
						if (cell.value == undefined) {
							cell.value = rowIndex++;
						} else {
							
							//cell.value = rowIndex++;
							rowIndex++;
						}

						
						$tr.not(Class.empty).attr('row', cell.value).attr('key', cell.value);
					
						$td.append(id.gui.text.init(cell, itemOptions)); 
						break;
					}

					case COS.time: $td.append(id.gui.time.init(cell, itemOptions)); break;
					case COS.text: $td.append(id.gui.text.init(cell, itemOptions)); break;
					case COS.number: $td.append(id.gui.number.init(cell, itemOptions));  break;
					case COS.catalog: $td.append(id.gui.catalog.add(cell, itemOptions));  break;
					
					// ...
					// .......
				}
				
				$tr.append($td);
				
				if (cell.error || cell.warning)
					id.gui.message.add(cell);
			}
			
			
			if (obj.rowCount && obj.rowCount > 0) { 
				disabled = true;
				enableFirstMinusIcon(obj);
			}
			
			$tr.append($(htmlOfPlusMinus(Sign.minus, disabled)));
			$tr.find('.'+Class.minus+' div').bind('click', { obj: obj }, atMinus);
			$tr.data(Data.row, cells);
			
			if ($at) $at.before($tr);
			else $place.append($tr);
			
			renumberRows(obj);
			
			return true;
			
			// Functions
			
			function addClasses(item)
			{
				var classes = '';
				
				// TODO: Examples yet ...
				
				if (item.type == COS.list) classes = (id.cos.isGroup(item) ? Class.asGroup : (id.cos.isTree(item) ? Class.asTree : ''));
				
				return classes;
			}
			
			function merge(standard, update)
			{
				var selected = false;
				var _standard = $.extend(true, {}, standard);
				var matchedItemFromStandard;
				var indexFromUpdate;
				var skip = false;
			
				// First
				// Replace selected flags of standard
				// by the flags of the update.
			
				if (update.items)
					for (var i = 0; i < update.items.length; i++)
						if (update.items[i].selected)
						{
							selected = true;
							break;
						}
					
				if (selected) 
					for (var i = 0; _standard.items && i < _standard.items.length; i++)
						if (_standard.items[i].selected)
							delete _standard.items[i].selected;
				
				if (update.items) 
				{
					for (var i = 0; update.items && i < update.items.length; i++)
					{
						if (update.items[i].index) {
							indexFromUpdate = update.items[i].index.split('.');
						} else {
							skip = true;
							break;
						};
						matchedItemFromStandard = getItemByLevelAndIndex( _standard, 0, indexFromUpdate );
						$.extend(true, matchedItemFromStandard, update.items[i] );
					}
					
					if (skip) {
						return $.extend(true, _standard, update);
					} else {
						return _standard;
					}
				}
				else
				{
					return $.extend(true, _standard, update);
				}
				
							
				// Finally, do the regular job
				// by object extension.
							
				//return $.extend(true, _standard, update);
				if (skip) {
					return $.extend(true, _standard, update);
				} else {
					return _standard;
				}
				//return _standard;
			}
			
			function getItemByLevelAndIndex( obj, level, index ) {
				var top = obj.items[ index[ level ] ];
		
				if ( level == index.length - 1 ) {
					return top;
				} else {
					return getItemByLevelAndIndex( top, level + 1, index );
				}
			}
		}
		
		function addEmptyRow(obj)
		{
			$place.append(htmlOf(obj.columns));
			$place.find('.'+Class.plus+' div').bind('click',  { obj: obj }, atPlus);
		
			function htmlOf(columns)
			{
				var cache = '';

				cache += '<tr class="'+Class.data+' '+Class.empty+'">';
				
				for (var i = 0; i < columns.length; i++)
					cache += '<td'+(columns[i].hidden ? ' class="'+Class.hidden+'"' : '')+'></td>';
				
				cache += htmlOfPlusMinus(Sign.plus);
				cache += '</tr>';
				
				return cache;
			}
			
			return true;
		}
		
		function htmlOfPlusMinus(sign, disabled) {	return '<td class= "'+(!disabled ? Class.disabled+' ' : '')+(sign == Sign.plus ? Class.plus : (sign == Sign.minus ? Class.minus : Class.empty))+'"><div></div></td>'; }
		
		function renumberRows(obj) {
			$.each(obj.$place.find('tr.'+Class.data).not('.'+Class.empty), function(index, value) { 
  				$(this).attr('row', index).attr('key', index);
  				obj.rowCount = index+1;
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

		function updateRow(obj)
		{
			var $place = obj.getPlace().find('table');
			var key = keyOf(obj);
			var $at;
			
			for (var i = 0, rows = obj.rows, $at = null; i < rows.length; i++)
			{
				$place.find('.'+Class.isKey).each(function(j, td)
				{
					if ($(td).children().children().val() == rows[i][key].value)
					{
						$at = $(td).parent();
						return false /* break */;
					}
				});
				
				if (!$at)
					return id.error('Can\'t update row "'+rows[i][key].value+'" ..!');
					
				var $next = $at.next();
				var cells = $at.data(Data.row);

				removeRow($at);
				addRow(obj, rows[i], $next, cells, { update: true });
			}
			
			// Functions
		
			function keyOf(obj)
			{
				var columns = columnsOf(obj); 
				var key;
		
				for (var i = 0; i < columns.length; i++)
					if (columns[i].type == COS.key)
					{
						key = i;
						break;
					}

				if (key == undefined) 
					id.error(me+'Can\'t find key for updating row.');
					
				return key; 
			}
		}

		function updateCell(obj)
		{
			id.warn(me+'updateCell() is NOT implemented yet.');
			
			// Not needed at the moment
			// ...
		}
	
		// ------------------------------------------------------------------------------------------- //
		// Table Change
		// ------------------------------------------------------------------------------------------- //

		function removeRow($row)
		{
			$row.remove();
		}

		// ------------------------------------------------------------------------------------------- //
		// Table Events
		// ------------------------------------------------------------------------------------------- //

		function atPlus(e)  { 
			var $elm;
			
			if ($(e.target).is('td')) $elm = $(e.target).parent(/*tr*/);
			else $elm = $(e.target).parent(/*td*/).parent(/*tr*/);
			
			addRow(e.data.obj, null, $elm); 
			
			return false; 
		}
		
		function atMinus(e) { 
			var $elm;
			
			if ($(e.target).is('td')) $elm = $(e.target).parent(/*tr*/);
			else $elm = $(e.target).parent(/*td*/).parent(/*tr*/);
			
			if (obj.rowCount && obj.rowCount > 1) 
			{
				removeRow($elm); 
				renumberRows(obj);
				if (obj.rowCount && obj.rowCount == 1) disableFirstMinusIcon(obj);
			}
			return false; 
		}
		
		function disableMinus($elm) { 
			$elm.addClass(Class.disabled); 
		}
		
		function enableMinus($elm) { 
			$elm.removeClass(Class.disabled); 
		}
		
		function enableFirstMinusIcon(obj) {
			$.each(obj.$place.find('tr.'+Class.data+':first'), function(index, value) { 
  				$(this).find('td:last.'+Class.minus).removeClass(Class.disabled);
			});
		}
		
		function disableFirstMinusIcon(obj) {
			$.each(obj.$place.find('tr.'+Class.data+':first'), function(index, value) { 
  				$(this).find('td:last.'+Class.minus).addClass(Class.disabled);
			});
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Serialize
	// ---------------------------------------------------------------------------------------------- //
	
	function serialize(map, field, $element, wanted)
	{
		// This function is called by 
		// the service form serializer.
		
		var $table = $element.find('table');
		var $columns = $table.find('tr.'+Class.header).children(/*tr*/);
		var $rows = $table.find('tr.'+Class.data).not('tr.'+Class.empty);
		var table = { type: COS.table, columns: [], rows: [] }; 

		$columns.each(function(i, col) 
		{ 
			if ($(col).is('.'+Class.empty))
				return true /* continue */;
			
			var field = $(col).attr('id');
		
			if (wanted(field))
				table.columns[i] = field;  
		});
		
		$rows.each(function(i, row) 
		{ 
			var $td;
			
			table.rows[i] = [/*row*/];

			for (var col = 0; col < table.columns.length; col++)
			{
				// Column by column ..
				// ID taken from the column title.
			
				$td = $(row).children(/*td*/).eq(col);
				
				if ($td.hasClass('isKey')) {
					$td.find('input').val($(row).attr('row'));
				}
				
				if ($td.is('.'+Class.plus+', .'+Class.minus))
					continue;
					
				id.serialize.evaluate(table.rows[i][col] = {}, $td.children(/*div.wrap*/).children(/*div.element*/), wanted, { id: table.columns[col] });
			}
		});

		// Optimize
		// by using short notation

		for (var row = 0, rows = table.rows; row < rows.length; row++)
			for (var col = 0, cols = table.columns; col < cols.length; col++)
			{
				var cell = rows[row][col];
				var array;
				
				cell = cell[cols[col]];
				
				/*
				if (cell && id.isString(cell) && cell.indexOf(',') != -1)
				{
					array = cell.split(', ');
					cell = array;
				}
				*/
				
				rows[row][col] = cell;
			}
		
		map[field] = table;
		
		return map;
	}
	
	function serializeColumn(map, field, $element, wanted)
	{
		// No sense at the moment
		// therefore ignore.
		
		return false;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function tableOf(obj) { return obj.getInsert().table; }
	function columnsOf(obj) { return obj.columns || obj.getInsert().columns }
	
}());