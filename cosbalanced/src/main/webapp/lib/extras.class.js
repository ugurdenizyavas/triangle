/*
 File: extras.class.js
 Date: May 2009
 Author: Information Design
 Purpose: Build company based extra links

 Last Change: $Date: 2012-06-15 07:26:24 +0000 (Fr, 15 Jun 2012) $ by $Author: gabriel $
 Version: $Revision: 101937 $
 */

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Vocabulary
	// ---------------------------------------------------------------------------------------------- //

	var Class = { isExtras:'isExtras', disabled:'disabled' };
	var COS = { extras:'extras' };
	var my = { name:'extras' };

	// ---------------------------------------------------------------------------------------------- //
	// Class
	// ---------------------------------------------------------------------------------------------- //

	module({ ns:'id.gui', definition:function()
	{
		classify({name:'Extras', definition:function()
		{
			def({name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name:name, docType:Class.isExtras, cosType:COS.extras /* DEPRECATED */ });
			}});

			def({name:'init', method:function init(obj)
			{
				var lang = id.lang.getLang();
				var cache;

				if (!obj.items)
					return false;

				cache = '<ul>';

				$.each(obj.items, function(i, item)
				{
					cache += '<li' + (item.id ? ' id="' + item.id + '"' : '') + ((!item.link || (item.locked && item.locked === true)) ? ' class="' + Class.disabled + '"' : '') + '>';
					if (i > 0) cache += '<span>|</span>';
					if (item.link) cache += '<a' + (item.link ? ' href="' + item.link + '"' : '') + (item.link && item.link.indexOf('http://') !== -1 ? ' target="_blank"' : '') + '>';
					cache += (item.label[lang] ? item.label[lang] : item.label) + '</a></li>';
				});

				cache += '</ul>';

				obj.getPlace().hide().html(cache);
			}});

			def({name:'update', method:function update(obj){
				this.init(obj);
			}});
		}});
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.extras = new id.gui.Extras(my.name);
}());