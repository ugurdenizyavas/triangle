/*
	File: extras.js
	Purpose: Build company based extra links 
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.extras = 
	{
		id: 'extras',
	
		init: init,
		update: init /* no difference yet */
	};

	// ---------------------------------------------------------------------------------------------- //
	// At Load
	// ---------------------------------------------------------------------------------------------- //
	
	var Class = { isExtras: 'isExtras', disabled: 'disabled' };
	var COS = { extras: 'extras' };

	id.object.register(id.gui.extras, { docType: Class.isExtras, cosType: COS.extras /* DEPRECATED */ });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var lang = id.lang.getLang();
		var cache;

		if (!obj.items)
			return false;

		cache = '<ul>';

		$.each(obj.items, function(i, item)
		{
			cache += '<li'+ (item.id ? ' id="'+ item.id +'"' :  '') + ((!item.link || (item.locked && item.locked === true)) ? ' class="'+Class.disabled+'"': '')+'>';
			if (i > 0) cache += '<span>|</span>';
			if (item.link) cache += '<a'+(item.link ? ' href="'+item.link+'"' : '')+(item.link && item.link.indexOf('http://') !== -1 ? ' target="_blank"' : '')+'>';
			cache += (item.label[lang] ? item.label[lang] : item.label)+'</a></li>';
		});

		cache += '</ul>';

		obj.getPlace().hide().html(cache);
	}

}());