/*
	File: infoboxes.class.js
	Date: May 2012
	Author: Information Design
	Purpose: Build <n> infoboxes in a given container.

	Last Change: $Date: 2012-03-29 11:02:29 +0200 (Thu, 29 Mar 2012) $ by $Author: reilaender $
	Version: $Revision: 98924 $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Vocabulary
	// ---------------------------------------------------------------------------------------------- //

	var CSS = { isInfoboxes: 'isInfoboxes', image: 'figure', infobox: 'info', link: 'link', clearfix: 'clearfix' };
	var COS = { infoboxes: 'infoboxes' };
	var My = { name: 'infoboxes' };

	// ---------------------------------------------------------------------------------------------- //
	// Class
	// ---------------------------------------------------------------------------------------------- //

	module({ ns: 'id.gui', definition: function()
	{
		classify({ name: 'Infoboxes', definition: function()
		{
			// ------------------------------------------------------------------------------------- //
			// Constructor
			// ------------------------------------------------------------------------------------- //

			def({ name: 'initialize', method: function init(name)
			{
				id.object.register(this, { name: name, docType: CSS.isInfoboxes, cosType: COS.infoboxes });
			}});

			// ------------------------------------------------------------------------------------- //
			// Init
			// ------------------------------------------------------------------------------------- //

			def({ name: "init", method: function init(obj)
			{
				var $place = obj.getPlace();
				var lang = id.lang.getLang();
				var cache;

				$place.empty();

				$.each(obj.items, function()
				{
					var link = this.link ? this.link.url || this.link : 0;

					cache = '<div class="'+CSS.infobox+' '+CSS.clearfix+'">';

					if (this.label) cache += '<h2>'+(this.label[lang] ? this.label[lang] : this.label)+'</h2>'
					if (this.icon) cache += '<img src="'+this.icon+'" class="'+CSS.image+'"/>';
					if (this.text) cache += '<p>'+(this.text[lang] ? this.text[lang] : this.text)+(link ? '<a>'+(this.link.label ? (this.link.label[lang] ? this.link.label[lang] : this.link.label) : '')+'</a>': '')+'</p>';

					cache += '</div>';

					$place.append(cache);

					if (link)
						$place.find('div:last').bind('click'+this.ns, link, function(e) { window.open(e.data, '_blank'); });
				});

				obj.isContent(true);
			}});
		}});

	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.infoboxes = new id.gui.Infoboxes(My.name);

}());