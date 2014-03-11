/*
	File: news.js
	Purpose: Show news delivered by the content management system
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.news = 
	{ 
		id: 'news',
	
		init: init,
		update: init /* no difference yet */
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //
	
	// Vocabulary
	
	var Class = { isNews: 'isNews', rubric: 'rubric', date: 'date', text: 'text', link: 'more', done: 'done' };
	var COS = { news: 'news' };
	
	// Object Management
	
	id.object.register(id.gui.news, { docType: Class.isNews, cosType: COS.news /* DEPRECATED */ });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var cache = '';
		
		if (obj.items && obj.items.length != 0) 
		{
			cache += '<h2>'+obj.label+'</h2>'; 
		
			$.each(obj.items, function()
			{	
				if (this.rubric) cache += '<p class="'+Class.rubric+'">'+this.rubric+'</p>';
				if (this.headline) cache += '<h3>'+this.headline+'</h3>';
			
				cache += '<p class="'+Class.text+'">';
				
				if (this.date) cache += '<span class="'+Class.date+'">'+this.date+'</span>';
				if (this.text) cache += '<span class="'+Class.text+'">'+this.text.nl2br()+'</span>';
	
				if (this.link) 
				{
					cache += '<span class="'+Class.link+'">';
					cache += '<a href="'+(this.link.url ? this.link.url : this.link)+'">'+(this.link.label ? this.link.label : this.link)+'</a></span>';
				}	
			
				cache += '</p>';
			});
			
			obj.getPlace().html(cache).addClass(Class.done);
		}
	}
	
}());