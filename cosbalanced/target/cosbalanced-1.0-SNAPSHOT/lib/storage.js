/*
	File: storage.js
	Date: November 2011
	Author: Information Design
	Purpose: Web storage handling  
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //
	
	var Driver = 
	{ 
		store: 'store', 
		localStorage: 'localStorage', 
		sessionStorage: 'sessionStorage',
		database: 'database',
		none: 'none'
	};
	
	var Prefs =
	{
		driver: Driver.localStorage,
		database: { size: 10*1024*1024 /* 10 MB */, name: 'Storage' }
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //
	
	id.storage =
	{
		id: 'storage',
		Driver: Driver,
		Prefs: Prefs,

		// ------------------------------------------------------------------------------------------- //
		// Init Driver
		// ------------------------------------------------------------------------------------------- //
	
		init: function(driver)
		{
			var drivers = 
			{ 
				'store': { storage: store, init: initGlobalStorage },  
				'localStorage': { storage: localStorage, init: initWebStorage },
				'sessionStorage': { storage: sessionStorage, init: initWebStorage },
				'database': { storage: null, init: initWebDatabase },
				'none': { storage: null, init: function() { id.warn(me+'No local storage available.'); } }
			};
		
			driver = driver || Prefs.driver;
			storage = drivers[driver].storage;

			return drivers[driver].init();

			// id.note(me+'INIT storage "'+driver+'".');
		},

		// ------------------------------------------------------------------------------------------- //
		// High Level Functions
		// ------------------------------------------------------------------------------------------- //
	
    	/**
	     * Collects a set of records that is retrieved from a table with the given filter attributes. 
	     * filter is an object literal like {name: 'frank', age: '54'}. This function joins logical expressions
	     * by AND
	     *
	     * @author tozkasap
	     * @param key 
	     *     The key value that is used the store the json representation of a table in local storage
	     * @param filter
	     *     The filter (simply key/value pairs) that will be applied to the table stored with the key,
	     *     value can be string, number, boolean, array
	     */
		
		collect: function(key, filter) 
		{
			var tmpResult = [];
			var result = [];
			var foundRec = id.storage.fetch(key);
			var rpFoundInFp = false;
			
			//clone foundRec object, clone name is tmpResult
			for(var i = 0, n = foundRec.items.length; i<n; i++)
				tmpResult[i] = foundRec.items[i];

			for(var fieldName in filter)
			{
				var fp = filter[fieldName];

				if(id.cos.isEmpty(fp) || id.cos.isAll(fp))
					continue;

				recordLoop: for(var i = 0, n = tmpResult.length; i<n; i++)
				{
					var rp = foundRec.items[i][fieldName];
					
					//If filter field is not empty and aTuple has the filter field as an attribute
					//then we can check for the equality
					if (rp !== undefined)
					{
						if(id.isArray(fp))
						{
						    if(id.isArray(rp))
						    {
						        //if one of the records in rp is in fp then that rp will be in the returning set
						        for(var j = 0, m=rp.length; j<m; j++)
						            for(var a = 0, l=fp.length; a<l; a++)
						                if(fp[a] === rp[j])
						                    continue recordLoop;
						        
						        tmpResult[i] = null;
						    }else
						    {
						        for(var j = 0, m=fp.length; j<m; j++)
						            if (rp === fp[j])
						                continue recordLoop;
						        
						        tmpResult[i] = null;
						    }
						}else
						{
						    if(id.isArray(rp))
						    {
						        for(var j = 0, m=rp.length; j<m; j++)
	                                if (fp === rp[j])
	                                    continue recordLoop;
						        
						        tmpResult[i] = null;
						    }else if(fp !== rp)
						    {
						        tmpResult[i] = null;
						    }
						}
					}
				}
			}
			
			//Now we have the result
			for (var i = 0, n = tmpResult.length; i<n; i++)
			    if (tmpResult[i] !== null)
				    result.push(tmpResult[i]);
			
			return result;
		},
		
		query: function(filter) 
		{
			var result = [];
	
			for (var i = 0, n = id.storage.size(), key; i < n; i++)
			{
				key = id.storage.index(i);
				
				if (key && key.match(filter)) 
					result.push(key);
			}
			
			return result;
		},
	
		count: function(filter) 
		{
			var result = 0;
		
			for (var i = 0, n = id.storage.size(), key; i < n; i++)
			{
				key = id.storage.index(i); 
				
				if (key && key.match(filter)) 
					result++;
			}
			
			return result;
		},

		clear: function(filter)
		{
			var n = 0;
	
			id.note(me+'Clear local storage by filter "'+filter+'" ..');
	
			$.each(id.storage.query(filter), function()
			{
				id.note(me+'Removing "'+this+'"');
				id.storage.remove(this);
				
				n++;
			});
			
			id.note(me+n+' entries removed.');
		},

		// ------------------------------------------------------------------------------------------- //
		// Low Level Functions
		// ------------------------------------------------------------------------------------------- //
	
		fetch:  function() { return none('fetch'); },
		store:  function() { return none('store'); },
		remove: function() { return none('remove'); },
		index:  function() { return none('index'); },
		size:   function() { return none('size'); }	
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	var me = id.meOf(id.storage);
	var storage = null;
	
	if (id.isIE({ max: 7 }))
		return false /* solved later by jQuery PlugIn */;
		
	id.storage.init();
	
	// ---------------------------------------------------------------------------------------------- //
	// Storage Init
	// ---------------------------------------------------------------------------------------------- //

	function initWebStorage()
	{
		// HTML5 Storage
		// LocalStorage or SessionStorage
	
		id.storage.fetch = function(key) { var result = $.parseJSON(storage.getItem(key)); return result && result.___string__ ? result.___string : result; };
		id.storage.store = function(key, data) { return storage.setItem(key, id.isObject(data) ? JSON.stringify(data): { ___string: data }); };
		id.storage.remove = function(key, value) { return storage.removeItem(key); };
		id.storage.index = function(i) {	return storage.key(i); };
		id.storage.size = function() { return storage.length; };
	}
	
	function initGlobalStorage()
	{
		// jQuery based Package
		// which offers a IE compatibility by using the "global storage"
		// but, unfortunately, not all functions (index). 
	
		id.storage.fetch = function(key) { return storage.get(key); };
		id.storage.store = function(key, value) { return storage.set(key, value); };
		id.storage.remove = function(key, value) { return storage.remove(key); };
		id.storage.size = function() { return storage.length; };
	}

	function initWebDatabase()
	{
		return id.error(me+'Web Database NOT IMPLEMENTED yet!');			
	
		if (!window.openDatabase)
			return id.error(me+'Browser doesn\'t support Web Database!');
	
		storage = window.openDatabase('storage', '1.0', Prefs.database.name , Prefs.database.size);
	
		// ...
		// .....
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function none() { return id.error(me+'Unknown or invalid driver!', { critical: true }); };
	function invalid(operation) { return id.error(me+'Driver doesn\'t support the operation "'+operation+'"!'); }

}());