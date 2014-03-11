/*
	File: table.js
	Purpose: Using table objects.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.table = 
	{
		id: 'table',
		
		init: init,
		update: update,
		updateTable: update,
		updateRow: updateRow,
		addPaging: addPaging,
		afterShow: afterShow,
		prepare: prepare,
		remove: remove
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	// Preferences
	
	var prefs = 
	{
		counts: [ 10, 25, 50, 100, 'all' ],
		showPages: 10, 
		markedTimeout: 500 /* ms */
	};

	// Vocabulary

	var cos = { table: 'table', multiple: 'multiple', unique: 'unique', time: 'time', number: 'number', percent: 'percent', absolute: 'absolute', select: 'select', paging: 'paging', page: 'page', pageSize: 'pageSize', sortUp: 'up', sortDown: 'down', sortNone: 'none', sort: 'sort', column: 'column', key: 'key', add: 'add', remove: 'delete', exit: 'exit', list: 'list', rows: 'rows', columns: 'columns', index: 'index', bytes: 'bytes', day: 'day', format : 'format', text: 'text', html: 'html'  };
	var css = { isTable: 'isTable', table: 'dataTable', dataFooter: 'dataFooter', header: 'head', data: 'data', footer: 'foot', check: 'check', isCheck: 'isCheck', pagingSuffix: '-paging', sorting: 'sorting', sortUp: 'sort_up', sortDown: 'sort_down', sortNone: 'sort', even: 'even', odd: 'odd', button: 'button', left: 'left', right: 'right', selected: 'selected', focused: 'focused', none: 'none', internal: 'internal', first: 'first', col25: 'col25', col50: 'col50', pageSize: 'pageCounter', center: 'center', paging: 'paging', prev: 'previous', next: 'next', edit: 'edit', wrap: 'wrap', add: 'add', remove: 'delete', locked: 'locked', changed: 'changed', empty: 'empty', data: 'data', sum: 'sum', template: 'template', isKey: 'isKey', pipe: 'pipe', valuesOnly: 'valuesOnly', isSelect: 'isSelect', error: 'error', message:'message', inTable: 'inTable', required: 'required', index: 'index', isIndex: 'isIndex', kpiouterbox: 'kpiOuterBox', withService: 'withService', index: 'index', call: 'calling', reload: 'reload', thtext: 'thtext', isTime: 'isTime', oldTimeFormat: 'oldTimeFormat', scrollBox: 'scrollBox', info: 'info', textarea: 'textarea', infoAsTooltip: 'infoAsTooltip', dummy: 'dummy' };
	var place = { button: 'table-actions', pageSize: 'pageSize', error:'table-errors', callingSuffix: '-calling' };
	var attr = { key: 'key', page: 'page', before: 'before', row: 'row', sort: 'sort', error: 'error', batch: 'batch' };
	var sign = { prev: '<', pause: '...', next: '>' };
	var sort = { up: css.sortUp, down: css.sortDown, none: css.sortNone };
	var event = { changed: 'changed', onSelectEmptyNone: 'onSelectEmptyNone', onSelectTabKey: 'onSelectTabKey' };
    var data = { key: 'data-key', staticRowCount: 'data-static-row-count' };

	// Variables
	
	var me = id.meOf(id.gui.table);
	var ns = id.namespaceOf(id.gui.table); 
	
	// Object Management
	
	id.object.register(id.gui.table, { docType: css.isTable, cosType: cos.table });

	// Explicit registration of multiple serializer

	id.serialize.register(css.isTable, serialize);
	
	// ---------------------------------------------------------------------------------------------- //
	// Init 
	// ---------------------------------------------------------------------------------------------- //

	function init(obj)
	{
		id.serialize.register('th', serializeColumn);
		
        var options = {};
        
		setHidden(obj);
		remove(obj);
		setLabel(obj);
		deprecated(obj);
		
		hideProgress(getPlace(obj));
		
		if (!obj.columns || obj.columns.length == 0) 
			return false;
            
        //if (obj.$place.hasClass(css.infoAsTooltip)) {
		//	options.infoAsTooltip = true;
		//}
		
		obj.$table = addTable(obj);
		
		if (obj.$place.attr(data.staticRowCount)) {
			obj.$table.staticRowCount = obj.$place.attr(data.staticRowCount);
		}

		obj.$table.addHeader(obj);
		obj.$table.addRows(obj, options);
		obj.$table.addFooter(obj);
		obj.$table.finalize(obj);
	}
	
	function remove(obj)
	{
		obj.getPlace().empty().prev('label').empty();
	}
	
	function setHidden(obj)
	{
		if (obj.hidden) obj.$place.addClass(css.none);	
		else obj.$place.removeClass(css.none);
	}
	
	jQuery.fn.finalize = function(obj)
	{
		var $table = this;

		if ($table.editService) 
			$table.editCell($table.firstRow().find('td:not(.'+css.none+', .'+css.locked+', .'+css.check+'):first'));
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Deprecated 
	// ---------------------------------------------------------------------------------------------- //

	function deprecated(obj)
	{
		if (!obj.getPlace().hasClass(css.isTable))
		{
			id.warn(me+'Missing class="'+css.isTable+'" at "'+obj.getIndex()+'" (has been added).');
			obj.getPlace().addClass(css.isTable);
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Prepare 
	// ---------------------------------------------------------------------------------------------- //

	function prepare(obj)
	{	
		showProgress(getPlace(obj));
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Update 
	// ---------------------------------------------------------------------------------------------- //

	function update(obj)
	{
		// Update the current table object
		// with new items, then kick init().
	
		var insert = obj.getInsert();
		
		if (!obj.hidden) obj.hidden = false;

		// Update on properties
		// like page, pageCount, ..
		
		mergeProperties(insert, obj);
		
		if (obj.columns) mergeColumns(insert, obj);
		if (obj.rows) mergeRows(insert, obj);
				
		init(insert);
	}

	function updateRow(obj)
	{
		var $table = obj.getInsert().$table;
		
		if (!$table)
			return id.error('Update on non-initialised table "'+obj.id+'".');

		var columns = $table.columns;
		var $row, rowKey, rowSort, row, prependrows;
	
		setLabel(obj);
	
		// Update, add new rows in an existing table
		// using the keys.
		
		if (obj.rows) $.each(obj.rows, function (i, row)		
		{
			if (obj.sum && i == obj.rows.length-1)
			{
				$table.updateRow(obj, $table.sumRow(), row, columns);
				return true /* continue */;
			}
				
				// Find the row by row key.
			
			rowKey = 0;
				
			$.each(row, function(j) 
			{ 
				if (columns[j].type == cos.key) 
				{ 
					rowKey = id.cos.valueOf(row[j]); 
					return false /* break */; 
				} 

				if (columns[j].sorted && columns[j].sorted != cos.sortNone) 
					rowSort = id.cos.valueOf(row[j]); 
			});
			
			if (rowKey)
			{
				$row = $table.find('tr['+attr.key+'="'+rowKey+'"]');

				if ($row.exist()) 
					$table.updateRow(obj, $row, row, columns);

				else 
				{
					// Todo
					// Find the right row
					// by the sorting key.
				
					$table.appendRow(obj, row);
				}
			} else {
				prependrows = true;
				return false;
			}
		});

		if (prependrows){
			for (i = obj.rows.length - 1; i >= 0; i--){
				row = obj.rows[i];
				$table.prependRow(obj, row);
			}
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// More public functions 
	// ---------------------------------------------------------------------------------------------- //

	function afterShow(obj)
	{
		id.layout.setSemiFlexContainer(obj.$scope, true);
		id.layout.setContainer(obj.$scope, true);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Table
	// ---------------------------------------------------------------------------------------------- //

	function setLabel(obj) 
	{
		if (obj.label || obj.label == '')
			obj.getPlace().prev('label').empty().append(obj.label);
	}

	function addTable(obj)
	{
        if (obj.removable !== false) obj.removable = true;
		var $table = $('<table class="'+css.table+'"></table>');
		var service;
		
		obj.getPlace().append($table);
		
		$table.obj = obj;	
		$table.columns = obj.columns;	

		if (obj.checked) $table.checkService = obj.checked;
		if (service = obj.hasService(cos.paging)) { $table.pageService = service; $table.pageSize = obj.pageSize; }
		if (service = obj.hasService(cos.select)) $table.rowService = service;
		if (obj.sum) $table.sum = true; 
		if (obj.getPlace().hasClass(css.valuesOnly)) $table.valuesOnly = true;
		if (obj.getPlace().hasClass(css.reload)) $table.reload = true;

		if (obj.editable) 
		{
			$table.editService = true;
			if (obj.extendable && obj.removable) $table.checkService = obj.checked || cos.multiple;
			$table.addClass(css.edit);
		}
		
		if (obj.services)
		{
			$.each(obj.services, function() 
			{ 
				if (this.type == cos.remove) 
				{
					$table.deleteService = this; 
					$table.checkService = obj.checked || cos.multiple;
				}
				
				if (this.type == cos.add) $table.addService = this; 
			});
		}
		
		return $table;	
	}

	// ---------------------------------------------------------------------------------------------- //
	// Header (Column Title, Sorting, ...)
	// ---------------------------------------------------------------------------------------------- //

	jQuery.fn.addHeader = function(obj)
	{
		var $table = this;
		var $header, classes, service;
		var cache = ''

		// Column classes ...
		
		$.each(obj.columns, function (i, column)
		{
			if (!column.hidden) {
				cache += '<col class="'+column.id+'" />';
			}
		});
		
		$table.append(cache);
		
		// Build the DOM based table ..
		// .. via cache due to performance reasons.
		
		cache = '<tr class="'+css.header+'">';
		
		$.each(obj.columns, function(i, column)
		{
			if (column.type == cos.time || column.type == cos.number || column.type == cos.percent) column.right = true;
			classes = (column.hidden ? css.none : '') + (column.right ? ' '+css.right : '');

			cache += '<th id="'+column.id+'"' + 'class="c'+(i+1)+(classes.length > 0 ? ' '+classes : '')+'"><div>';
			cache += '<span class="'+css.thtext+'">'+(column.label ? column.label : column.id) + (column.format && id.isObject(column.format) ? '<span>['+ column.format.label +']<span>' : '')+'</span>';

			if (column.required)
				cache += ' *';

			if (column.sorted && sort[column.sorted]) 
			{
				$table.sortService = $table.pageService;

				if (column.sorted != cos.sortNone)
					$table.sorting = column.sorted; 
				
				cache += '<span class="'+css.sorting+' '+sort[column.sorted]+'"></span>';
			}
			
			if (service = id.cos.hasService(column, cos.select))
			{
				column.atSelect = service;
				$table.colService = true;
			}
			
			cache += '</div></th>';		
		});
		
		if ($table.checkService && ((obj.rows && obj.rows.length > 0) ||$table.editService))
		{
			cache += '<th id="'+this.id+'" class="'+css.check+'">';
			if (!$table.editService && $table.checkService == cos.multiple) cache += '<input type="checkbox" class="'+css.internal+'"/>';
			cache += '</th>';
		}
		
		cache += '</tr>';
		
		$header = $(cache);	
		$table.append($header);
		$table.$header = $header;
		
		// Header based events: Sort, Check

		if ($table.sortService)  
			$header.find('span.'+css.sorting).bind('click'+ns, { obj: obj, $header: $header, service: $table.sortService }, onSort);
		
		if ($table.checkService) 
			$header.find('input').bind('change'+ns, { $table: $table }, onCheckAll);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Rows with Data
	// ---------------------------------------------------------------------------------------------- //
	
	jQuery.fn.addRows = function(obj, options)
	{
        options = options || {};
        
		var $table = this;
		var maxRows = $table.pageService ? obj.pageSize : 0;
		var cache = '', entry; 
		
		$table.rows = 0;
		
		// Generate a template row
		// for cloning purposes (update, ...).
	
		if ($table.editService)
		{
			$table.addTemplate(obj);
			if (!(obj.rows && obj.rows.length)) $table.newRow();
		}

		// Build the DOM based table ..
		// .. via cache due to performance reasons.
	
		if (obj.rows) $.each(obj.rows, function(i, row)
		{
			// Design and function 
			//	per row.
			
			if (maxRows && $table.rows > maxRows) 
			{
				// Paging mode
				// break after max rows.
			
				return false /* break */;
			}

			if ($table.sum && i == obj.rows.length-1)
			{
				// Sum mode,
				// generate final row.
				
				cache += $table.sumEntry(row, options);
			}
			else
			{
				// Data rows.
			
				if (entry = $table.dataEntry(row, options))
				{
					cache += entry;
					$table.rows++;
				}
			}
		});
		
		// Row Events: Row Select, Column/Cell Select, Check, Focus 

		$table.append(cache);
		$table.setRowEvents(obj, $table.find('tr.'+css.data+', tr.'+css.template));
		
		if ($table.staticRowCount) {
			$table.addDummyRows(obj);
		}
		
		$table.setInfoTooltips();
	}
	
	// Template row,
	// representive for the other rows.
	
	jQuery.fn.addTemplate = function(obj)
	{
		var $table = this;
		
		//$table.$template = $($table.dataEntry(emptyRow()));
        $table.$template = $($table.dataEntry(obj.columns, { setValue: true, template:true }));
		$table.append($table.$template);
		
		$table.$template.removeClass(css.data).addClass(css.template+' '+css.none+' '+css.empty);
		
		return this;
	}
	
	// Dummy row,
	// fill up the table with empty rows.
	
	jQuery.fn.addDummyRows = function(obj)
	{
		var $table = this;
		var $rows;
		
		var fillUpRows = $table.staticRowCount - $table.rows
		for (var i = 0; i < fillUpRows; i++) {
			$table.addDummy(obj);
		}
		
		$rows = $table.allRowsPlusDummy();
		
		zebraStripeRows($rows);
	}
	
	jQuery.fn.addDummy = function(obj)
	{
		var $table = this;
		
        $table.$dummy = $($table.dataEntry(obj.columns, { setValue: true, dummy:true }));
		$table.append($table.$dummy);
		
		$table.$dummy.removeAttr(attr.row).removeClass(css.data).addClass(css.dummy);
		
		return this;
	}
		
	// Update an existing row.
	
	jQuery.fn.updateRow = function(obj, $row, row, columns)
	{
		var $table = this;
		var $col = $row.find('td');
		var value, $cell, column;
		
		$row.find('td.'+ css.check + ' input[type=checkbox]').attr('checked', false);
	
		$.each(row, function(i, cell) 
		{                
			$cell = $col.eq(i);
			column = columns[i];
			if (column.type == cos.list)
			{	
				value = valueOf(getSelectedListItem(cell, column), column.type, column.format);
			} else if (column.type == cos.time) {
				value = valueOf(id.format.toTimeConversion(cell, column.format), column.type, column.format);
			} else {
				value = valueOf(cell, column.type, column.format);
			}
			
			if ($cell.is('.'+css.edit)) {
				$cell.find('input').val(emptyValueOf(value));
			} else if (cell && cell.status)  {
				$cell.html('<span>'+ emptyCellOf(value) +'</span>');
			} else if (cell && cell.services)  {
				$cell.html('<a>'+ emptyCellOf(value) +'</a>');
			} else {
				$cell.html(emptyCellOf(value));
			}
			
			// Lock/Unlock cell
			// triggered by column or cell,
			
			if (column.locked || cell && cell.locked) $cell.addClass(css.locked);
			else /* if (columns[i].locked == false) */ $cell.removeClass(css.locked);

			//if (cell && cell.locked) $cell.addClass(css.locked);
			//else $cell.removeClass(css.locked);

			if (cell && cell.error) {
				$cell.removeClass(css.error).removeAttr('error');
				$cell.addClass(css.error).attr('error', cell.error);
				showError($table.obj, $cell);
			}
			else { 
				$cell.removeClass(css.error).removeAttr('error');
			}
			
			if ($table.editService && cell && cell.selected)
				$table.shiftCell($table.editCursor(), $cell, { skip: true });
				
			if ($table.obj && $table.obj.error) showErrors(obj);
		});
		
		return this;
	}
	
	// Append a new row.
	
	jQuery.fn.appendRow = function(obj, row)
	{
		var $table = this;
		var $row;
		var cache = $table.dataEntry(row);
		
		// Find the right place for the new row,
		// depending on: emptiness, sorting

		if ($table.countRows() == 0 || (!$table.sorting || $table.sorting == cos.sortDown))
			$row = $table.append(cache);
		else /* cos.sortUp */
			$row = $table.firstRow().before(cache);


		// Set the events
		// of a row.
		
		$table.setRowEvents(obj, $row);
		$table.finalizeDataRows();
		
		// If there's paging active and the table page is full,
		// then delete the row at the other end.
		
		if ($table.pageService && $table.countRows() > $table.pageSize)
		{
			if ($table.sorting && $table.sorting != cos.sortUp) $table.deleteRow($table.firstRow());
			else $table.deleteRow($table.lastRow());
		}
		
		// Mark the new row,
		// for a moment.
		
/*		$row.addClass(css.marked);
		setTimeout(function() { $row.removeClass(css.marked); }, prefs.markedTimeout);
*/
		return this;
	}

	jQuery.fn.prependRow = function(obj, row)
	{
		var $table = this;
		var $row;
		var cache = $table.dataEntry(row);

		// Find the right place for the new row,
		// depending on: emptiness, sorting

		if ($table.countRows() == 0 || (!$table.sorting || $table.sorting == cos.sortDown))
			$row = $table.firstRow().before(cache);
		else /* cos.sortUp */
			$row = $table.append(cache);


		// Set the events
		// of a row.

		$table.setRowEvents(obj, $row);
		$table.finalizeDataRows();

		// If there's paging active and the table page is full,
		// then delete the row at the other end.

		if ($table.pageService && $table.countRows() > $table.pageSize)
		{
			if ($table.sorting && $table.sorting != cos.sortUp) $table.deleteRow($table.lastRow());
			else $table.deleteRow($table.firstRow());
		}

		// Mark the new row,
		// for a moment.

		/*		$row.addClass(css.marked);
		 setTimeout(function() { $row.removeClass(css.marked); }, prefs.markedTimeout);
		 */
		return this;
	}
	
	// Data row's HTML structure
	
	jQuery.fn.dataEntry = function(row, options)
	{
        options = options || {};
		
		var $table = this;
		var $row, rowHead, rowKey, rowSort, cache, column, cell, locked, classes, value, empty, rowID, status, values, format;
		var i = $table.rows;
		var columns = $table.columns;
		var service, cellDataKey;
		
		// Handling of an empty row
		// which is a template.
		
		empty = (row == emptyRow());
		rowID = empty || options.template ? 0 : $table.rows+1;
		if (empty) row = [];
		
		// Building the HTML based row.
	
		rowHead = '<tr '+attr.row+'="'+rowID+'" '+'class="'+css.data+(empty ? ' '+css.empty : '')+' '+(i%2 ? css.even : css.odd)+'"' /* ... and more */;
		rowKey = '';
		rowSort = '';
		cache = '>';
		values = false;
		
		$.each(columns, function(j, column)
		{
			// cell = row[j] || {};
			cell = row[j];
			cell = cell == null ? {} : cell;
			value = (options.setValue ? (cell.value ? cell.value : '') : (cell.label ? cell.label : valueOf(cell, column.type, column.format)));
			locked = cell.locked != undefined ? cell.locked : column.locked;
			classes = (column.hidden ? ' '+css.none : '')+(column.required ? ' '+css.required : '')+(cell.error ? ' '+css.error : '')+(value == '' ? ' '+css.empty : '')+(column.right ? ' '+css.right : '')+(locked? ' '+css.locked : '')+(column.type == cos.key ? ' '+css.isKey : '') + (column.type == cos.time ? (value.indexOf("-") != -1 || value == '' ? ' '+css.isTime : ' '+css.oldTimeFormat+' '+css.isTime) : '');
			
			format = (column.type == cos.time ? 'format="'+(column.format ? column.format : cos.day )+'"' : '');

			if ($table.hasClass(css.edit)) {
				if (column.type == cos.list){
					cellDataKey = data.key+'="'+id.cos.valueOf(getSelectedListItem(cell, column))+'"';
				} else {
					cellDataKey = '';
				}
			} else {
				if (column.type == cos.list){
					cellDataKey = data.key+'="'+id.cos.valueOf(getSelectedListItem(cell, column))+'"';
				} else if (id.isObject(cell) || cell.value) {
					cellDataKey = data.key+'="'+escape(emptyCellOf(cell.value))+'"';
				} else {
					cellDataKey = data.key+'="'+escape(cell)+'"';
				}
			}

			cache += '<td cell="'+(j+1)+'" '+(format.length > 0 ? format : '')+' class="w'+(j+1)+' '+(classes.length > 0 ? classes : '')+' '+((column.type != cos.index ) && cell.status ? ''+cell.status+'' : '')+'"'+(cell.error ? 'error="'+cell.error+'"' : '')+' '+cellDataKey+'>';
			
			// value = valueOf(cell, column.type);
			
			if (!options.dummy) {
			
				if (value > 0)
					values = true;
	
				if (cell.services && (service = id.cos.hasService(cell, cos.select)))
				{
					cell.atSelect = service;
					$table.colService = true;
				}
				
				if (column.type == cos.key)
				{
					if (value === '')
					{
						// No key set by the service
						// so take temporally the row id.
						
						value = rowID;
					}
				
					// Set the key of the row entry
					// for updating, ...
					
					rowKey = ' '+attr.key+'="'+value+'"';
				}
				
				//if (value == '' && cell.status)	{
				//	value = '';
				//}
				
				if (column.type == cos.time) {
					if (value != '' && value.indexOf("-") != -1) {
						value = id.format.toTimeConversion(value, column.format);
					}
				}
				
				if (column.type == cos.list && !empty)
				{	
					value = valueOf(getSelectedListItem(cell,column), column.type, column.format);
				}

				if (column.type == cos.index && !empty)
				{
					$.extend(cell, column);
					
					value = '<div id="'+column.id+rowID+'" class="'+css.isIndex+'">';
					value += '<div class="'+css.index+' '+css.kpiouterbox+'">'+id.gui.index.htmlOf(cell, options)+'</div>';
					value += '</div>';
					
					if (column.services || cell.services)
						$table.colService = true;
				}
				
				if (column.sorted && column.sorted != cos.sortNone)
					rowSort = ' '+attr.sort+'="'+value+'"';
				
				if (column.type != cos.index) 
				{ 
					status = id.typeOf(cell) == 'string' ? cell : (cell.status ? '<span>'+ value +'</span>' : '');
					if (cell.status) value = status;
				}
				
				value = emptyCellOf(value);

				if (column.type == 'status'){
					value = '<span>'+value+'</span>';
				}
	
				if ((!cell.services && column.atSelect) || (cell.atSelect && cell.atSelect.url)) {
					value = '<a>'+value+'</a>';
					$table.colService = true;
				}
				
				if (cell.info && column.type != cos.index) {
					value += '<span class="'+ css.info +'" title="'+ cell.info +'"></span>'
				}
                
                if (column.type == cos.text && !cell.status) {
					value = '<span>'+ value +'</span>';
				}
	
				cache += value;
			
			} else {
				cache += '&nbsp;';
			}
			cache += '</td>';
		});
						
		if ($table.checkService)
		{
			cache += '<td class="'+css.check+' '+css.isCheck+'">';
			cache += '<input type="'+($table.checkService == cos.unique ? 'radio' : 'checkbox')+'" class="'+css.internal+'"'+($table.checkService == cos.unique ? ' name="'+row.id+'"' : '')+'/></th>';
		}
		
		cache += '</tr>';
		
		return $table.valuesOnly && !values ? 0 : rowHead+rowKey+rowSort+cache;
	}
	
	// Sum row's HTML structure

	jQuery.fn.sumEntry = function(row, options)
	{
		var $table = this;
		var cache, value;

		cache = '<tr class="'+css.sum+'">';

		$.each(row, function(j)
		{
			// Design an function
			//	per column of a row.

			var column = $table.columns[j];
			var cell = row[j];

			cache += '<td class="w'+(j+1)+' '+(column.hidden ? css.none : '')+(column.right ? ' '+css.right : '')+'">';
			
			if (column.type == cos.index && cell)
			{
				$.extend(cell, column);
				
				cache += '<div id="'+column.id+j+'" class="'+css.isIndex+'">';
				cache += '<div class="'+css.index+' '+css.kpiouterbox+'">'+id.gui.index.htmlOf(cell, options)+'</div>';
				cache += '</div>';
			} else {
				cache += valueOf(cell, column.type, column.format);
			}
			cache += '</td>';
		});
			
		if ($table.checkService) 
			cache += '<td></td>';
		
		cache += '</tr>';
		
		return cache;
	}
		
	jQuery.fn.setRowEvents = function(obj, $rows)
	{
		var $table = this;
		var column, cell;
	
		// #NOTE
		// bind(dblclick, ...) doesn't work ...

		if ($table.rowService)
			$rows
				.bind('dblclick', function() { return false; e.stopPropagation(); })
				.bind('click'+ns, { obj: obj, $table: $table, service: $table.rowService }, onRowSelect);
		
		if ($table.colService)
			$.each($table.columns, function(i, col) 
			{
				$rows.each(function(j, row) 
				{
					column = col;
					cell = obj.rows[j][i];
					services = (cell && cell.services ? cell.services : 0) || column.services;
					
					if (services)
					{
						if (column.type == cos.index) 
						{
							id.gui.index.setService(cell, 
							{  
								owner: obj, $place: $(row).children('td').eq(i), service: services[0], $scope: obj.getScope(), 
								
								// Callbacks for table relevant functionality,
								// in this case: marking the row for the serializer.
								
								$table: $table, $row: $(row),
								before: function(obj, options) { options.$table.selectRow(options.$row); },
								after:  function (obj, options) { options.$table.deselectRows(); }
							});
						}
						else if ((!cell.services && column.atSelect) || (cell.atSelect && cell.atSelect.url))  {
						    $(row).children('td').eq(i).bind('click'+ns, { obj: obj, $table: $table, $row: $(row), col: column, cell: cell }, onColSelect);
						}
					}
				});
			});

		if ($table.checkService) 
			$rows.find('td.'+css.check).bind('click'+ns, onCheck).find('input').bind('change'+ns, onCheck);
			
		if ($table.rowService || $table.colService)
//		if ($table.rowService)
			$rows.hover(function(e) { $(this).addClass(css.focused); }, function(e) { $(this).removeClass(css.focused); });
			
		if ($table.editService)
			$table.find('td').not('.'+css.check).bind('click'+ns, { obj: obj }, onEdit);

		column = containsType($table.columns, 'status');
		if (column != -1){
			$.each(obj.rows, function(i,row){
				cell = obj.rows[i][column];
				cell.$place = $rows.not('.'+css.template).filter($rows[i]).children('td').eq(column).find('span:first');

				if (cell.acceptable){
					cell.$place.unbind('click' + ns).bind('click' + ns, cell, function(e)
					{
						e.data.$place.parent().removeClass(cell.status);
						e.stopPropagation();
					});
				}
			});
		}

		function containsType(columns, type)
		{
			var foundcol = 0;
			for (var i = 0; i < columns.length; i++){
				var col = columns[i];
				if (col.type == type)
					foundcol = i;
			}

			return foundcol;
		}
	}
	
	jQuery.fn.setInfoTooltips = function()
	{
		var $table = this;
		var $rows = $table.allRows();
		var $tooltips = $rows.find('td [title]');
		
		if(jQuery().tipTip && $tooltips.length > 0) {
			id.setTooltip($tooltips);
		}
	}

	// After creating rows
	// finish the rendering.
	
	jQuery.fn.finalizeDataRows = function()
	{
		var $table = this;
		var $rows = $table.allRows();
		
		// Empty table,
		// in the case of an editable table.

		if ($table.editService && $table.countRows() == 0)
			$table.newRow();
		
		// Color the rows alternatly.
		// Note: Odd/even are permuted, since jQuery starts with 0.
	
		zebraStripeRows($rows);

		// Update summary.

		if ($table.editService)
		{
			$table.rows = $table.allRows().not('.'+css.empty).length;
			$table.next().find('tr.'+css.footer+' td.'+css.left).html($table.rows+' '+($table.rows == 1 ? id.lang.get('entry') : id.lang.get('entries')));
		}
	}
	
	function zebraStripeRows($rows)
	{
		$rows.filter(':odd').removeClass(css.odd).addClass(css.even);
		$rows.filter(':even').removeClass(css.even).addClass(css.odd);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Get List value
	// ---------------------------------------------------------------------------------------------- //	
	
	function getSelectedListItem(cell, column)
	{
		var selectedItem;
			
		if (cell.type && cell.type == cos.list)	{
			$.each(cell.items, function(i, item)
			{
				if (item.selected) {
					selectedItem = item;
				}
			});
		} else if (column.type == cos.list)
			{
				$.each(column.items, function(i, item)
				{
					if (item.value == cell.value) {
						selectedItem = item;
					}
				});
			}	

		if (!selectedItem){
			selectedItem = column.items[0];
		}

		return selectedItem;	
	}
	
	
	// ---------------------------------------------------------------------------------------------- //
	// Footer with Navigation
	// ---------------------------------------------------------------------------------------------- //
	
	function addPaging(obj, flag)
	{
		obj.$table = addTable(obj);
		obj.$table.addFooter(obj, flag);
			
		function addTable(obj)
		{
			var $table = $('<table class="'+css.table+'"></table>');
		
			var pagingDiv = obj.getPlace().parent().parent().find('#'+ obj.id + css.pagingSuffix);
			pagingDiv.empty();
			obj.$place = pagingDiv ;
		
			$table.pageService = obj.hasService(cos.paging);
			$table.pageSize = obj.pageSize; 
				
			return $table;	
		}
	}
	
	jQuery.fn.addFooter = function(obj,flag)
	{	
		var $table = this;
		var $footer;
		var navigation = $table.pageService && (obj.pageCount != undefined ? obj.pageCount > 1 : true);		
		
		$footer = $(addRow(obj, navigation));
		obj.getPlace().append($footer);
		$table.$footer = $footer;
		
		addEvents(obj, $footer);
		
		if (obj.hasButtons && obj.hasButtons()) // removed limitation: && !obj.editable
			id.gui.button.init(obj, obj.$place.find('td#'+place.button), { $form: obj.getTask().getPlace() });

		// Functions
		
		function addRow(obj, navigation)
		{
			var cache = '';
		
			cache += '<table class="'+css.dataFooter+'">';
			cache += '<tr class="'+css.footer+'">';
			cache += left(obj, flag);
			cache += center(obj, navigation);
			cache += right(obj, navigation);
			cache += '</tr></table>';

			return cache;
		}

		function addEvents(obj, $footer)
		{
			var $table = obj.$table;
		
			if ($table.pageService)
			{
				$footer.find('td.'+css.center).bind('click'+ns, { obj: obj, service: $table.pageService }, onPage);
				$footer.find('select').bind('change'+ns, { obj: obj, service: $table.pageService, $footer: $footer }, onPageSize);
			}

			if ($table.editService)
			{
				$footer.find('#'+place.button+' a.'+css.add).bind('click'+ns, { obj: obj }, onAdd);
				$footer.find('#'+place.button+' a.'+css.remove).bind('click'+ns, { obj: obj }, onRemove);
			}
		}

		function left(obj, flag)
		{
			// Set and show 
			// entries per page.
			
			var flag = (flag == undefined ? true : flag); 
			
			var $table = obj.$table;
			$table.rows = $table.allRows().not('.'+css.empty).length;
			var all = 'all';
			var n = obj.rowCount || $table.rows;
			var pageSize = obj.pageSize == all ? all : obj.pageSize;
			var cache = '';
			var selected;
			var showCount;
			
			// sets page batch sizes from html if defined
			if (obj.getPlace().attr(attr.batch)) {
				var convBatch = [];
				var batch = obj.getPlace().attr(attr.batch).split(" ");
				$.each(batch, function(index, value) { 
					if (parseInt(value)) convBatch.push(parseInt(value));
					else convBatch.push(value);
				});
				prefs.counts = convBatch;
			}
			
			for (var i = 0; i < prefs.counts.length; i++)
			{
				if (pageSize && (n > prefs.counts[i-1] && n <= prefs.counts[i])) 
					showCount = true;
			}
			
			if (pageSize == all || n > pageSize || showCount)
			{
				cache += '<td class="'+css.left+' '+css.col25+'">';
				
				if (obj.getTask().isModal && !obj.getTask().isModal()) {
				
					if (prefs.counts.length == 1) {
						if ($table.staticRowCount) {
							cache += $table.rows;
						} else {
							cache += prefs.counts[0];
						}
					} 
					else 
					{
						cache += '<select id="'+place.pageSize+'" class="'+css.pageSize+'"'+'">';
					
						for (var i = 0; i < prefs.counts.length; i++)
						{
							selected = (pageSize == prefs.counts[i]) ? ' selected="yes"' : (pageSize == all ? ' selected="yes"' : '');
							
							if (obj.maxPageSize && (prefs.counts[i] > obj.maxPageSize))
								break;
							
							if (flag) {
								if (n > prefs.counts[i-1] && n <= prefs.counts[i]) cache += '<option value="'+all+'"'+selected+'>'+id.lang.get(all)+'</option>';
								else if (prefs.counts[i] < n) cache += '<option value="'+prefs.counts[i]+'"'+selected+'>'+prefs.counts[i]+'</option>'; 
								else cache += '';
							} else {
								if (prefs.counts[i] == all) cache += '';
								else if (prefs.counts[i] < n) cache += '<option value="'+prefs.counts[i]+'"'+selected+'>'+prefs.counts[i]+'</option>'; 
							}
						}
					
						cache += '</select>';
					}
					cache += ' '+id.lang.get('of')+' '+n+' '+entriesOf(n);
				} else {
					cache += $table.rows +' '+id.lang.get('of')+' '+n+' '+entriesOf(n);
				}
			}
			/* obsolete ?
			else if (obj.hasService(cos.paging) && obj.rowCount == undefined)
			{
				pageSize = obj.pageSize;
				cache += '<td class="'+css.left+' '+css.col25+'">';
				
				if (obj.getTask().isModal && !obj.getTask().isModal()) {
					cache += '<select id="'+place.pageSize+'" class="'+css.pageSize+'"'+'">';
				
					for (var i = 0; i < prefs.counts.length; i++)
					{
						selected = (pageSize == prefs.counts[i]) ? ' selected="yes"' : '';
						
						if (!flag) {
							if (prefs.counts[i] == all) cache += '<option value="'+all+'"'+selected+'>'+id.lang.get(all)+'</option>';
							else cache += '<option value="'+prefs.counts[i]+'"'+selected+'>'+prefs.counts[i]+'</option>'; 
						} else {
							if (prefs.counts[i] == all) cache += '';
							else cache += '<option value="'+prefs.counts[i]+'"'+selected+'>'+prefs.counts[i]+'</option>'; 
						}
					}
					
					cache += '</select>';
					cache += ' '+entries(n);
				} else {
					cache += $table.rows +' '+id.lang.get('of')+' '+n+' '+entries(n);
				}
			}
			*/
			else if ($table.find('td.'+css.error).attr('error'))
			{
				cache += '<td class="'+css.left+' '+css.col25+'">';
				cache += ('<div id="'+place.error+'"></div>');
			} 
			else
			{
				cache += '<td class="'+css.left+' '+css.col25+'">';
				cache += n+' '+entries(n);
			}
	
			cache += '</td>';
			return cache;
			
			function entries(rows) { return rows == 1 ? id.lang.get('entry') : id.lang.get('entries'); } 
            function entriesOf(rows) { return rows == 1 ? id.lang.get('entry') : id.lang.get('entriesOf'); } 
		}

		function center(obj, navigation)
		{
			return navigation ? id.gui.paging.htmlOf(obj, { showPages: prefs.showPages }) : '';
		}
		
		function right(obj, navigation)
		{
			var cache = '';
			
			cache += '<td id="'+place.button+'" class="'+css.right+' '+(navigation ? css.col25 : css.col50)+'">';
			
			if (obj.editable && obj.extendable)
			{
				cache += '<a class="'+css.button+' '+css.add+'"><span>&nbsp;</span></a>';
				if (obj.removable) cache += '<a class="'+css.button+' '+css.remove+'"><span>&nbsp;</span></a>';
			}
			
			cache += '</td>';
			
			return cache;
		}
	}
		
	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //

	// Rows and Columns

	function onRowSelect(e)
	{
		// Select means:
		// Select only this row and fire the service ..
		
		var obj = e.data.obj;
		var service = e.data.service;
		var $table = e.data.$table; 
		
		$table.selectRow($(this));
		id.service.call(obj, service, { reload: $table.reload, $form: obj.getTask().getPlace()  }); 
		$table.deselectRows();

		e.stopPropagation();
	}
	
	function onColSelect(e)
	{
		// Column/Cell Service:
		// A cell service may overwrite the general, column based service,
		// it may even delete it (by setting an empty URL).

		var obj = e.data.obj;
		var $table = e.data.$table;
		var $row = e.data.$row;
		var col = e.data.col;
		var cell = e.data.cell;
		var service = cell.services ? (cell.atSelect.url ? cell.atSelect : 0) : col.atSelect;

		if (service)
		{
			$table.selectRow($row);
			id.service.call(obj /* obj.getOwner() ? */, service, { reload: $table.reload, $form: obj.getTask().getPlace() }); 
			$table.deselectRows();
		}

		e.stopPropagation();
	}

	// Checks

	function onCheckAll(e)
	{
		// Checkbox at the header means:
		// Un/check all row checkboxes 
		
		var $item = $(e.target).is('input') ? $(e.target) : $(e.target).find('input:first');
		var flag = $item.is(':checked');
		
		e.data.$table.find('td :checkbox').each(function() { check($(this), {force: flag }); });

		e.stopPropagation();
	}

	function onCheck(e) 
	{ 
		// A click nearby a checkbox
		// should be interpreted as a click on the checkbox.		
		var $item = $(e.target).is('input') ? $(e.target) : $(e.target).find('input:first');
		
		var flag = $item.is(':checked');
		
		if($(e.target).is('input')) {
			$item = $(e.target);
			flag ? flag = true : flag = false;
		} else {
			flag ? flag = false : flag = true;
		}

		check($item, {force: flag } );
				
		e.stopPropagation();
	}
	
	function check($item, options)
	{
		var flag = options ? options.force : ($item.is(':checked') ? flag = false : flag = true );
		
		// Check means:
		// Select the row for later services ..

		if ($item.is(':radio'))
			$item.parent('td').parent('tr').parent('tbody').find('tr.'+css.selected).removeClass(css.selected);

		$item.attr('checked', flag);

		if (flag) $item.parent('td').parent('tr').addClass(css.selected);
		else $item.parent('td').parent('tr').removeClass(css.selected);
	}
	
	// Paging

	function onPageSize(e)
	{
		e.data.$item = e.data.$footer.find('a.'+css.selected);
		return onPage(e);
	}

	function onPage(e)
	{
		var $item = e.data.$item || $(e.target);		
		var obj = e.data.obj;
		var $place = obj.getPlace();
		var service = e.data.service;
		var text = $item.text();
		var page = $item.missed() ? 1 : (text.charAt(0) == sign.prev || text.charAt(text.length-1) == sign.next ? ($item.attr(attr.page) ? $item.attr(attr.page) : $item.parent('a').attr(attr.page)): $item.text());

		if (!page) 
			return false /* nothing to do */;

		var pageSize = $place.find('#'+place.pageSize).val();
		var $header = $place.find('th');
		var parameters = [];
		var $sorted;
		
		// First: Search for the primary sorted column.
		// (The page service needs always the primary sorting even at paging only.)
		
		$sorted = $header.find('.'+css.sortUp);
		if ($sorted.missed()) $sorted = $header.find('.'+css.sortDown);

		if ($sorted.exist()) 
		{ 
			parameters[parameters.length] = { id: cos.sort,   value: $sorted.eq(0).hasClass(css.sortUp) ? cos.sortUp : cos.sortDown };
			parameters[parameters.length] = { id: cos.column, value: $sorted.eq(0).parent('div').parent('th').attr('id') };
		}

		// The paging parameters itself ..

		parameters[parameters.length] = { id: cos.page,     value: page };
		parameters[parameters.length] = { id: cos.pageSize, value: pageSize }; 

		// Fire the service

		id.service.call(obj.getOwner(), service, { parameters: parameters });

		e.stopPropagation();
	}

	// Sorting

	function onSort(e)
	{
		var column = $(this).parent('div').parent('th').attr('id');
		var obj = e.data.obj;
		var service = e.data.service;
		var pageSize = obj.getPlace().find('#'+place.pageSize).val();
		var $header = e.data.$header;
		var parameters = [];
		var sort;

		// React immediately .. don't wait for the service response.
		// If sorted, then reverse sorting;
		// if not sorted, then sort it ascending.

		if ($(this).hasClass(css.sortUp)) 
		{ 
			$(this).removeClass(css.sortUp).addClass(css.sortDown); 
			sort = cos.sortDown; 
		}
		else if ($(this).hasClass(css.sortDown)) 
		{ 
			$(this).removeClass(css.sortDown).addClass(css.sortUp); 
			sort = cos.sortUp; 
		}
		else 
		{ 
			$header.find('.'+css.sortUp).removeClass(css.sortUp).addClass(css.sortNone); 
			$header.find('.'+css.sortDown).removeClass(css.sortDown).addClass(css.sortNone); 
			
			$(this).removeClass(css.sortNone).addClass(css.sortUp); 
			sort = cos.sortUp; 
		}
		
		// Collect the parameters ..
		
		parameters[parameters.length] = { id: cos.sort, value: sort };
		parameters[parameters.length] = { id: cos.column, value: column };
		if (pageSize) parameters[parameters.length] = { id: cos.pageSize, value: pageSize };
		
		// Service call
		
		id.service.call(obj.getOwner(), service, { parameters: parameters });
		
		e.stopPropagation();
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Table Edit (Events)
	// ---------------------------------------------------------------------------------------------- //

	function onKey(e)
	{
		var key = id.key;
		e = e || window.event;
		var $item;
		
		if ( $(e.target).is('td')) {
			$item = $(e.target)
		} else {
			$item = $(e.target).parents('td').filter('td:first');
		}
		
		//var $item = $(e.target).is('td') ? $(e.target) : $(e.target).parent(/*div*/).parent(/*td*/);
		var $table = e.data.$table;

		if (key.isShift(e)) return false /* done */;
		
		if (key.plusShift(e) && key.isTab(e.which))     { return $table.shiftCell($item, $table.prevCell($item)) ? false /* done */ : true /* back */; }
		if (key.isEnter(e.which) || key.isTab(e.which)) { return ($item.find('textarea').length != 0 ? true : ($table.shiftCell($item, $table.nextCell($item)) ? false /* done */ : true /* back */)); }
		if (key.isUp(e.which))                          { return $table.shiftCell($item, $table.upCell($item)) ?   false /* done */ : true /* back */; }
		if (key.isDown(e.which))                        { return $table.shiftCell($item, $table.downCell($item)) ? false /* done */ : true /* back */; }
		
		// id.key.debug(e, 'ignored');
		
		return true /* give back to global key handling */;
	}

	function onEdit(e)
	{
		var $table = e.data.obj.$table;
		var $item = $(e.target);
		if ($item.is('span')) $item = $item.parent();

		if (!$item.parent(/*tr*/).is('.'+css.data)) return false /* done */;
		if ($item.is('input, .'+css.locked)) return false /* done */;
		
		$table.find('td.'+css.edit).each(function(i, item) { $table.exitCell($(item)); });
		$table.editCell($item, true);
	}
	
	function onAdd(e)
	{
		var obj = e.data.obj;
		var $table = obj.$table;
		var row;

		$table.newRow();
		
		$table.finalizeDataRows();
		$table.shiftCell($table.editCursor(), $table.lastRow().firstCell(), { skip: true });

		if ($table.addService)
			id.service.call(obj, $table.addService, { $form: obj.getTask().getPlace() });
	}

	function onRemove(e)
	{
		var obj = e.data.obj;
		var $table = obj.$table;
		var n = 0;
	
		$table.selectedRows().each(function() 
		{ 
			$table.deleteRow($(this)); 
			n++; 
		});

		if (n > 0)
		{
			$table.finalizeDataRows();
			$table.shiftCell($table.editCursor(), $table.lastRow().firstCell(), { skip: true }); 
		}
 
		if ($table.deleteService)
			id.service.call(obj, $table.deleteService, { $form: obj.getTask().getPlace() });
	}

	// ---------------------------------------------------------------------------------------------- //
	// Row Edit
	// ---------------------------------------------------------------------------------------------- //

	jQuery.fn.newRow = function(options)
	{
		// Add a new row by the client
		// via cloning a template row.
		
		options = options || {};
	
		var $table = this;
		var $new;
		
		if ($table.obj.extendable)
		{
			$new = $table.$template.clone(true /* with all services */);
			
			$table.rows = $table.find('tr').not('.'+css.template).not('.'+css.header).not('.'+css.empty).length +1;
			$new.removeClass(css.template+' '+css.none).addClass(css.data);
			$new.find('td.'+css.isKey).text($table.rows);
		}
		
		if ($table.lastRow().exist()) { 
			$table.lastRow().after($new);
		} else {
			// all rows were deleted so clear also the obj.rows array
			$table.obj.rows = [];
			$table.templateRow().after($new);
		}
		
		renumberRows($table.obj);
	}

	jQuery.fn.deleteRow = function($row)
	{
		var $table = this;
		
		$row.remove();
		
		if ($table.countRows() == 0) 
		{
			// Hold at least 
			// one empty row.
			
			$table.newRow();
		}
		
		renumberRows($table.obj);
	}
	
	function renumberRows(obj) {
		$.each(obj.$place.find('tr.'+css.data).not(css.template), function(index, value) { 
  			$(this).attr('row', index+1).attr('key', index+1);
		});
	}

	// ---------------------------------------------------------------------------------------------- //
	// Cell Edit
	// ---------------------------------------------------------------------------------------------- //

	// Switches
	
	jQuery.fn.editCell = function($td, init)
	{
		var $table = this;
		var $input, $row;
		var value = emptyValueOf($td.text());
		var column = $.extend(true, {}, $table.columnOf($td));
		var colId = column.id;
		var $tr = $td.parent();
		var obj = $table.obj;
		var $rows = obj.rows;
		var before = $td.attr(attr.before);
		
		if (column.type == cos.list)
		{
			$input = $('<div class="'+css.wrap+' '+css.isSelect+' '+css.inTable+'"><input /></div>');
			
			if ($td.data('list')) 
			{
				column = $td.data('list');
			}
			$td.data('list', column);
			column.$place = $input;
			
			var label = id.cos.labelOf(column.items[0]);
			if (value =='') { value =(label ? label : valueOf(column.items[0], column.type, column.format)); }
			
			if ($rows.length && $rows[parseInt($tr.attr('row'))-1]) 
			{
				$.each($rows[parseInt($tr.attr('row'))-1], function(j, item) 
				{
					if (item && (item.type == cos.list) && (parseInt($td.attr('cell')) == j+1))
					{		
						item.$place = $input;
						item.id = colId+'_row'+$tr.attr('row');
						$td.data('list', item);

						id.object.bind(item, obj.getOwner());
						initList(item, $input);
						
						if (value =='') { value = valueOf(item.items[0], column.type, column.format); }
					}
				});
			} else {
				
				id.object.bind(column, obj.getOwner());
				column.id = colId+'_row'+$tr.attr('row');
				initList(column, $input);
			}
			
			//if ($tr.hasClass('empty')) {
				//initList(column);
			//}
		} else if (column.type == cos.time) {

			$input = $('<div class="' + css.wrap + ' ' + css.inTable + '"><input /></div>');
			column.$place = $input;

			if ($rows.length && $rows[parseInt($tr.attr('row'))-1])
			{
				$.each($rows[parseInt($tr.attr('row'))-1], function(j, item)
				{
					if (parseInt($td.attr('cell')) == j+1)
					{
						item.$place = $input;
						item.id = colId+'_row'+$tr.attr('row');

						id.object.bind(item, obj.getOwner());
						$input = id.gui.time.init(item);

						if (value =='') { value = id.format.toTimeConversion(item.value, column.format) }
					}
				});
			} else {

				id.object.bind(column, obj.getOwner());
				column.id = colId+'_row'+$tr.attr('row');
				$input = id.gui.time.init(column);

			}

		} else
		{
			$input = $('<div class="'+ css.wrap + (column.large ? ' '+css.textarea : '' )+'">'+ (column.large ? '<textarea></textarea>' :  '<input />') +'</div>');
			$td.data('list', column);
		}
		
		$td.empty().append($input).addClass(css.edit).attr('before', value);
		var $normInput = $td.find('input:not(.dropBox):not(.searchfield):not(.internal), textarea:not(.dropBox):not(.searchfield):not(.internal)');
		
		$normInput.val(value)
			.bind('blur'+ns, onLeave)
			.bind('keyup'+ns, { $table: $table }, function(e) { 	
				onKey(e);
			});
			
		setTimeout(function() { prepareRow($tr) }, 1);
		
		setTimeout(function() { 
			$td.find('input, textarea').filter(':first').focus(); 
		}, 1);
		
		showError($table.obj, $td);
				
		function onLeave(e, pressed, key, obj)
		{	
			//if (id.key.isTab(key)) {
				if ($normInput.val() != '') { 
					$td.attr(data.key, $normInput.val());
					$td.removeClass(css.empty); 
				} else if ($normInput.val() == '')  { 
					$td.attr(data.key, '');
					$td.addClass(css.empty); 
				}
				
				setTimeout(function() { prepareRow($tr) }, 1);
				
				//$table.shiftCell($td, $table.nextCell($td)); 
			//} 
		}
		
		
		
		$normInput.unbind('focus'+ns).bind('focus'+ns, obj, function(e) {
			id.key.register(column, onLeave, { keydown: [ 'tab' ] });
		});
		
		$td.unbind(event.changed).bind(event.changed, function(){ 
			$td.removeClass(css.empty); 
			var $selected = $td.find('li.'+ css.selected);
			$td.attr(data.key, $($selected[0]).attr('key'));
			setTimeout(function() { prepareRow($tr) }, 1);
			setTimeout(function() { $table.shiftCell($td, $table.nextCell($td)) }, 1);
		});
		
		$td.unbind(event.onSelectEmptyNone).bind(event.onSelectEmptyNone, function(){ 
			$td.addClass(css.empty); 
			var $selected = $td.find('li.'+ css.selected);
			$td.attr(data.key, $($selected[0]).attr('key'));
			setTimeout(function() { prepareRow($tr) }, 1);
		});
		
		$td.unbind(event.onSelectTabKey).bind(event.onSelectTabKey, function(){ 
			$table.shiftCell($td, $table.nextCell($td)); 
		});

	}
	
	function prepareRow($tr)
	{
		if ($tr.find('td').not('.'+css.empty).not('.'+css.check).not('.'+css.none).length) {
			$tr.removeClass(css.empty);
		} else {
			$tr.addClass(css.empty);
		}
	}
	  
	function initList(obj)
	{
		if (id.gui.select)
			id.gui.select.init(obj);
	}

	function showError(obj, $td)
	{
		var $p = $td.attr('error');
		$p = $('<p class="'+css.error+' '+css.message +'">'+$p+'</p>');
		obj.$table = obj.$table || obj.$place.find('.'+ css.table);
		obj.$footer = obj.$place.find('.'+ css.dataFooter);
		
		obj.callback = finalize;
		
		showErrors(obj);
		
		function finalize($error) {
			if ($td.attr('error')) {
				$error.empty().append($p);
			} else {
				$error.empty();
			}
		}
	}
	
	jQuery.fn.exitCell = function($td, options)
	{
		var $table = this;
		var $row = $td.parent(/*tr*/);
		var $input = $td.find('input, textarea');
		var column = $.extend({}, $td.data('list'));

		if ($row.missed() || $input.missed())
			return false;	
		
		var before = $td.attr(attr.before);
		var value = options && options.before ? before : $input.val(); 


		options = options || {};

		if (before != value)	
		{
			$row.removeClass(css.empty);
			id.object.change();
		}
		
		$td.removeClass(css.edit).removeAttr(attr.before);
		$td.text(emptyCellOf(value));
		
		if (column.type == cos.key)
		{
			// Set key (index) of row
			// necessary for updating ..
			
			$td.parent(/*tr*/).attr(attr.key, value);
		}
		
		if (column.type == cos.list)
		{
			$td.data('list', column);
		}

		if (options.skip)
			return true;

		var service = id.cos.hasService(column, cos.exit);

		if (service)
		{
			// id.debug('Call service "'+column.atExit.label+'" at column exit.');
			
			$table.selectRow($row);
			id.service.call(0, service, { $form: $table.obj.getTask().getPlace() });
			$table.deselectRows();
		}
		
		return true;
	}
	
	// Moves
	
	jQuery.fn.shiftCell = function($from, $to, options)
	{
		var $table = this;
		
		if ($from && $to && !$to.hasClass(css.locked)) 
		{
			$table.exitCell($from, options);
			$table.editCell($to, options);
			
			return true;
		}
		
		return false;
	}

	jQuery.fn.nextCell = function($td)
	{
		var $table = this;
		var $next; 
		
		// First, try neighborhood ..

		if ($next = $table.rightCell($td)) 
			return $next;
		
		// Second, try next line, 
		// if already exist. 
		
		if ($td.parent(/*tr*/).nextRow().exist()) 
			return $td.parent(/*tr*/).nextRow().firstCell();

		// Third, insert new line
		// and then take this. 
		
		$table.exitCell($td);
		$table.newRow();
		$table.finalizeDataRows();
		
		return $table.lastRow().firstCell();
	}
	
	jQuery.fn.prevCell = function($td)
	{
		var $table = this;
		var $prev, $row; 
		
		// First, try neighborhood ..

		if ($prev = $table.leftCell($td)) 
			return $prev;
		
		// Second, previous line,
		// if exist.
		
		if ($td.parent(/*tr*/).prevRow().exist()) 
			return $td.parent(/*tr*/).prevRow().lastCell();

		// Third, back to the default operation ...
		
		return 0;
	}
	
	jQuery.fn.rightCell = function($td) 
	{
		for (var $next = $td.next(); $next.exist(); $next = $next.next())
			if ($next.isEditable()) return $next;
	
		return 0;
	}
	
	jQuery.fn.leftCell = function($td) 
	{
		for (var $prev = $td.prev(); $prev.exist(); $prev = $prev.prev())
			if ($prev.isEditable()) return $prev;
			
		return 0;
	}
	
	jQuery.fn.upCell = function($td) 
	{
		var col = $td.attr('class').match(/w\d/);
	
		if ($td.parent(/*tr*/).prev('tr.'+css.data).exist()) 
			return $td.parent(/*tr*/).prev(/*tr*/).find('td.'+col+':first');
			
		return 0;
	}
	
	jQuery.fn.downCell = function($td) 
	{
		var col = $td.attr('class').match(/w\d/);
	
		if ($td.parent(/*tr*/).next('tr.'+css.data).exist()) 
			return $td.parent(/*tr*/).next(/*tr*/).find('td.'+col+':first');

		return 0;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Serialize
	// ---------------------------------------------------------------------------------------------- //

	function serialize(map, field, $element, wanted)
	{
		// The table check service allows the selection
		// of one or more rows, which added to the request.
		
		var $table = $element.find('.'+css.table);
		var $rows = $table.find('tr.'+css.data).not('tr.'+css.empty);
		
		if ($table.hasClass(css.edit))
		{
			// Editable tables have there own rules ..
			// .. if there are selected rows, then take the selected rows,
			// otherwhise take all ..
			// .. and: at Save operations take everytime all. Yes.
			
//			if (options.type != cos.save)  fro: there is no reference at all to this option!?
				//if ($rows.filter('tr.'+css.selected).exist())
					//$rows = $rows.filter('tr.'+css.selected);
		}
		else 
		{
			// For non-editable tables:
			// Take only selected rows.
		
			$rows = $rows.filter('tr.'+css.selected); 
		}
			
		$rows.each(function(row) 
		{ 
			// Row by row ..

			var $row = $(this);
			var $columns = $table.find('tr.'+css.header);
			var n = $columns.children().length;
			var $cp, $tp, parameter, value, col;

			for (col = 0; col < n; col++)
			{
				// Column by column ..
				// ID taken from the column title.
			
				$cp = $columns.children(/*td*/).eq(col);
				$tp = $row.children(/*td*/).eq(col);
				
				if ($tp.hasClass(css.check))
					continue;
				
				parameter = $cp.attr('id');
				
				if ($tp.children().hasClass(css.isSelect)) {
					value = $tp.find('li.'+css.selected).attr(attr.key);
				} else if ($tp.hasClass(css.isTime)) {
					if ($tp.text() == '\u00A0' || $tp.hasClass(css.oldDateFormat)) {
						value = $tp.text();
					} else if($tp.hasClass(css.edit)) {
						value = id.format.fromTimeConversion($tp.find('input').val(), $tp.attr(cos.format));
					} else {
						value = id.format.fromTimeConversion($tp.text(), $tp.attr(cos.format));
					}
				} else if ($tp.is('.'+css.edit)) {
					value =  $tp.find('input, textarea').val();
				} else {
					//value = $tp.text();
					value = $tp.attr(data.key) ? unescape($tp.attr(data.key)) : $tp.text();
				}
				
				value = $.trim(value);

				if (value.charCodeAt(0) == 160 /* &nbsp; */ || value.charCodeAt(0) == 32 /* space */) value = '';
			
				if (!$cp.hasClass(css.internal))
					if (wanted(parameter))
						id.serialize.addTable(map, field, row, col, parameter, value); 
			}
		});

		return map;
	}
	
	function serializeColumn(map, field, $element, wanted)
	{
		var $table;

		// Sometimes the service defined parameters,
		// which related to columns, but not to the table.
		// This function links to the table serializes.

		if (!wanted().explicit)
			return map;

		if (map.table)
		{
			// Everything's done
			
			id.debug(me+'Ignoring "'+field+'".');
			return map;
		}
		
		$table = $element.parent(/*tr*/).parent(/*tbody*/).parent(/*table*/);
		if (!$table.attr('id')) $table = $table.parent(/*div*/);
		
		id.debug(me+'Relegate to table via "'+field+'".');
		
		return serialize(map, $table.attr('id'), $table, wanted);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	// Table
	
	jQuery.fn.columnOf = function($td)
	{
		// The class of a table cell includes "w<n>", 
		// and the <n> is the column number.
		return $td.exist() ? this.columns[parseInt($td.attr('class').match(/w\d/)[0].slice(1))-1] : 0;
	}
	
	jQuery.fn.deselectRows = function() 
	{ 
		this.allRows().removeClass(css.selected).find('input:checked').attr('checked', false);
		
		return this;
	}

	jQuery.fn.selectRow = function($row) 
	{ 
		this.allRows().removeClass(css.selected);
		$row.addClass(css.selected);
		
		return this;
	}

	jQuery.fn.selectedRows = function() { return this.find('tr.'+css.selected); }
	jQuery.fn.allRows = function() { return this.find('tr.'+css.data); }
	jQuery.fn.allRowsPlusDummy = function() { return this.find('tr.'+css.data+', tr.'+css.dummy); }
	jQuery.fn.countRows = function() { return this.allRows().length; }
	jQuery.fn.hasSum = function() { return this.sumRow().length > 0; }

	// Table Row

	jQuery.fn.headerRow = function() { return this.find('tr.'+css.header); }
	jQuery.fn.lastRow = function() { return this.find('tr.'+css.data+':last'); }
	jQuery.fn.firstRow = function() { return this.find('tr.'+css.data+':first'); }
	jQuery.fn.nextRow = function() { return this.next('tr.'+css.data); }
	jQuery.fn.prevRow = function() { return this.prev('tr.'+css.data); }
	jQuery.fn.sumRow = function() { return this.find('tr.'+css.sum); }
	jQuery.fn.templateRow = function() { return this.find('tr.'+css.template); }
	jQuery.fn.rowOf = function() { return this.attr(attr.row); }
	
	// Table Cell
	
	jQuery.fn.lastCell = function() { return this.find('td:not(.'+css.none+', .'+css.check+', .'+css.locked+')').filter(':last'); }
	jQuery.fn.firstCell = function() {  return this.find('td:not(.'+css.none+', .'+css.check+', .'+css.locked+')').filter(':first'); }
	jQuery.fn.isEditable = function() { return !this.is('.'+css.check+', .'+css.none+', .'+css.locked+', .'+css.edit); }
	jQuery.fn.editCursor = function() { return this.find('td.'+css.edit); }
	jQuery.fn.isCheck = function() { return this.is('td.'+css.check); }
	jQuery.fn.isEdit = function() { return this.is('td.'+css.edit); }
	
	function valueOf(obj, type, format) 
	{ 
	    if (obj == null) return "";
	    
		if (obj.label)
		{
			// Priorize this
			// always
			
			return obj.label;
		}
		
		if (id.isObject(format)) {
			format = format.value; 
		}
	
		var value = id.cos.valueOf(obj);

		if (value == null) 
		{
			value = '';
		} 
		else if (type) 
		{
			if (type == cos.number) 
			{ 
				if (format == cos.percent) {
					value = id.formatPercent(value);
				}
				else if (format && format.indexOf('%') != -1) {
					value = jQuery.formatNumber(value, { format:format, locale:"de"});
				}
				else if (format && format.indexOf('#') != -1) {
					value = jQuery.formatNumber(value.toString(), { format:format, locale:"de"});
				}
				else if (format == cos.bytes) {
					value = id.bytesToSize(value, { decimals: 2 });
				}
				else if (value >= 1000) {
					value = id.formatNumber(value); 
				}
			} 
			else if (type == cos.text && format == cos.html) 
			{
				value = value.fromEntity();
			}
		}

		return value; 
	}

	function emptyCellOf(value) { return value === null || value === undefined || value === '' ? '\u00A0' : value; }
	function emptyValueOf(cell) { return !cell || (cell.charCodeAt(0) == 160 /* &nbsp; */ || cell.charCodeAt(0) == 32 /* space */) || cell == '?' ? '' : cell; }
	function emptyRow() { return 0; }

	// Prepare
	
	function getPlace(obj) 
	{ 
		var $place = $(obj.$scope).find('#'+ obj.id + place.callingSuffix); 
		return $place; 
	}
	
	function showProgress($place) { $place.addClass(css.call); }
	function hideProgress($place) { $place.removeClass(css.call); }
	
	// Updates 

	function mergeProperties(insert, updates)
	{
		for (var item in updates)
			if (!id.isMember([cos.columns, cos.rows], item))
				insert[item] = updates[item]; 
	}
	
	function mergeColumns(insert, updates)
	{
		// Update the columns ..
		// .. the existing ones.

		for (var i = 0; i < updates.columns.length; i++)
			for (var j = 0; j < insert.columns.length; j++)
				if (insert.columns[j].id == updates.columns[i].id)
					mergeProperties(insert.columns[j], updates.columns[i])
	}
	
	function mergeRows(insert, updates)
	{
		// Update the rows ...
		// .. take them completly.
				
		insert.rows = 0;
		insert.rows = updates.rows;
	}
	
	function showErrors(obj)
	{
		var $place = obj.$footer.find('td.'+css.left);
		var $error = $('<div id="'+place.error+'"></div>')
		
		if (obj.$table.find('td.'+css.error).attr('error')) {
            $place.empty().append($error); 
            return obj.callback($error);
        } else {
            return false;
        }
	}

}());
