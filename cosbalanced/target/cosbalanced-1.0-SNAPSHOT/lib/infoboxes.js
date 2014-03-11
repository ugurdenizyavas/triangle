/*
	File: infoboxes.js
	Purpose: Build <n> infoboxes in a given container.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.infoboxes = 
	{ 
		id: 'infoboxes',
	
		init: init,
		update: init /* no difference yet */
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Vocabulary
	
	var Class = { isInfoboxes: 'isInfoboxes', image: 'figure', infobox: 'info', link: 'link', clearfix: 'clearfix' };
	var COS = { infoboxes: 'infoboxes' };
	
	// Object management
	
	var me = id.meOf(id.gui.infoboxes);
	var ns = id.namespaceOf(id.gui.infoboxes); 

	id.object.register(id.gui.infoboxes, { docType: Class.isInfoboxes, cosType: COS.infoboxes /* DEPRECATED */ })

	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var $place = obj.getPlace();
		var lang = id.lang.getLang();
		
		$place.empty();
		
		var cache;
	
		$.each(obj.items, function()
		{	
			var link = this.link ? (this.link.url ? this.link.url : this.link) : 0;

			cache = '<div class="'+Class.infobox+' '+Class.clearfix+'">'; 

			if (this.label) cache += '<h2>'+(this.label[lang] ? this.label[lang] : this.label)+'</h2>'
			if (this.icon)  cache += '<img src="'+this.icon+'" class="'+Class.image+'"/><br><br><br><br><br><br><br><br>';
			if (this.text)  cache += '<p>'+(this.text[lang] ? this.text[lang] : this.text)+(link ? '<a>'+(this.link.label ? (this.link.label[lang] ? this.link.label[lang] : this.link.label) : '')+'</a>': '')+'</p>';
		
			cache += '</div>';
		
			$place.append(cache);
			
			if (link) 
				$place.find('div:last').bind('click'+ns, link, function(e) { window.open(e.data, '_blank'); })
		});
		
		obj.isContent(true);
	}

}());