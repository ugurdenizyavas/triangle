/*
 File: swapselect.class.js
 Date: 29.05.12 14:55
 Author: Information Design
 Purpose: Build a swap selected list.

 Last Change: $Date: 2012-06-15 12:22:46 +0000 (Fr, 15 Jun 2012) $ by $Author: gabriel $
 Version: $Revision: 102016 $
 */
(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Data
	// ---------------------------------------------------------------------------------------------- //

	var CSS = { isSwapSelect2:'isSwapSelect2', selectable:'selectableItems', selected:'selectedItems', selectCol:'selectCol', buttonCol:'buttonCol', swapButtons:'swapButtons', add:'add', remove:'remove', marked:'marked', locked:'locked' };
	var COS = { list:'list' };
	var Data = { key:'key' };
	var my = { name:'swapselect2' };

	// ---------------------------------------------------------------------------------------------- //
	// Class
	// ---------------------------------------------------------------------------------------------- //

	module({ ns:'id.gui', definition:function()
	{
		classify({ name:'Swapselect2', definition:function()
		{
			// ------------------------------------------------------------------------------------- //
			// Classify
			// ------------------------------------------------------------------------------------- //

			def({ name:"initialize", method:function init(name)
			{
				id.object.register(this, { name:name, docType:CSS.isSwapSelect2, cosType:COS.list, serializer:this.serialize });
			}});

			// ------------------------------------------------------------------------------------- //
			// Init
			// ------------------------------------------------------------------------------------- //

			def({ name:"init", method:function init(obj)
			{
				if (!obj.multiple)
					return id.error('List is not multiple');

				var $place = obj.getPlace().empty().append(this.htmlOf(obj));
				var $selectableItems = $place.find('#' + CSS.selectable);
				var $selectedItems = $place.find('#' + CSS.selected);

				var pixelPerLine = 15;
				var height = ((obj.items && obj.items.length != 0) ? obj.items.length + 1 : 4) * pixelPerLine;

				setListSize($place, height);

				if (!obj.locked)
					addBindings(this, $place, obj);

				if (obj.items)
					$.each(obj.items, function(i, item) { insertItem(item.selected ? $selectedItems : $selectableItems, id.cos.valueOf(this) || item, id.cos.labelOf(this)); });
			}});

			// ------------------------------------------------------------------------------------- //
			// Update
			// ------------------------------------------------------------------------------------- //

			def({ name:'update', method:function update(obj)
			{
				var $place = obj.getPlace();

				obj.locked ? this.lock($place) : this.unlock($place, obj);
			}});

			// ------------------------------------------------------------------------------------- //
			// Serialize
			// ------------------------------------------------------------------------------------- //

			def({ name:'serialize', method:function serialize(map, field, $element, wanted)
			{
				$selected = $element.find('#' + CSS.selected + ' li').each(function()
				{
					id.serialize.addField(map, field, $(this).attr(Data.key));
				});

				return map;
			}});

			def({ name:'htmlOf', method:function htmlOf(obj)
			{
				var cache = '<table>';
				cache += '<tr><th>available</th><th></th><th>selected</th></tr>';
				cache += '<tr>';
				cache += '<td class="' + CSS.selectCol + '"><div id="' + CSS.selectable + '"><ul></ul></div></td>';
				cache += '<td class="' + CSS.buttonCol + '"><div id="' + CSS.swapButtons + '">';
				cache += '<a id="' + CSS.add + '"><div>&ndash;></div></a></br><a id="' + CSS.remove + '"><div><&ndash;</div></a></div></td>';
				cache += '<td class="' + CSS.selectCol + '"><div id="' + CSS.selected + '"><ul></ul></div></td></tr></table>';

				return cache;
			}});

			def({ name:'lock', method:function lock($place)
			{
				$place.addClass(CSS.locked);
				$place.find('#' + CSS.swapButtons).each(function() { $(this).addClass(CSS.locked); });
				$place.unbind(this.ns);
			}});

			def({ name:'unlock', method:function unlock($place, obj)
			{
				$place.removeClass(CSS.locked);
				$place.find('#' + CSS.swapButtons).each(function() { $(this).removeClass(CSS.locked); });
				addBindings(this, $place, obj);
			}});

			function setListSize($place, height)
			{
				$place.find('ul').css('height', height + 'px');
			}

			function addBindings(that, $place, obj)
			{
				//toggle elements as marked
				$place.find('ul').bind('click' + that.ns, toggleElementMarked);

				//swap elements between selected and unselected
				$place.find('#' + CSS.add).bind('click' + that.ns, { obj:obj, from:'#' + CSS.selectable, to:'#' + CSS.selected }, swapMarkedElements);
				$place.find('#' + CSS.remove).bind('click' + that.ns, { obj:obj, from:'#' + CSS.selected, to:'#' + CSS.selectable }, swapMarkedElements);
			}

			function insertItem($itemContainer, value, label)
			{
				$itemContainer.find('ul').append('<li '+Data.key+'="'+value+'">' + (label || value) + '</li>');
			}

			function toggleElementMarked(e)
			{
				var $target = $(e.target);

				if ($target.is('li'))
					$target.toggleClass(CSS.marked);
			}

			function swapMarkedElements(e)
			{
				var options = e.data;

				var from = options.from;
				var to = options.to;
				var obj = options.obj;

				var $place = obj.getPlace();
				var $to = $place.find(to);

				var swappedItems = 0;

				$place.find(from + ' .' + CSS.marked).each(function()
				{
					var $this = $(this);
					$this.remove();
					insertItem($to, $this.attr(Data.key), $this.html());
					swappedItems++;
				});

				if (swappedItems > 0 && obj.hasService())
				{
					obj.change();
				}
			}

		}});
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.swapselect2 = new id.gui.Swapselect2(my.name);
	var me = id.meOf(my.name);

}());

