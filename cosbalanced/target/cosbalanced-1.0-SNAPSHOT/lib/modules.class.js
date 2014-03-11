/*
 File: 
 Date: 05.06.12 15:52
 Author: Information Design
 Purpose: 

 Last Change: $Date$ by $Author$
 Version: $Revision$
 */

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Vocabulary
	// ---------------------------------------------------------------------------------------------- //

	var Class = { isModules: 'isModules', selected: 'selected', disabled: 'disabled', clearfix: 'clearfix' };
	var COS = { modules: 'modules' };
	var my = { name: 'modules' };

	// ---------------------------------------------------------------------------------------------- //
	// Class
	// ---------------------------------------------------------------------------------------------- //

	module({ ns:'id.gui', definition:function()
	{
		classify({name:'Modules', definition:function()
		{
			def({name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name:name, docType: Class.isModules, cosType: COS.modules /* DEPRECATED */  });
			}});

			def({name:'init', method:function init(obj)
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
			}});

			def({name:'update', method:function update(obj)
			{
				this.init(obj);
			}});
		}});
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.modules = new id.gui.Modules(my.name);
}()); 