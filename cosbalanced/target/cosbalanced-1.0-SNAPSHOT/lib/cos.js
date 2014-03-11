/*
	File: cos.js
	Purpose: Some useful stuff for COS.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Vocabulary
	// ---------------------------------------------------------------------------------------------- //

	var COS = { process: 'process', task: 'task', id: 'id', items: 'items', empty: 'empty.none', all: 'empty.all' };

	// ---------------------------------------------------------------------------------------------- //
	// COS Package Interface
	// ---------------------------------------------------------------------------------------------- //

	id.cos = 
	{
		hasService: function(obj, trigger, recursion)
		{
			var services = obj.services || obj;
			var result;
			
			if (services) for (var i = 0; i < services.length; i++)
			{
				if (!trigger) return services[i /* first */];
				if (services[i].trigger == trigger)	return services[i];
			}
				
			if (recursion && obj.items) for (var i = 0; i < obj.items.length; i++)
				if (result = id.cos.hasService(obj.items[i], trigger, recursion))
					return result;
				
			return undefined;
		},
		
		hasValue: function(obj, oid)
		{
			var value;
		
			if (obj.id == oid)
				return id.valueOf(obj);
				
			if (obj.items) for (var i = 0; i < obj.items.length; i++)
				if (value = id.cos.hasValue(obj.items[i], oid))
					return value;
					
			return null;
		},

		hasCallByReference: function(service)
		{
			if (service.parameters) 
				for (var j = 0; j < service.parameters.length; j++)
				{
					var parameter = service.parameters[j];
					
					if (parameter.id && parameter.value == undefined)
						return true;
				}
			
			return false;
		},
		
		valueOf: function(obj) 
		{ 
			var value = id.typeOf(obj) == 'object' ? (/* COS object notation = */ obj.value != undefined ? obj.value : null) :  /* COS short notation = */ obj;

			if (value && (id.typeOf(value) == 'string'))
				value = value.toEntity();
			
			return value;
		},
		
		labelOf: function(obj)  
		{ 
			if (id.typeOf(obj) == 'string')
				return obj;
				
			return obj.label ? obj.label.toEntity() : (obj.id ? obj.id : (obj.value ? obj.value : null)); 
		},
			
		isAll: function(value)  { return id.isMember(['ALL', 'All', 'all', 'Total', 'total', '*', COS.all], value); },
		isNull: function(value) { return value == null || id.isMember(['NULL', 'Null', 'null', 'NIL'], value); },

		isEmpty: function(item)
		{
			if (item === undefined || item === null) return true;
			if (id.isArray(item)) return item.length === 0;
			if (id.isNumber(item)) return false;
			if (id.isObject(item)) return $.isEmptyObject(item);
			if (id.isString(item)) return item === '' || item == COS.empty;
		},
	
					
		isTree: function(item)
		{
			for (var i = 0, items = item.items; items && i < items.length; i++)
				if (items[i].items) return true;
				
			return false;
		},
		
		isGroup: function(item)
		{
			for (var i = 0, items = item.items; items && i < items.length; i++)
				if (items[i].group) return true;
				
			return false;
		},
		
		items: function(obj, job)
		{
			var f = id.isFunction(job) ? job : job.f;
			var result;
		
			if (obj && obj.items) for (var i = 0; i < obj.items.length; i++)
			{
				var item = obj.items[i];

				if (!job.check || job.check(item, i))
					if (f) f(item, i); else return item;

				if (job.recursive && item.items)
					if (result = id.cos.items(item, job)) 
						return result;
			}
			
			return 0;
		},
		
		create: function(url)
		{
			var cp, cos;
			var elements = url.split('/');
			
			for (var i = 1, n = elements.length; i < n; i++)
			{
				if (i === 1) 
				{
					cos = cp = 
					{ 
						type: COS.process, 
						id: elements[i] 
					};
				}
				else
				{
					cp.items = 
					[
						{
							type: COS.task,
							id: elements[i]
						}
					];
					
					cp = cp.items; 
				}
			}
		
			return cos;
		},

		cursor: function(obj, path, options)
		{
			options = options || {}; 
		
			var elements = path.split('/');
			var op = obj;
			
			for (var i = 2, n = elements.length; i < n; i++)
			{
				for (var j = 0, m = (op.items ? op.items.length : 0), done = false; j < m && !done; j++) 
					if (op.items[j].id === elements[i])
					{
						op = op.items[j];
						done = true;
					}
			
				if (!done && options.extend)
					op = id.cos.append(op, options.extend);
			}
				
			return op;
		},
		
		collect: function(obj, filter, result)
		{
			var result = result || [];
			
			$.each(filter, function(key, value) 
			{
				if (obj[key] === value)
					result.push(obj);
					
				if (obj.items)
					$.each(obj.items, function() { id.cos.collect(this, filter, result); });
			});
			
			if (!result.length)
				result = null;
			
			return result;
		},
		/**
		 * @author tozkasap
		 * @param tcols
		 *     has table column definition array
		 * @param recs 
		 *     Record list that will be converted into table row list by using the matched column names in 
		 *     tcols parameter
		 * @param the values that can be inside options are <br/>
		 *        1. page: Number of the page<br/>
		 *        2. pageSize: amount of records that will be displayed in one page<br/>
		 *        3. baseDataKeyMap: the object literal that includes the keys of baseData list.
		 *                           key = baseData name, value = baseData local storage key<br/>
		 *        if there is no page related option this function will returns whole record set
		 */
		trows: function(tcols, recs, options){
		    var paging = false;
			var pageBegin, pageEnd, ps, pn;
			var rl = recs.length;
			var result = [];
			var bdm = options.baseDataKeyMap;
			
			if(options){
			    if(options.page && options.pageSize){
				    ps = options.pageSize;
					pn = options.page;//page number
				    pageBegin = (pn-1)*ps;
				    //if pageBegin is bigger than total record size then we know that page number 
				    //has exceeded the maximum. Just return an empty array
					if(pageBegin >= rl){
					    return result;
					}else{
					    pageEnd = pageBegin + ps;
						if(pageEnd > rl){ pageEnd = rl; }
					    paging = true;
					}
				}
			}
				
			for(var i=(paging?pageBegin:0), r=(paging?pageEnd:rl); i<r; i++){
			    var rec = recs[i];//record
				var row = [];
				for(var j=0, n=tcols.length; j<n; j++){
					var colId = tcols[j].id;//column id
					if(bdm && bdm[colId]){
						var baseDataObj = id.storage.collect(bdm[colId], {value: rec[colId]}, {});
						if(baseDataObj && baseDataObj[0]){row.push(row.push(baseDataObj[0].label));}
						else{row.push(row.push(rec[colId]));}
					}else{
						row.push(rec[colId]);
					}
				}
				result.push(row);
			}
			return result;
		},
	
		extract: function(cursor, filter)
		{
			filter = filter || [COS.id];
		
			var result = {};
			
			$.each(filter, function()
			{
				if (cursor[this])
					result[this] = cursor[this];
			});
		
			return result;
		},
		
		/*
		extract: function(input, index, filter)
		{
			progress = progress || "";
		
			// Create an minimal object 
			// from the given object.
		
			var elements = filter || [COS.id, COS.type, COS.items];
			var output = {};
		
			id.cos.items(input, 
			{ 
				recursive: true,

				check: function(item) 
				{ 	
					if (index === progress)
						return false;
				},

				f: function(item)
				{
					if (element === COS.id)
						progress += input[element]+'/';	
		
					if (id.isMember(elements, element))
						output[element] = input[element];
				}
			});
		},
		*/

		append: function(cursor, item)
		{
			if (!cursor.items) 
				cursor.items = [];

			cursor.items.push(item);
			
			return cursor.items[cursor.items.length-1];
		},

		urlToPath: function(url)
		{
			return url.slice(0, url.lastIndexOf('/'));
		},

		urlToCOS: function(url)
		{
			return id.cos.create(urlToPath(url));
		},

		// 'Til yet, the scope separator "." have to code to "-",
		//	because all jQuery selectors interprete the dot as class selector;
		//	there's still a problem by using meta signs like "\\." ..
		//	in research.

		jQueryID: function(id) { return id ? id.replace(/\./g, '-') : null; },
		serviceID: function(id) { return id ? id.replace(/-/g, '\.') : null;  },
		
		getDOMElementFromIndex: function(index) { 
			var $elm, scope = '';
			var array = index.split('/');
							
			$.each(array, function(index, item) {
				if (index == array.length - 1) scope += '#'+ item;
				else scope += '#'+ item + ' ';
			});
				
			$elm = $(scope);
				
			return $elm; 
		}
	};

}());
