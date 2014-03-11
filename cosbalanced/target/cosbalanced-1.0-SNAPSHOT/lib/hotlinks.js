/*
	File: hotlinks.js
	Purpose: Build a box with hotlinks by building a list with links. That's it.
	
	$Author: udy $
*/

(function()
{

	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.hotlinks =
	{
		id: 'hotlinks',
	
		init: init,
		update: init /* no difference yet */
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	// Vocabulary
	
	var Class = { isHotlinks: 'isHotlinks', disabled: 'disabled' };
	var COS = { hotlinks: 'hotlinks' };
	
	// Object management
	
	id.object.register(id.gui.hotlinks, { docType: Class.isHotlinks, cosType: COS.hotlinks /* DEPRECATED */ })
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var cache, item;
		
		if (obj.items && obj.items.length != 0) {

			cache = '<h2>'+obj.label+'</h2>'; 
			cache += '<ul>'; 
	
			for (var i = 0; i < obj.items.length; i++)
			{
				item = obj.items[i];
		
				cache	+= '<li'+(!item.link || (item.locked && item.locked === true) ? ' class="'+Class.disabled+'"' : '')+'>';
				cache += '<a'+(!item.link || (item.locked && item.locked === true) ? '' : ' href="'+item.link+'"')+' target="_blank">'+(item.label ? item.label : obj.link)+'</a>';
				cache += '</li>'
			}
		
			cache += '</ul>'
		
			obj.getPlace().hide().html(cache);
		}
	}

}());
