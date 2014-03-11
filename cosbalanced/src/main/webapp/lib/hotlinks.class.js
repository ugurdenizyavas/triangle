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

	module({ ns:'id.gui', definition:function()
	{
		classify({name:'Hotlinks', definition:function()
		{
			def({name:'initialize', method:function initialize(name)
			{
				id.object.register( this, { name:name, docType:Class.isHotlinks, cosType:COS.hotlinks })
			}});

			def({ name:'init', method:function init(obj)
			{
				var cache, item;

				if (obj.items && obj.items.length != 0) {

					cache = '<h2>' + obj.label + '</h2>';
					cache += '<ul>';

					for (var i = 0; i < obj.items.length; i++) {
						item = obj.items[i];

						cache += '<li' + (!item.link || (item.locked && item.locked === true) ? ' class="' + Class.disabled + '"' : '') + '>';
						cache += '<a' + (!item.link || (item.locked && item.locked === true) ? '' : ' href="' + item.link + '"') + ' target="_blank">' + (item.label ? item.label : obj.link) + '</a>';
						cache += '</li>'
					}

					cache += '</ul>'

					obj.getPlace().hide().html(cache);
				}
			}});

			def({ name:'update', method:function update(obj)
			{
				this.init(obj);
			}})
		}});
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Vocabulary

	var Class = { isHotlinks:'isHotlinks', disabled:'disabled' };
	var COS = { hotlinks:'hotlinks' };
	var My = { name:'hotlinks' };

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.hotlinks = new id.gui.Hotlinks(My.name);

}());
