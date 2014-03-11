/*
	File: misc.js
	Purpose: Some test code, called by app.js.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.misc = 
	{
		id: 'misc',
	
		before: before,
		after: after,

		// Tests

		search: search,
		console: console
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	var me = id.meOf(id.misc);
	var ns = id.namespaceOf(id.misc); 

	// ---------------------------------------------------------------------------------------------- //
	// Start Up
	// ---------------------------------------------------------------------------------------------- //
	
	function before()
	{
		// Go directly ..
		// .. to the app. 
	
		// return false;
		
		// Otherwise ..
		// do some tests ..
	
	
		// dateConversions();
		// storage();
		// boxy();
		// console();
		file();

		return true /* then stop ...*/;
	}

	function after()
	{
		// keyboardHandler();
		// batch();
		// boxy();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Date Conversions
	// ---------------------------------------------------------------------------------------------- //

	function dateConversions()
	{
		id.debug(me+'Starting date test ...')
	
		id.tell(id.format.toDate('1.03.2009', { format: 'date' }));
		id.tell(id.format.toDate('CW52 2009', { format: 'weekYear' }));
		id.tell(id.format.toDate('03.2009', { format: 'monthYear' }));
		id.tell(id.format.toDate('2009', { format: 'year' }));

		id.tell(id.format.toDate('1.03.2010', { format: 'date' }));
		id.tell(id.format.toDate('CW52 2010', { format: 'weekYear' }));
		id.tell(id.format.toDate('03.2010', { format: 'monthYear' }));
		id.tell(id.format.toDate('2010', { format: 'year' }));
	}

	// ---------------------------------------------------------------------------------------------- //
	// Keyboard
	// ---------------------------------------------------------------------------------------------- //

	function keyboardHandler()
	{
		id.debug(me+'Starting keyboard test ...');
	
		id.key.register('debug', onKey, [ 'ctrl+a', 'esc', 'ctrl+enter' ]);
		id.key.start('debug');
		
		function onKey(e, pressed)
		{
			var text = me+"Keyboard handler got: "; 
			
			// Variante 1
		
			if (id.key.isEscape(pressed.key)) 
			{
				id.debug(text+'Escape - now STOPPING the TEST keyboard handler.');
				id.key.stop('debug');
			}

			// Variante 2

			else switch(pressed.trigger)
			{
				case 'ctrl+a': 
					id.debug(text+'Ctrl+A'); 
					break;
					
				case 'ctrl+enter': 
					id.debug(text+'Ctrl+Enter'); 
					break;
					
				case 'tab':
					id.debug(text+'Tab'); 
					return true /* Give back to browser ... */;
				
				default: id.debug(text+'Unknown trigger!');
			}
			
			return false /* Stop propagation!*/;
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Performance
	// ---------------------------------------------------------------------------------------------- //
	
	function batch()
	{
		id.debug(me+'STARTING batch job ....');
	
		id.service.call(0, { url: "cxx/chart/init" });
		setInterval(function() { id.service.call(0, { url: "cxx/chart/update" }); }, 5000);
	}

	// ---------------------------------------------------------------------------------------------- //
	// File System
	// ---------------------------------------------------------------------------------------------- //
	
	function file()
	{
		id.file.init({ afterInit: function(space, options) { 
			id.file.write('webkitfiletest.txt', 'TEST', { append: true, afterWrite: function(fileName, options) { 
				id.file.read(fileName, options); 
			}})
		}});

		return false;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Storage
	// ---------------------------------------------------------------------------------------------- //
	
	function storage()
	{
		var data = new Array('1', '2', '...'); 
	
		id.storage.store("1", "1", { id: 'test1', type: 'table', items: 'yep'} );
		id.storage.store("1", "2", { id: 'test2', type: 'table', items: 'yep'} );
		id.storage.store("1", "3", { id: 'test3', type: 'table', items: 'yep'} );
		id.storage.store("1", "4", data );
		id.storage.store("1", "5", "Not removed after tests ..." );
		
		id.debug("Got "+id.storage.fetch("1", "3").id);
		id.debug("Got "+id.storage.fetch("1", "4")[0]);
		
		id.storage.dump();
		
		id.storage.forget("1", "1");
		id.storage.forget("1", "3");
		id.storage.dump();

		id.storage.forget("1", "2");
		id.storage.dump();

		id.storage.forget("1", "4", { remove: true });
		
		id.debug(data[0]);
		id.storage.dump();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Search costs
	// ---------------------------------------------------------------------------------------------- //
	
	function search(pattern, $scope)
	{
		// Measuring (by Javascript Debugger)
		// ad hoc the costs of an jQuery search.

		id.measure('search');
		var $result = $scope ? $scope.find(pattern) : $(pattern);
		id.measure('search', { info: $result.selector });
	}

	// ---------------------------------------------------------------------------------------------- //
	// Bar
	// ---------------------------------------------------------------------------------------------- //
	
	function bar()
	{
		var counts = [10, 11, 12, 20, undefined];
		var obj = {};
		var prefs = { showPages: 10 };
	
		for (var j = 0; j < counts.length; j++)
		{
			obj.pageCount = counts[j];
			id.tell('Count: '+obj.pageCount);
		
			for (var i = 1; i <= (obj.pageCount || 20); i++)
			{
				obj.page = i;
				// id.tell(center(obj, true));
				id.tell(stringOf(id.gui.paging.htmlOf(obj, { showPages: prefs.showPages })));
			}
		}
		
		function stringOf(html)
		{
			var begin = /<td class="center"><div class="paging">/g;
			var pages = /<a><span>(\d{1,2})<\/span><\/a>/g;
			var selected = /<a class="selected"><span>(\d{1,2})<\/span><\/a>/g;
			var prev = /<a class="previous" page="\d{1,2}"><span>(\< \[prev\])<\/span><\/a>/g;
			var next = /<a class="next" page="\d{1,2}"><span>(\[next\] \>)<\/span><\/a>/g;
			var end = /<\/div><\/td>/g;
		
			return '"'+html.replace(begin, '').replace(prev, '$1').replace(next, '$1').replace(pages, ' $1').replace(selected, ' \[$1\]').replace(end, '')+'"';
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Console
	// ---------------------------------------------------------------------------------------------- //
	
	function console()
	{
		id.console.setLevel(false);
		id.section({ always: true });
		
		id.console.setLevel(true);
		id.section({ always: true });
		
		id.console.setLevel('error note warning measure');
		id.section({ always: true });
		
		id.console.setLevel('error note warning debug');
		id.section({ always: true });
		
		id.console.setLevel('error note warning');
		id.section({ always: true });
		
		id.console.setLevel('*');
		id.section({ always: true });
		
		id.console.setLevel(/* switch */);
		id.section({ always: true });
		
		id.console.setLevel(/* switch */);
		id.section({ always: true });
	}

	// ---------------------------------------------------------------------------------------------- //
	// Boxy
	// ---------------------------------------------------------------------------------------------- //
	
	function boxy()
	{
		var css = { index: 'index', info: 'info', indicator: 'indicator', kpis: 'kpi', right: 'right', first: 'first', table: 'dataTable', kpiBox: 'kpiBox', kpiInnerBox: 'kpiInnerBox', kpiTarget: 'kpiTarget', kpiTop: 'kpiTop', kpiBottom: 'kpiBottom', kpiValue1: 'kpiValue1', kpiValue2: 'kpiValue2', disabled: 'disabled', withService: 'withService', paging: 'paging', selected: 'selected', center: 'center', prev: 'previous', next: 'next', modal: 'modal', confirm: 'confirm', tableWrapper: 'tableWrapper', gridTable: 'gridTable', col1: 'col1', tabfooter: 'tabfooter', inner: 'inner', buttons: 'buttons', button: 'button'  };
		var cos = { percent: 'percent', absolute: 'absolute' };
		var attr = { page: 'page' };
		var place = { yes: 'yes', no: 'no' };
	
		var cache = '';
		var text = 'Testfall';
		var title = 'Testfall';
	
		cache += '<div class="'+css.modal+' '+css.confirm+'"><form><div class="'+css.tableWrapper+'">';
		cache += '<table class="'+css.gridTable+'"><tr><td class="'+css.col1+'">';
		cache += '<p>'+text+'</p>';
		cache += '</td></tr></table></div>';
		cache += '<div class="'+css.tabfooter+'"><div class="'+css.inner+'"><div class="'+css.buttons+'">';
		cache += '<a class="'+css.button+'" id="'+place.no+'"><span>'+ 'Finish' +'</span></a><a class="'+css.button+'" id="'+place.yes+'"><span>'+ 'Again' +'</span></a>';
		cache += '</div></div></div></form></div>';

		var dialog = new Boxy(cache, { title: title, windowMode: title, closeText: '', draggable: true, modal: false, unloadOnHide: true, closeable: false, cache: true, 
			behaviours: function(c) 
			{
				c.find('#'+place.yes).click( function() { dialog.hide(); delete dialog; boxy(); }); 
				c.find('#'+place.no).click( function()  { dialog.hide(); delete dialog; }); 
			}
		});
		
	}

	

}());
