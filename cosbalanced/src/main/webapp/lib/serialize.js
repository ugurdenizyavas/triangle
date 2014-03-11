/*
	File: serialize.js
	Purpose: Serializer (map, form, object, ...) 
	
	$Author: udy $
*/

(function()
{ 
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.serialize =
	{
		id: 'serialize',

		addField: add,
		addParameters: addParameters,
		addForm: addForm,
		addTable: addTable,
		addList: addList,
		addURL: addURL,
		addMap: addMap,
	
		toJSON: toJSON,
		toURL: toURL,
		
		register: setSerializer,
		evaluate: evaluate,

		addExceptions: addExceptions
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Identity

	var me = id.meOf(id.serialize);
	var ns = id.namespaceOf(id.serialize); 
	
	// Vocabulary
	
	var COS = { all: '*', allPlus: '+', attr: 'id', value: 'value', table: 'table' };
	var Class = { isRadio: 'isRadio', readonly: 'readonly', none: 'none', disabled: 'disabled', internal: 'internal', subdialog: 'subdialog', oldTimeFormat: 'oldTimeFormat', isChart: 'isChart', button: 'button', buttons: 'buttons', isIndex: 'isIndex' };
	var Attr = { key: 'key', format: 'format' };
	var Prefix = { is: 'is' };

	// ---------------------------------------------------------------------------------------------- //
	// Field
	// ---------------------------------------------------------------------------------------------- //

	function add(map, key, value, options) 
	{
		var type, item;
	
		if (map[key] /* is already known */)
		{
			// Item already exist,
			// so translate it to an array,
			// for correct representation.

			if (id.isString(map[key]))
			{
				item = map[key];
				
				map[key] = [];
				map[key].push(item);
			}
		}

		if (options && options.array)
		{
			// Force an array
			// by option.
		
			if (!map[key]) map[key] = [];
		}
		
		if (id.isArray(map[key])) map[key].push(value); 
		else map[key] = value; 
		
		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Parameters
 	// ---------------------------------------------------------------------------------------------- //

	function addParameters(map, parameters)
	{
		// Works with parameters,
		// set by pairs { id: 'something', value: 'somewhat' }
	
		if (id.isObject(parameters) && !parameters.id)
			return addMap(map, parameters);
	
		if (id.isArray(parameters))
			for (var i = 0; i < parameters.length; i++)
				addParameters(map, parameters[i]);
	
		else if (parameters.id == '*')
			/* do nothing */;
	
		else if (parameters.value != undefined) 
			add(map, parameters.id, parameters.value);
		
		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Table
 	// ---------------------------------------------------------------------------------------------- //

	function addTable(map, field, row, col, parameter, value)
	{
		if (!map[field]) map[field] = { type: COS.table, columns: [], rows: [] }; 
		if (!map[field].rows[row]) map[field].rows[row] = [];

		// TODO: Array as value. 

		map[field].columns[col] = parameter;
		map[field].rows[row][col] = value;

		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// List
 	// ---------------------------------------------------------------------------------------------- //

	function addList(map, field, items)
	{
		if (!map[field]) map[field] = { type: COS.list, items: [] }; 
		map[field].items = items;

		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Map
	// ---------------------------------------------------------------------------------------------- //

	function addMap(map, parameters)
	{
		if (id.isArray(parameters))
			for (var i = 0; i < parameters.length; i++)
				addMap(map, parameters[i]);
	
		else for (var i in parameters) 
			add(map, i, parameters[i]);

		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// URL encoded parameters
	// ---------------------------------------------------------------------------------------------- //

	function addURL(map, url)
	{
		url = decodeURIComponent(url);

		var parameters = url.split('&');
		var pair;
		
		for (var i = 0; i < parameters.length; i++)
		{
			pair = parameters[i].split('=');
			map[pair[0]] = (pair[1] != undefined ? pair[1] : '');
		}

		return true;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Form based parameters
	// ---------------------------------------------------------------------------------------------- //

	var serializer = [];
	
	var standard = 
	{
		// TODO: Eliminate 'td' element (also a template change).

		search: 'div, th, input, textarea' + ', td',

		not: '[id^="highcharts"], [id$="-legend"], [id$="-select"], [id$="-actions"], [id$="servicestatus"], :radio, .'+Class.internal+', .'+Class.subdialog+', '+Class.button+', .'+Class.buttons,
		notAll /* not Plus */: '.'+Class.readonly+', .'+Class.disabled+', .'+Class.isChart+', .'+Class.isIndex,
		notAllPlus: ''
	};

	function addForm(map, $form, options)
	{
		options = options || {};
	
		// First: set the filter
		// by COS (service parameters, ..)
	
		var filter = setFilter(options);

		if (!filter)
			return map /* nothing to do .. */;
		
		// Second: Find the right place,
		// an active subdialog.
		
		var $subdialog = $form.find('.'+Class.subdialog+':visible');
		
		if ($subdialog.exist())
			$form = $subdialog;

		// Third: Find all relevant elements
		// TODO: Ignoring invisible subdialogs and their members.
		
		var $elements;
		
		if (filter.wildcard)
		{
			// Service parameters 
			// are '*' or '+'.
		
			$elements = $form.find(standard.search).filter('[id]').not(filter.client+', '+filter.not);

			for (var i = 0; i < $elements.length; i++)
				evaluate(map, $($elements[i]), wanted);
		}

		if (filter.explicit) 
		{
			// Service parameters 
			// are explicit IDs.
		
			var search = '';
		
			for (var i = 0; i < filter.service.length; i++)
			{
				if (i > 0) 
					search += ', ';
			
				if (filter.service[i] != COS.all)
					search += '[id='+filter.service[i]+']';
			}		

			$elements = $form.find(search);

			for (var i = 0; i < $elements.length; i++)
				evaluate(map, $($elements[i]), wanted);
		}

		return true;
		
		// Functions

		function setFilter(options)
		{
			// Initial optimization ...

			if (!options.selection)
				return null;

			var filter = $.extend({}, standard);
	
			for (var i = 0, selection = options.selection; i < selection.length; i++)
			{	
				var parameter = selection[i];
			
				if (parameter.id == COS.allPlus)
				{
					// The value is set to '+' (COS.allPlus),
					// so take all writeable and readonly fields in the form.
				 
					filter.service = COS.allPlus;
					filter.client = standard.notAllPlus;
					filter.wildcard = true;
		
					break /* everything's done */;
				}
				 
				if (parameter.id == COS.all)
				{
					// The value is set to '*' (COS.all),
					// so take all writeable fields in the form.
				
					filter.service = [COS.all];
					filter.client = standard.notAll;
					filter.wildcard = true;
				}
	
				if (parameter.id != COS.all && parameter.value === undefined)
				{
					// No value means: call by 'reference',
					// get the value in the form, referenced by the field ID.
					
					if (!filter.service)
						filter.service = [];
				
					filter.service.push(parameter.id);
					filter.explicit = true;
				}
			}
	
			return filter; 
		}

		function wanted(field) 
		{ 
			if (field === undefined)
			{
				// Requesting the 
				// filter options itself.
				
				return filter;
			}
		
			if (filter.wildcard)
			{
				if (filter.service == COS.allPlus) return true;
				if (id.isMember(filter.service, COS.all)) return true;
			}
			
			if (filter.explicit)
			{
				return id.isMember(filter.service, field);
			}
			
			return false;
		}
	}
	
	function evaluate(map, $element, wanted, options)
	{
		map = map || {};
		options = options || {};

		var field = options.id || $element.attr('id');

		if ($element.missed())
			return id.error(me+'Ignoring empty element!');

		// First: look for registered serializer,
		// referenced by class (isTable, ...) or tag ('th', ...)

		var types = $element.attr('class');
		var tag = $element[0].tagName.toLowerCase();
        
        // extract the class in case there are more additional classes on the element
		if (types) {
			var array = types.split(' ');
			$.each(array, function(index, value) {
				if (value.search('^'+ Prefix.is) != -1) {
					types = value;
				};
			});
		}

		for (var i = 0; types !== undefined && i < serializer.length; i++)
			if ((types.indexOf(serializer[i].type) != -1) || (tag == serializer[i].type))
				return serializer[i].f(map, field, $element, wanted);

		// TODO
		// Move to elements ...
	
		if ($element.is('.'+Class.isRadio)) return evalRadioButton(map, field, $element, wanted);

		// Secondly: use the 
		// standard serializer.
		
		if (wanted(field))
		{
			if ($element.is(':checkbox')) return evalCheckbox(map, field, $element);
			if ($element.is('input')) return evalInput(map, field, $element);
			if ($element.is('textarea')) return evalTextarea(map, field, $element);
		}
		
		// Nothing to do?
		
		id.debug(me+'No serialization of "'+field+'".');
		
		return false;
	}
	
	function evalInput(map, field, $element)
	{
		// TODO: Move to Elements package?
		
		var value = $element.val();
		
		if ($element.attr(Attr.format) && !$element.hasClass(Class.oldTimeFormat)) 
				value = id.format.fromTimeConversion(value, $element.attr(Attr.format));
		
		return add(map, field, value); 
	}
	
	function evalTextarea(map, field, $element)
	{
		// TODO: Move to Elements package?
		
		return add(map, field, $element.val()); 
	}
	
	function evalCheckbox(map, field, $element)
	{
		// TODO: Move to Elements package?
		
		return add(map, field, $element.is(':checked') ? 'true' : 'false'); 
	}

	function evalRadioButton(map, field, $element, wanted)
	{
		// TODO: Move to Elements package
		
		if (wanted(field))
		{		
			var $radio = $element.find(':checked');
			var value = $radio.attr(Attr.key) || $radio.attr(Attr.value) || $radio.val();
			
			if (value !== undefined)
				return add(map, field, value); 
		}
		
		return false;
	}
	
	function addExceptions(exceptions)
	{
		for (var i = 0; moreExceptions && i < moreExceptions.length; i++)
		{
			id.debug(me+'Add exception "'+moreExceptions[i]+'".');
			exceptions += ', '+moreExceptions[i];
		}
	}
	
	function setSerializer(element, serialize)
	{
		if (!id.isString(element))
			return id.error(me+'Can\'t register "'+element+'", unknown type.');

		for (var i = 0; i < serializer.length; i++)
			if (element == serializer[i].type)
			{
				serializer[i].f = serialize;
				return true;
			}
		
		serializer.push({ type: element, f: serialize });
		return true;
	}
	
	function toSearch(array, options)
	{
		var search = '';
	
		for (var i = 0; i < array.length; i++)
		{
			if (i > 0) search += ', '; 		
			if (options.type == 'class') search += '.';
			search += array[i];
		}	
		
		return search;
	}
		
	// ---------------------------------------------------------------------------------------------- //
	// Serialize to URL
	// ---------------------------------------------------------------------------------------------- //

	function toURL(map) 
	{
		var url = '';
		var type;
	
		for (var i in map)
		{
			if (map[i] && map[i].type) switch (map[i].type)
			{
				case COS.table:
				{
					var table = map[i];
				
					for (var row = 0; row < table.rows.length; row++)
						for (var col = 0; col < table.columns.length; col++)
							url += add(table.columns[col], table.rows[row][col]); 
							
					break;
				}
				
				default: id.error(me+'Can\'t URLize type "'+map[i].type+'" at "'+i+'".');
			}
			
			else switch (type = id.typeOf(map[i]))
			{
				case 'array': 	
				{
					for (var j = 0; j < map[i].length; j++)
						url += add(i, map[i][j]);

					break;
				}

				case 'number':  
				case 'string':  
				{
					url += add(i, map[i]); 
					break;
				}
				
				case 'boolean': 
				{
					url += add(i, map[i] ? 'true' : 'false'); 
					break;
				}

				default: id.error(me+'Unknown type "'+type+'" at "'+i+'"!');
			}
		}
		
		return url.slice(1 /* delete leading '&' */);
		
		// Functions
		
		function add(key, value)
		{
			return '&'+encodeURIComponent(key)+'='+encodeURIComponent(value);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Serialize to JSON
	// ---------------------------------------------------------------------------------------------- //

	function toJSON(map)
	{
		// Serialize a JacaScript Object to JSON.
		// Using external library, see others/json2.js.
	
		return JSON.stringify(map);
	}

}());