/*
	File: modules.js
	Purpose: Build module bar, which offers other modules of the application - typically (and in this
	solution everytime) a module change causes a change of homepage, menu, hotlinks an so on.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.modules = 
	{
		id: 'modules',
	
		init: init,
		update: init /* no difference yet */
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	// Vocabulary
	
	var Class = { isModules: 'isModules', selected: 'selected', disabled: 'disabled', clearfix: 'clearfix' };
	var COS = { modules: 'modules' };

	// Object management

	id.object.register(id.gui.modules, { docType: Class.isModules, cosType: COS.modules /* DEPRECATED */ });

	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var cache, classes;

		if (!obj.items)
			return false;

		cache = '<ul class="'+Class.clearfix+'">';

		$.each(obj.items, function(i, item)
		{
			classes = (item.selected ? Class.selected+' ' : '') + (item.locked ? Class.disabled : '');

			cache += '<li'+(classes.length > 0 ? ' class="'+classes+'"' : '')+'>';
			cache += '<a'+(item.link ? ' href="'+item.link+'"' : '')+'>'+item.label+'</a>'
			cache += '</li>';
		});

		cache += '</ul>';

		obj.getPlace().hide().html(cache);
	}

}());
