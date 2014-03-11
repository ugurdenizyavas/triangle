/*
	File: note.js
	Purpose: Using info objects.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.note = 
	{
		id: 'note',
		
		init: init,
		update: update,
		prepare: prepare,
		
		htmlOf: htmlOf
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	// Vocabulary

	var cos = { init: 'init', update: 'update', prepare: 'prepare', link: 'link', table: 'table', text: 'text', image: 'image', feedback: 'feedback', flag: 'flag', list: 'list' };
	var css = { none: 'none', wrap: 'wrap', done: 'done', isNote: 'isNote', group: 'group', clearfix: 'clearfix', feedback: 'feedback', image: 'image', isTable: 'isTable', button: 'button', section: 'section', actions: 'actions', expanded: 'expanded', isFlag: 'isFlag' };

	var me = id.meOf(id.gui.note);
	var ns = id.namespaceOf(id.gui.note); 
	
	id.object.register(id.gui.note, { docType: css.isNote, cosType: cos.note });

	// ---------------------------------------------------------------------------------------------- //
	// Init 
	// ---------------------------------------------------------------------------------------------- //

	function init(obj, options)
	{	
		var options = options || {};
		var $place = obj.$place;
		var $elm, $headline, $button;
		var $dynamic = $place.find('.'+css.tableWrapper + ' .' +css.dynamic);
		
		if (obj.items) {
			id.object.bind(obj.items, obj.getOwner(), $place);
		}
		
		//if ($place.is(':empty')) {
		$place.empty();
		$place.append(id.gui.note.htmlOf(obj, options));
		//}
				
		if (!$place.hasClass(css.isNote)) $place.addClass(css.isNote);
		
		if (obj.items) {
		
			$.each(obj.items, function(index, group) {
			
				if (group.items) {
					id.object.bind(group.items, obj.getOwner(), $place);
					
					group.$place = $place.find('#'+ group.id);
					
					$headline = group.$place.find('h3:first').text(group.label);
					
					$headline.bind('click'+ns, function(){
	        			$(this).parent().toggleClass(css.expanded);
	        		});
				
					$.each(group.items, function(index, section) {
					
						id.object.bind(section, obj.getOwner(), group.$place);
						
						section.$place = group.$place.find('#'+ section.id.replace('.', '-'));
						
						if (group.selected) group.$place.addClass(css.expanded);

						if (section.items) {
						
							$.each(section.items, function(index, item) {
							
								if (item.type) {
									switch (item.type)
									{	
										case cos.table: 
											id.object.bind(item, obj.getOwner(), $place.find('#'+item.id));
											id.gui.table.init(item);
											break;
											
										case cos.flag: 
											id.object.bind(item, obj.getOwner(), $place.find('#'+item.id));
											id.gui.flag.init(item);
											break;
											
										case cos.list: 
											id.object.bind(item, obj.getOwner(), $place.find('#'+item.id));
											id.gui.newSelect.init(item);
											break;
									}
								}
							});
						}
						
						if (section.hasService()) 
						{
							$button = section.$place.find('.'+ css.button);
							
							$button.unbind('click'+ns).bind('click'+ns, {obj: section }, function(e) 
							{ 
								var obj = e.data.obj;
								var service = obj.hasService();
									
								if (service.parameters) {
									id.service.call(obj.getOwner(), service, { $form: obj.getOwner().$place });
								}
							});
							
								
							$place.find('.'+ css.button).tipTip({
								maxWidth: "auto",
								edgeOffset: 10,
								defaultPosition: 'left'
							});
						}
			
					});
				}
			});
		}									
		return $elm;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Prepare 
	// ---------------------------------------------------------------------------------------------- //

	function prepare(obj)
	{	

	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Update 
	// ---------------------------------------------------------------------------------------------- //

	function update(obj)
	{

	}
	
	// ---------------------------------------------------------------------------------------------- //
	// HTML 
	// ---------------------------------------------------------------------------------------------- //
	
	function htmlOf(obj)
	{	
		var options = options || {};
		var cache = '';
		
		if (obj.items) {
			$.each(obj.items, function(index, group) {
			
				if (group.items) {
										
					cache += '<div id="'+(group.id ? group.id : '')+'" class="'+css.group+' ' + (group.selected ? ' '+css.expanded : '')+'">';
					if (group.label) cache += '<h3>'+(group.label ? group.label : '')+'</h3>';
				
					$.each(group.items, function(index, section) {
						
						id.object.bind(section, group.getOwner(), obj.$place);
						cache += '<div id="'+(section.id ? section.id.replace('.', '-') : '')+'" class="'+css.section+' '+css.clearfix+'"">';
						
						$.each(section.items, function(index, item) {
							if (item.type) {
								switch (item.type)
								{	
									case cos.image: 
										cache += '<div class="'+css.image+'" style="background:url('+ item.url +');"></div>';
										break;
								}
							}
						});
						
						$.each(section.items, function(index, item) {
					
							if (item.type) {
							
								switch (item.type)
								{
									case cos.link: 
										cache += '<a class="'+css.link+'" '+( item.link ? ' href="'+item.link+'"' : '' )+( item.external ? ' target="_blank"' : '' )+'>'+( item.label ? item.label : '' )+'</a>'; 
										break;
									
									case cos.text: 
										cache += '<h4>'+ item.label +'</h4>';
										cache += '<p>'+ item.value +'</p>';
										break;
										
									case cos.table: 
										cache += '<div id="'+item.id+'" class="'+css.isTable+'"></div>';
										break;
										
									case cos.flag: 
										cache += id.gui.flag.htmlOf(item);
										break;
										
									case cos.list: 
										cache += id.gui.newSelect.htmlOf(item, { dynamic: true });
										break;
								}
			
							}

						});
						
						cache += '<div class="'+css.actions+'">';
						
						if (section.hasService()) {
			
							$.each(section.services, function(index, service) {
								if (service.id == cos.feedback) {
									cache += '<a id="'+ service.id +'" '+ (service.label ? 'title="'+service.label+'"' : '')+' class="'+ css.feedback +' '+ css.button +'"><span><span class="icon"></span></span></a>'; 
								}
							});
				
							$.each(section.services, function(index, service) {
								if (service.id != cos.feedback) {
									cache += '<a id="'+ service.id +'" '+ (service.label ? 'title="'+service.label+'"' : '')+' class="'+ css.button +'"><span></span></a>'; 
								}
							});
				
						}
			
						cache += '</div>'; // actions
						cache += '</div>';	// section

					});

					cache += '</div>'; // group
					
				}
			});
		} 
					
		return cache;
	}
	
}());


