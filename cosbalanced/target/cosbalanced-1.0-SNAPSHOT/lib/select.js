/*
	File: select.js
	Purpose: Different kinds of select (radio, check, select, checkselect, swapselect, ...)
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.select =
	{
		id : "select",
		
		init: init,
		update: update,
		
		updateByButton: updateByButton
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var css = { isSelect: 'isSelect', disabled: 'disabled', focused: 'focused', selected: 'selected', message: 'message', none: 'none', dropBox: 'dropBox', dropList: 'dropList', top: 'top', bottom: 'bottom', close: 'close', multiple: 'multiple', scrollBox: 'scrollBox', warning: 'warning', error: 'error', showAll: 'showAll', reload: 'reload', noChange: 'noChange', locked: 'locked', parent: 'parent', icon: 'icon', text: 'text', closed: 'closed', searchfield: 'searchfield', expanded: 'expanded', l0: 'l0', found: 'found', foundParent: 'found-parent', activeSearch: 'active-search', activeList: 'active-list', highlighted: 'highlighted', showTooltip: 'showTooltip', searchbox: 'searchbox', searchfield: 'searchfield', visible: 'visible', match: 'match', noMatch: 'noMatch', extendable: 'extendable', textBox: 'textBox', readyToAddNewItem: 'readyToAddNewItem'}
	var attr = { key: 'key', index: 'index' }
	var cos = { change: 'change', emptyNone: 'empty.none', emptyAll: 'empty.all', add: 'add', pending: 'pending' }
	var event = { changed: 'changed', onSelectEmptyNone: 'onSelectEmptyNone', onSelectTabKey: 'onSelectTabKey', body: 'body' }
    var At = { broadcast: 'atBroadcast' };
	var itemClicked = false;

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //
	
	//id.object.register(id.gui.select, { docType: css.isSelect, serializer: serialize });
	
	// ---------------------------------------------------------------------------------------------- //
	// Select
	// ---------------------------------------------------------------------------------------------- //

	function init(obj, options)
	{		
		options = options || {};
		
		id.serialize.register(css.isSelect, serialize);
		
		var ns = id.namespaceOf('select'); 
		var $document, $input, clickElements, inputElement, showAll, initInput, $searchfield, list, scrollBox;
		var initInput = [];
		var results = [];
		var storedID = obj.id;
		$input = $('<input />');
		$window = $(window);
		$document = $('body');
		showAll = obj.$place.hasClass(css.showAll);
		var $searchbox = $('<div class="'+ css.searchbox +'"></div>');
		var $searchfield = $('<input class="'+ css.searchfield +'" type="text" autocorrect="off" />');
		var $textBox = $('<div class="'+css.textBox+'"></div>');
		
		if (!obj.items)
		{
			if (obj.$place.data('list')) {
				var storedObj = obj.$place.data('list');
				var storedObjItems = storedObj.items;
				obj = $.extend(true, storedObj, obj);
				obj.items = [];
				$.extend(true, obj.items, storedObjItems);
			} else {
				return false;
			}
		}
		
		if (options.classes) obj.$place.addClass(options.classes);
		//if (options.searchfield) obj.$place.addClass(css.showSearchfield);
		if (obj.extendable) {
			obj.$place.addClass(css.extendable);
			obj.$place.removeClass(css.activeSearch).removeClass(css.expanded);
		}
		
		if (!obj.$place.has('input').length) {
			obj.$place.empty().append($input).addClass(css.done);
		}
		
		if (obj.$place.hasClass(css.reload)) {
			options.reload = true;
		}
		
		if (obj.$place.hasClass(css.showTooltip) || obj.info) { 
			obj.$place.attr('title', obj.info ? obj.info : obj.label); 
			id.setTooltip(obj.$place);
		}

		itemClicked = false;
		clickElements = obj.$place;
		inputElement = obj.$place.find('input:first');
		
		clickElements.data('list', obj);
		
		if (obj.label) setLabel(obj);
		
		//clrMessage(obj);
		
		//if (obj.error || obj.warning) addMessage(obj);
		
		if (obj.items) {
			clickElements.find('div').remove();
			setEvents(obj, addList(obj));
		}
		
		if (!options.button) {
			$searchbox.append($searchfield);
			clickElements.append($searchbox);	
		}	
		
		// Functions
		function addList(obj)
		{
			var cache = '', initInput = [], limit = false, preSelected = false, hasItemService = false, prefix = '';
			var firstValue = obj.value ? obj.value : obj.label;
			var firstLabel = obj.label ? obj.label : obj.value;
			
			obj.id = obj.getTask().id+'_'+storedID;
									
			inputElement.addClass(css.dropBox).attr({ readonly: 'yes' });
			
			if (!obj.items || obj.items.length != 0) {
			
				cache += '<div'+(options.skipID ? '' : ( id.isIDevice() ? ' id="'+ obj.id +'-select"' : '' ))+' class="'+css.dropList+(obj.multiple ? ' '+css.multiple : '' )+'">';
				cache += '<div class="shadowbox"><div class="shadow_t"></div><div class="shadow_b"></div><div class="shadow_l"></div><div class="shadow_r"></div><div class="shadow_tl"></div><div class="shadow_tr"></div><div class="shadow_bl"></div><div class="shadow_br"></div></div>';
				//if (!options.button) cache += '<div class="searchcontainer"><div class="searchbox"><input class="searchfield" type="text" autocorrect="off" /></div></div>';
				cache += '<div class="'+css.scrollBox+'">';
				//cache += '<div class="'+css.noResults+'"></div>';

				cache += setItems(obj, prefix);

				cache += '</div></div>';
			}
								
			if (obj.locked) { 
				clickElements.addClass(css.disabled);
				if (!preSelected) { 
					inputElement.attr('key', firstValue).val(setValue( firstLabel )); 
				}
			} else {
				clickElements.append(cache);
				if (!options.button) obj.$searchfield = $searchfield;
				if (clickElements.hasClass( css.disabled )) clickElements.removeClass( css.disabled );
				if (!preSelected) { 
					//inputElement.attr('key', orgValue).val(setValue(firstValue));
					inputElement.val(setValue( firstValue.toEntity() ));
					if (obj.items && obj.items.length > 0) obj.items[0].selected = true;
					inputElement.next('div').find('ul li:first').addClass( css.selected );
				}	
			}
			
			scrollBox = inputElement.next('div').find('.'+css.scrollBox);
						
			if (limit) setScrollBox(scrollBox);
			
			//if (obj.extendable) {
				scrollBox.append($textBox);	
			//}
			
			function setItems(obj, prefix, level, count, list) {
				var cache = '', parent;
				var level = level || 0;
				var count = count || 0;
				
				if(!obj.items) {
					clickElements.data('data-result', list);
					return cache;
				}
				
				if (!list) list = [];
				
				cache += '<ul class="l'+level+'">';
				
				for (var i = 0; i < obj.items.length; i++)
				{	
					var item = obj.items[i];
					var innerPrefix = (prefix != '' ? prefix + '.' : '' ) + i;
					
					if(item.items) {
						parent = true;
					}
					
					item = obj.items[i] = { 
						value: id.cos.valueOf(item), 
						label: item.label ? item.label.toEntity() : (item.id ? item.id : id.cos.valueOf(item)),
						id: item.id ? ( obj.items[i].value == cos.emptyAll || obj.items[i].value == cos.emptyNone ? obj.id.replace(/\./g, '-')+'_'+item.id.replace(/\./g, '-') : item.id.replace(/\./g, '-')) : obj.id.replace(/\./g, '-')+'-'+i,
						selected: item.selected ? true : false,
						locked: item.locked ? true : false,
						hidden: item.hidden ? true : false,
						index: innerPrefix,
						group: item.group ? true : false,
						pending: item.pending ? true : false,
						services: item.services ? item.services : null,
						callback: item.callback ? item.callback : null,
						items: item.items ? item.items : null
					};
					
					if (item.services) {
						hasItemService = true;
						//obj.items[i].services = item.services;
					}
				
					count = count + 1;
					
					if (level == 0 && i == 0) { 
						firstValue = obj.locked ? item.value : item.label;
						firstLabel = obj.locked ? item.label : item.value;
					}
								
					if (item.selected) { 
						inputElement.val(setValue( item.label.fromEntity() )); 
						preSelected = true;
					
						if (obj.locked) { 
							inputElement.attr('key', item.value);
						}
					}
					
					if (!item.group && !item.locked && !item.hidden ) list.push(item);
					
					cache += htmlOfItem(item, innerPrefix, parent, level);

					cache += setItems(item, innerPrefix, level+1, count++, list);
					
					cache += '</li>';
					
					parent = false;
				}
				
				cache += '</ul>';	
				
				if (!showAll && count/2 >= 10) limit = true;
								
				return cache;
			}
			
			function htmlOfItem (item, index, parent, level) {
				var classes = 'l'+level + (item.selected ? ' '+ css.selected : '') + (item.locked ? ' '+ css.disabled : '') + (item.hidden ? ' '+ css.none : '') + (parent? ' '+ css.parent : '') + (item.group? ' '+ css.locked : '');
				
				return '<li'+(item.id ? ' id="'+ item.id +'"' : '' )+' index="'+ index +'" key="'+ item.value +'" class="'+ classes +'">' + (parent ? '<span class="'+ css.icon +'"></span><a class="'+ css.text +'">' : '<a>') + item.label +'</a>';
			}
			
			return hasItemService;
		}
		
		// Collects the values for the input element
		function setValue (value) {
			var setInput;
			initInput.push(value);
			setInput = initInput.join(", ");
			
			return setInput;
		}
		
		function setScrollBox (scrollBox) {
			scrollBox.css( 'height', '210px' );
		}
	
		
		function setEvents(obj, hasItemService)
		{
			if (obj.locked)
				return false;

			var dropList, dropShadow, isVerticalInverted = false, timer = 0;
				
			dropList = inputElement.next('div');
			dropShadow = dropList.children('div:first');
			
			if (obj.extendable) bindSearchEvent();
			bindContainerEvent();
			bindItemEvents(hasItemService);
			bindWindowResize();
			bindKeyboard(obj);
			
			function bindSearchEvent() {	
				//obj.$searchfield.unbind('focus'+ns).bind('focus'+ns, obj, function(e) {
				//	showSearchfield(obj.$searchfield, true);
				//});
				
				obj.$searchfield.unbind('click'+ns).bind('click'+ns, obj, function(e) {
					e.stopPropagation();
					bindSearchfield(obj);
					showSearchfield(obj.$searchfield, true);
				});
				
				$textBox.unbind('click'+ns).bind('click'+ns, obj, function(e) {
					e.stopPropagation();
					addNewItem(obj);
				});
			}
			
			// Binds the input container element to mouse events
			function bindContainerEvent() {

				clickElements.unbind('clickoutside'+ns).bind('clickoutside'+ns, function(e){ 
					toggleDropList(false); 
					e.stopPropagation();
				});		
						
				clickElements.unbind('click'+ns).bind('click'+ns, obj, function(e) {
					if (dropList.is(":hidden")) { 
						$document.trigger('click');
						toggleDropList(true);
					} else {
						toggleDropList(false); 
					}
					e.stopPropagation();
				});
			}
			
			// Bind all child list elements to mouse events
			function bindItemEvents() {
				var $item, index;
				
				dropList.bind('click'+ns, obj, function(e) {
					if ($(e.target).is('li, a')) {
						if ($(e.target).is('a')) e.target = e.target.parentNode;
						if ($(e.target).hasClass(css.locked)) return false;
						$item = $(e.target);
						index = $item.attr('index').split('.');
						onItemClick(e.data, $item, index, hasItemService);
					}
					else if ($(e.target).is('span')) {
						e.target = e.target.parentNode;
						$item = $(e.target);
						$item.toggleClass(css.closed);
					}
					e.stopPropagation();
				});
				
				// dropList.bind('mouseover'+ns, obj, function(e) {
// 					if ($(e.target).is('span')) {
// 						e.target = e.target.parentNode;
// 						$item = $(e.target);
// 						$item.addClass(css.focused);
// 						e.stopPropagation();
// 					}
// 				}).bind('mouseout'+ns, obj, function(e) {
// 					if ($(e.target).is('span')) {
// 						e.target = e.target.parentNode;
// 						$item = $(e.target);
// 						$item.removeClass(css.focused);
// 						e.stopPropagation();
// 					};
// 				});
			}
			
			
			
			// Hide DropDown list after an item is clicked an set the value to the input element
			function onItemClick(obj, $item, index, hasItemService) {
			
 				var item = getItemByLevelAndIndex(obj, 0, index);
 				
 				if (!options.button) obj.$searchfield.focus();
				
				if (obj.multiple) {

					itemClicked = true;

					initInput = [];
					
					if (item.selected) { 
					
						if (id.cos.isAll(item.value))  {
							removeOtherSelection(obj);
							item.selected = true;
							$item.addClass(css.selected); 
						} else if (item.value == cos.emptyNone) {
							item.selected = true;
							//$item.removeClass(css.selected); 
							
						} else { 
							item.selected = false;
							$item.removeClass(css.selected); 
							if (item.items) {
								selectChilds(item, false);
							}
							removeEmptyNone(obj);
						}
						
						//if (obj.change) obj.change();
						
					} else { 
					
						if (id.cos.isAll(item.value)) {
							item.selected = true;
							$item.addClass(css.selected);
							removeOtherSelection(obj);
							toggleDropList(false);
							
							if (options && options.afterChange)
								options.afterChange(obj.id, item.value);
															
							if (hasItemService) {
								onSelect(obj, item, index);
							}
							//else {
							//	if (obj.change) obj.change();
							//}	

						} else if (item.value == cos.emptyNone) {
							removeOtherSelection(obj);
							item.selected = true;
							$item.addClass(css.selected);
							toggleDropList(false);
							
						} else {
							item.selected = true;
							$item.addClass(css.selected);
							if (item.items) {
								selectChilds(item, true);
							}
							removeEmptyNone(obj);
							removeALLSelection(obj);
						}
					}
					
					//if (obj.change) obj.change();
					
					if (isOneSelected(obj)) { 
						setSelection(obj);
					} else { 
						inputElement.val(''); 
					}
					
					fireCustomEvents(item);
					
				} else {
					
					// options.button is set from buttons.js. 
					// The services are set as a list inside the select. 
					// No selection and value setting is needed.
					if (!options.button) { 
						removeSelection(obj);
						$item.addClass(css.selected);
						inputElement.val(item.label.fromEntity());
						item.selected = true;
					}
					
					toggleDropList(false);
					
					fireCustomEvents(item);
					
					if (options && options.afterChange)
						options.afterChange(obj.id, item.value);
					
					if (hasItemService) {
						onSelect(obj, item, index);
					} else if (item.callback) {
						onCallback(obj, item, index);
					} else {
						if (obj.change) obj.change();
					}
					
				}
				
				
			}
			
			// custom event could be used from outside the newselect
			function fireCustomEvents(item) {	
				if (!clickElements.hasClass(css.noChange)) dropList.trigger(event.changed);
				if (item.value == cos.emptyNone) dropList.trigger(event.onSelectEmptyNone);
			}
			
			// call item service
			function onSelect(obj, item, index) {	
				var service;
				if (obj.items[index].services) {
					if (options.button == true){ 
						obj.getTask().unchange(); 
                        options.afterCall = function() { 
                            if (obj.broadcast) { 
                                obj.broadcast(At.broadcast, obj); 
                            }
                        };
					}
					service = obj.items[index].services[0]; 
					id.service.call(obj.getTask(), service, { $form: obj.getTask().getPlace(), reload: options.reload, afterCall: options.afterCall });
				}
			}
			
			// item callback
			function onCallback(obj, item, index) {	
				var callback;
				if (obj.items[index].callback) {
					obj.getTask().unchange(); 
					return obj.items[index].callback();
				}
			}
			
			// Set selection
			function setSelection(obj) {
				if(!obj.items) return;
								
				for (var i = 0; i < obj.items.length; i++)
				{	
					var item = obj.items[i];
					
					if (item.selected) {
						inputElement.val(setValue(item.label.fromEntity()));
					}		
							
					setSelection(item);
				}
			}
			
			function removeSelection(obj) {
				if(!obj.items) return;
								
				for (var i = 0; i < obj.items.length; i++)
				{	
					var item = obj.items[i];
					
					if (item.selected) {
						//$item = dropList.find('#'+item.id);
						$item = $('#'+item.id);
						$item.removeClass(css.selected);
						inputElement.val(setValue(item.label.fromEntity()));
						item.selected = false;
					}		
							
					removeSelection(item);
				}
			}
			
			function removeALLSelection(obj) {
				if(!obj.items) return;
								
				for (var i = 0; i < obj.items.length; i++)
				{	
					var item = obj.items[i];
					
					if (id.cos.isAll(item.value)) {
						//$item = dropList.find('#'+item.id);
						$item = $('#'+item.id);
						if ($item.hasClass(css.selected)) $item.removeClass(css.selected);
						item.selected = false;
					}		
							
					removeALLSelection(item);
				}
			}
			
			// Deselect Empty.None
			function removeEmptyNone(object) {
					var oneSelected = isAtLeastOneSelected(object);
					selectEmptyNones(object, !oneSelected);
			}
			
			function isAtLeastOneSelected(object) {
				if(object.items)
				{
					for (var i = 0; i < object.items.length; i++)
					{	
						var item = object.items[i];
						if (item.value != cos.emptyNone  &&  item.selected == true) return true;
						
						if ( isAtLeastOneSelected(item) ) return true;
					}
				}
				
				return false;
			}
			
			function isOneSelected(object) {
				if(object.items)
				{
					for (var i = 0; i < object.items.length; i++)
					{	
						var item = object.items[i];
						if (item.selected == true) return true;
						
						if ( isAtLeastOneSelected(item) ) return true;
					}
				}
				
				return false;
			}

			function selectEmptyNones(object, selectIt) {
				if(object.items)
				{
					for (var i = 0; i < object.items.length; i++)
					{	
						var item = object.items[i];
						if (item.value == cos.emptyNone ) {
							//$item = dropList.find('#'+item.id);
							$item = $('#'+item.id);
							if ( selectIt )
							{
								$item.addClass(css.selected);
								item.selected = true;
								toggleDropList(false);
							}
							else
							{
								$item.removeClass(css.selected);
								item.selected = false;
							}
						}
						selectEmptyNones( item, selectIt );
					}
				}
			}
			
			function selectChilds(obj, select) {
				if(!obj.items) return;
								
				for (var i = 0; i < obj.items.length; i++)
				{	
					var item = obj.items[i];
					//$item = dropList.find('#'+item.id);
					$item = $('#'+item.id);
					
					if (select) {
						$item.addClass(css.selected);
						item.selected = true;
					} else {
						$item.removeClass(css.selected);
						item.selected = false;
					}	
							
					selectChilds(item, select);
				}
			}

			// Hide all DropDown Lists on a window resize
			function bindWindowResize() {
				$window.bind('resize', function() { 
					$document.trigger('click');
				});
			}
			
			function bindKeyboard(obj) {
				id.key.register(obj, onKey, { keyup: [ 'tab', 'enter' ] });
				//id.key.start(obj);
				//setTimeout( function() { bindSearchfield(obj) }, 1000);

				function onKey(e, pressed, key, obj)
				{					
					if (id.key.isTab(key)) 
					{	
						//closeAllDropLists();
						$document.trigger('click');
						//inputElement.focus();
						clickElements.trigger(event.onSelectTabKey);
						//id.key.stop(obj.id);
					} else if (id.key.isEnter(key)) {
						toggleDropList(true);
					}
				}
			}
			
			function bindSearchfield(obj) {
				id.key.register(obj, onKey, { keyup: [ 'AZ+shift', 'az+shift', 'number', 'backspace', 'enter', 'tab' ], keydown: [ 'up', 'down', 'esc' ]});
				//id.key.start(obj);	
		    }
		    
			
		    
			
			//	Hides/Shows the list and matches the size and orientation
			function toggleDropList(isShown) {
				var dropListVertical, dropListHorizontal, dropListWidthMode, clickElementsWidth = 0, dropListWidth = 0, inputFieldHeight = 0, dropListHeight = 0, dropListWidth = 0, inputFieldTop = 0, inputFieldLeftRelative = 0, shadowCSS = {};
				
				if (isShown && dropList.is(":hidden")) {
                
                    setTimeout( function() { scrollBox.animate({ scrollTop: 0 }, 1);}, 1);
					
					dropList.show();
						
						clickElements.addClass(css.expanded);
					
						inputFieldHeight = inputElement.outerHeight();
						clickElementsWidth = clickElements.outerWidth() - 1;
						dropListHeight = dropList.outerHeight();
						dropListWidth = dropList.outerWidth();
						inputFieldTop = inputElement.position().top;
						inputFieldLeft = inputElement.position().left - 1;
						if (inputFieldLeft <= 0) inputFieldLeftRelative = inputElement.offset().left;
						
						dropListVertical = getDropDownListVertical();
						
						//scrollBox.css({ "height": scrollBox.innerHeight()+'px' });
						
						//	Set Left or Right Position.
						if (((inputFieldLeftRelative || inputFieldLeft) + dropListWidth + 10) > $window.width()) { 
							inputFieldLeft = inputFieldLeft - dropListWidth + clickElementsWidth + 1; 
							shadowCSS = { "left": "0px", "width": dropListWidth - clickElementsWidth };
						} else {
							shadowCSS = { "left": clickElementsWidth };
						}
					
						//	Set Top or Bottom Position.
						if (isVerticalInverted == true) {
							dropShadow.find('div.shadow_b').removeAttr('style').css( shadowCSS );
							dropShadow.find('div.shadow_t').removeAttr('style').css({ "left": 0 });
						
							dropList.css({"top": inputFieldTop - dropListHeight, "left": inputFieldLeft });
							dropList.addClass(css.top).removeClass(css.bottom);
						} else {
							dropShadow.find('div.shadow_t').removeAttr('style').css( shadowCSS );
							dropShadow.find('div.shadow_b').removeAttr('style').css({ "left": 0 });
							
							dropList.css({"top": inputFieldTop + inputFieldHeight, "left": inputFieldLeft});
							dropList.addClass(css.bottom).removeClass(css.top);
						}
						
						if (!options.button && !obj.extendable) {
							bindSearchfield(obj);
						}
						
						// Set the width.
						if (dropListWidth > clickElementsWidth) dropListWidthMode = dropListWidth;
						else dropListWidthMode = clickElementsWidth +1;
						
						dropList.css({ "width": dropListWidthMode });
							
                        if (!options.button) {				
                            obj.$searchfield.focus();	
                        }
						//clickElements.data('data-result', clickElements.data('data-list'));
						
				} else if (!isShown && dropList.is(":visible")) {
						dropList.hide();
						id.key.stop(obj);
						
						if (!options.button) {
							showSearchfield(obj.$searchfield, false);
							obj.$searchfield.val('');	
							setMatch(clickElements, false, true);
							noResults(false, obj);
							if (obj.extendable) addItem(false)
							removePreviousResult(obj);
						}
						
						clickElements.removeClass(css.activeSearch).removeClass(css.activeList).removeClass(css.expanded);
						
						if (itemClicked && obj.multiple && obj.change) obj.change();
				}
				
				//	Determines the vertical orientation of the list
				function getDropDownListVertical() {
					var windowScrollTop = 0, windowHeight = 0, inputFieldBottom = 0, availableSpaceBelow = 0;
				
					windowScrollTop = $window.scrollTop();
					windowHeight = $window.height();
					inputFieldBottom = inputFieldTop + inputElement.outerHeight();
					availableSpaceBelow = windowHeight - (inputFieldBottom - windowScrollTop);
		
					isVerticalInverted = false;
		
					if (availableSpaceBelow - 20 < dropListHeight) {
						if ((inputFieldTop - windowScrollTop) > dropListHeight) {
							dropListTop = dropListHeight;
							isVerticalInverted = true;
						}
					}
		
					return dropListVertical;
				}	
			}
			
			
			
			// ---------------------------------------------------------------------------------------------- //
			// Search
			// ---------------------------------------------------------------------------------------------- //
			
			function onKey(e, pressed, key, obj)
			{
					
				if (id.key.isAlpha(key) || id.key.isNumber(key)) {
					search(obj);
					toggleDropList(true);
				} 
				else if (id.key.isBackspace(key)) {	
		        	search(obj);
		        	toggleDropList(true);
				} 
				else if (id.key.isEnter(key)) {
					if ($(e.target).hasClass(css.readyToAddNewItem)) {
						addNewItem(obj);	
					} else {
						enter(obj);
					}
				} 
				else if (id.key.isEscape(key)) {
		        	escape(obj);
				} 
				else if (id.key.isTab(key)) {
					$document.trigger('click');
					dropList.trigger(event.onSelectTabKey);
				} 
				else if (id.key.isUp(pressed.key)) {
					moveUp(obj);
				} 
				else if (id.key.isDown(pressed.key)) {
					if (!obj.$place.hasClass(css.activeSearch)) {
						if (!obj.$place.hasClass(css.activeList)) {
							setFirstItem(obj);
						} else {
							moveDown(obj);
						}
						obj.$place.addClass(css.activeList);
					} else {
						moveDown(obj);
					}
				} 
				else if (id.key.isShift(key)) {
					return false;
				}
				
				obj.$searchfield.focus();
				
			}
			
			
		
		    function search(obj) {
		    	var regex, zregex, searchText, results, parents, parts, part, found, first, startpos, text, parentIndex, parentID = '', parentRootID, parentObj;
		    	var rootObj = obj;
		    	$place = obj.$place;
		    	searchText = obj.$searchfield.val();
		    	
		    	regex = new RegExp('^' + searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
				zregex = new RegExp(searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
		
		    	removePreviousResult(obj);
		    	
		    	if (searchText == '') {
		    		//addHighlight($place, item);
		    		clickElements.data('data-result', list);
		    		showSearchfield(obj.$searchfield, false);
		    		setMatch(obj.$place, false, true);
		    		if (obj.extendable) {
		    			addItem(false, rootObj);
		    		} else {
			    		noResults(false, rootObj);
		    		}
		    		$place.removeClass(css.activeSearch).removeClass(css.activeList);
		    		return false;
		    	} else {
		    		showSearchfield(obj.$searchfield, true);
		    		if (!$place.hasClass(css.activeSearch)) {
		    			$place.addClass(css.activeSearch).removeClass(css.activeList);
		    		}
		    	}
		    			    	
		    	searchObject(obj);
		    	
		    	function searchObject(obj, results, parents) {
		    		found = false;
					startpos = 0;
					text = "";
		
					if(!obj.items) {
						return false;
					}
					
					if (!results) results = [];
					if (!parents) parents = [];
				
					for (var i = 0; i < obj.items.length; i++)
					{	
						var item = obj.items[i];
						
						if (!item.group) {
							if (regex.test(item.label)) {
							
								found = true;
								
							} else if (item.label.indexOf(" ") >= 0 || item.label.indexOf("[") === 0) {
								parts = item.label.replace(/\[|\]/g, "").split(" ");
								if (parts.length) {
			                		for (var j = 0; j < parts.length; j++) {
			                  			part = parts[j];
			                  			if (regex.test(part)) {
			                    			found = true;
			                  			}
			                		}
			              		}
							}
						}
						
						if (found) {
							if (first === undefined) first = true;
														
							$found = $('#'+item.id); 
							
							parentID = '';
							parentIndex = item.index.split('.'); 
							parentIndex = parentIndex.slice(0, -1).reverse();
							parentIndex = parentIndex.reverse();
							parentRootID = obj.id.substr(0, obj.id.indexOf("-"));
							
							for (var k = 0; k < parentIndex.length; k++) {	
								parentID += '-' + parentIndex[k];
								$parent = $('#'+parentRootID + parentID).addClass(css.foundParent);	
								parentObj = getItemByLevelAndIndex(rootObj, 0, $parent.attr('index').split('.'));
								parentObj.$item = $parent;
								parents.push(parentObj);
							}
							
							item.$item = $found;
							results.push(item);
							
							if (searchText.length) {
				                startpos = item.label.search(zregex);
				                if (startpos >= 0) {
				                	text = item.label.substr(0, startpos + searchText.length) + '</em>' + item.label.substr(startpos + searchText.length);
				                	text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
				                } else {
				                	text = item.label;
				                }
				           	} else {
				                text = item.label;
				            }
				            
				            if ($found.find('a:first').html() !== text) {
				                $found.find('a:first').html(text);
				        	}
				        	
							$found.addClass(css.found);
							
							if (first) {
								$found.addClass(css.highlighted);
								item.highlighted = true;
								addHighlight($place, item);
								first = false;
							}
				      	}
												
						searchObject(item, results, parents);
					}

					$place.data('data-result', results);
					$place.data('data-parents', parents);
				}
				
				if (obj.extendable) {
					if (searchText.length) {
			     		addItem(true, searchText);
			     	} else {
				     	addItem(false);
			     	}
		      	} else {
			      	if ($place.data('data-result').length < 1 && searchText.length) {
						noResults(true, rootObj, searchText);
						setMatch($place, false);
						return false;
					} else {
						noResults(false, rootObj);
						setMatch($place, true);
						return false;
					}		
		      	}
		      	
		    }
		    
		    function showSearchfield($field, flag) {
				if (flag) {
					$field.addClass(css.visible);
				} else {
					$field.removeClass(css.visible);
				}
			}
			
			function setMatch($place, flag, force) {
				if (force) {
					$place.removeClass(css.noMatch).removeClass(css.match);
					return false;
				}
				if (flag) {
					$place.addClass(css.match);
					$place.removeClass(css.noMatch);
				} else {
					$place.removeClass(css.match);
					$place.addClass(css.noMatch);
				}
			}
		    
			function removePreviousResult(obj) {
				var results, parents;
				var $place = obj.$place;
				
				if ($place.data('data-result')) {
					results = $place.data('data-result');
					for (var i = 0; i < results.length; i++) {
						results[i].highlighted = false;
						if (!results[i].$item) {
							results[i].$item = $('#'+results[i].id);
						}
						results[i].$item.removeClass(css.found).removeClass(css.highlighted).find('a:first').html(results[i].label);
					}
					if (obj.extendable) $textBox.removeClass(css.highlighted);
					//$place.data('data-result', $place.data('data-list'));
				}
				
				if ($place.data('data-parents')) {
					parents = $place.data('data-parents');
					for (var i = 0; i < parents.length; i++) {
						if (!parents[i].$item) {
							parents[i].$item = $('#'+parents[i].id);
						}
						parents[i].$item.removeClass(css.foundParent);
					}
					$place.data('data-parents', '');
				}
			}
			
			function noResults(show, obj, text) {
				var text;
				if(show) {
					$textBox.html(id.lang.get('noMatchFound')+' "'+ text +'"').show();
				} else {
					$textBox.empty().hide();
				}
			}
			
			function addItem(show, text) {
				var text;
				if(show) {
					$textBox.html(id.lang.get('addItem')+' "'+ text +'"').show();
				} else {
					$textBox.empty().hide();
				}
			}
			
			function addNewItemHighlight(obj) {
				$textBox.addClass(css.highlighted);
				$searchfield.addClass(css.readyToAddNewItem);
				//id.key.register(obj, onNewItemKey, { keydown: [ 'up' ]});
				
				function onNewItemKey(e, pressed, key, obj) {
					var $place = obj.$place;
				
					if ($place.data('data-result')) {
						results = $place.data('data-result');
						//results[results.length-1].highlighted = false;
						var item = results[results.length-1];
						if (!item.$item) {
							item.$item = $('#'+item.id);
						}
						addHighlight($place, item);
						//removeNewItemHighlight();
					}
				}
			}
			
			function removeNewItemHighlight() {
				$textBox.removeClass(css.highlighted);
				$searchfield.removeClass(css.readyToAddNewItem);
			}
			
			function addNewItem(obj) {
				if (!obj.services && obj.hasService('add', true))
					return false;
				
				var parameters;
				var service = obj.hasService(cos.add, true);
				var value = obj.$searchfield.val();
				var label = value;
				var pending = cos.pending;
				var item = { 'label': label, 'value': value.replace(" ","_").toLowerCase(), 'selected': true, 'pending': true };
				
				removeOtherSelection(obj);
				obj.items.push(item);

				if (storedID.indexOf('_') != -1) {
					storedID = storedID.split('_');
					storedID = storedID[storedID.length-1];
				}
				
				obj.id = storedID;
				id.gui.select.init(obj);

				//parameters = { 'id': storedID, 'value': value };

				id.service.call(obj.getOwner(), service, { $form: obj.getTask().getPlace() });
			}
			
			function setFirstItem(obj) {
		  		var results;
		  		var $place = obj.$place;
		  		
		        if ($place.data('data-result')) {
					results = $place.data('data-result');
				}
					
				for (var i = 0; i < results.length; i++) {
					 if ( i == 0 ) {
						addHighlight($place, results[i]);
						return false;
					}
				}				
		    }
			
			function moveDown(obj) {
		  		var results, nextItem;
		  		var $place = obj.$place;
		  		
		        if ($place.data('data-result')) {
					results = $place.data('data-result');
				}
					
				for (var i = 0; i < results.length; i++) {
					 if (results[i].highlighted && i != results.length - 1) {
						removeHighlight($place, results[i]);
						nextItem = results[i+1];
						addHighlight($place, nextItem);
						return false;
					} else {
						moveToNewItem();
					}
				}	
				
				if (!results.length) {
					moveToNewItem();
				}
				
				function moveToNewItem() {
					if (obj.extendable && $textBox.is(':visible')) {
						if (results[i]) removeHighlight($place, results[i]);
						addNewItemHighlight(obj);
					}
				}			
		    }
		    
			function moveUp(obj) {
		  		var results, prevItem;
		  		var $place = obj.$place;
		  		
		        if ($place.data('data-result')) {
					results = $place.data('data-result');
				}
				
				for (var i = 0; i < results.length; i++) {
					if (results[i].highlighted && i >= 1) {
						removeHighlight($place, results[i]);
						prevItem = results[i-1];
						addHighlight($place, prevItem);
						return false;
					} else if (i == 0) {
						if (!results[i].$item) {
		  					results[i].$item = $('#'+results[i].id);
		  				}
						scrollResult($place, results[i].$item, true);
						if (results[i].highlighted) return false;
					} else {
						moveFromNewItem();
					}
				}
				
				if (!results.length) {
					moveFromNewItem();
				}
				
				function moveFromNewItem() {
					if (obj.extendable) {
						addHighlight($place, results[results.length-1]);
						removeNewItemHighlight(obj);
					}
				}
		    }
		    
		    function enter(obj) {
		  		var results, prevItem;
		  		var $place = obj.$place;
		  		
		        if ($place.data('data-result')) {
					results = $place.data('data-result');
					
					for (var i = 0; i < results.length; i++) {
						if (results[i].highlighted) {
							//removeHighlight($place, results[i]);
							triggerSelection(obj, $place, results[i]);
							//return false;
						}
					}	
				}
		    }
		    
		    function escape(obj) {
		  		var results, prevItem;
		  		var $place = obj.$place;
		  		
		        if ($place.data('data-result')) {
		        	if (obj.$searchfield.val() == '') {
		        		$document.trigger('click');
		        	} else {
						results = $place.data('data-result');
					
						removePreviousResult(obj);
						noResults(false, obj);
						obj.$searchfield.val('');		
						obj.$place.removeClass(css.activeSearch);
					}
				}
		    }
		    
		    function addHighlight($place, item) {
		    	if (item) {
		    		item.highlighted = true;
		  			if (!item.$item) {
		  				item.$item = $('#'+item.id);
		  			}
		  			item.$item.addClass(css.highlighted);
		  			scrollResult($place, item.$item);
		  		}
		    }
		    
		    function removeHighlight($place, item) {
		    	if (item) {
		    		item.highlighted = false;
		  			if (!item.$item) {
		  				item.$item = $('#'+item.id);
		  			}
		  			item.$item.removeClass(css.highlighted);
		  		}
		    }
		    
		    function triggerSelection(obj, $place, item) {
		    	if (item) {
		  			if (!item.$item) {
		  				item.$item = $('#'+item.id);
		  			}
		  			obj.$searchfield.blur();
		  			showSearchfield(obj.$searchfield, false);
		  			item.$item.trigger('click'+ns);
		  		}
		    }
		    
			function scrollResult($place, $item, forceUp) {
				var itemHeightToBottom, itemHeightToTop, maxHeight, visibleSpaceToBottom, visibleSpaceToTop, scrollBoxTop, itemOffsetTop, itemHeight;
								
				scrollBox = dropList.find('.scrollBox');
				maxHeight = parseInt(scrollBox.css("maxHeight"), 10);
				scrollBoxOffsetTop = scrollBox.offset().top;
				itemHeight = $item.children('a:first').outerHeight();
				itemOffsetTop = $item.offset().top;
				visibleSpaceToTop = scrollBox.scrollTop();
				visibleSpaceToBottom = maxHeight + visibleSpaceToTop;
				itemHeightToTop = (itemOffsetTop - scrollBoxOffsetTop) + scrollBox.scrollTop();
				itemHeightToBottom = itemHeightToTop + itemHeight;
				
				//console.log('maxHeight :'+maxHeight);
				//console.log('scrollBoxTop :'+scrollBoxTop);
				//console.log('itemHeight :'+itemHeight);
				
				//console.log('itemHeightToTop :'+itemHeightToTop);
				//console.log('visibleSpaceToTop :'+visibleSpaceToTop);
				//console.log('visibleSpaceToBottom :'+visibleSpaceToBottom);
				//console.log('itemHeightToTop :'+itemHeightToTop);
				//console.log('itemHeightToBottom :'+itemHeightToBottom);
				
				//console.log('itemHeightToTop :'+itemHeightToTop+' < visibleSpaceToTop :'+visibleSpaceToTop);
				//console.log('itemHeightToBottom :'+itemHeightToBottom+' > visibleSpaceToBottom :'+visibleSpaceToBottom);
					
				if ( itemHeightToBottom >= visibleSpaceToBottom ) {
					scrollBox.scrollTop((itemHeightToBottom - maxHeight) > 0 ? itemHeightToBottom - maxHeight : 0);
				} else if ( itemHeightToTop < visibleSpaceToTop ) {
					scrollBox.scrollTop( itemHeightToTop );
				} else if ( forceUp ) {
					scrollBox.scrollTop( visibleSpaceToTop - itemHeight );
				}

			}
			
			
		    
			function getItemByLevelAndIndex( obj, level, index ) {
				var top = obj.items[ index[ level ] ];
		
				if ( level == index.length - 1 ) {
					return top;
				} else {
					return getItemByLevelAndIndex( top, level + 1, index );
				}
			}

			
			// Return finished element
			
			return dropList;
		}
		
		
		
		function setLabel(obj)
		{			
			var $label = obj.$place.prev(/*label*/);
			var required;
			
			if (obj.required === undefined) {
				if (obj.getTask().mode == cos.init) {
					required = false;
				} else {
					required = $label.text().indexOf('*') != -1;
				}
			} else {
				required = obj.required;
			}
	
			$label.text(obj.label + (required == true ? ' *' : ''));
		}
		
		// ---------------------------------------------------------------------------------------------- //
		// Serializer
		// ---------------------------------------------------------------------------------------------- //
		
		function serialize(map, field, $element, wanted)
		{
			var count = 0, response = [];
	
			if (wanted(field))
			{
				var $that;
				
				// iPhone related hack ..
				if (id.isIDevice() && !id.isIPad() && !id.isAndroid()) {
					$that = options.obj.getProcess().getPlace().find('#'+field+'-select');
				} else {
					$that = $element;
				}
				
				if ($that.missed())
					$that = $element;
					
				// .. ends here.
					
				if ($that.hasClass(css.disabled)) $found = $that.find('input:first');
				else $found = $that.find('li.'+css.selected);
				
				if (options.multiple && options.multiple == 'array' && $found.length > 1) {
					$found.each(function(i, item) { 					
						response.push($(item).attr(attr.key));
						count++
					});
					id.serialize.addField(map, field, response);
				} else {
					$found.each(function(i, item) { 					
						response = $(item).attr(attr.key);
						id.serialize.addField(map, field, response); 
					});
					count++
				}
	
				if (!count)
					id.serialize.addField(map, field, '');
			}
			
			return map;
		}

	}

	// ---------------------------------------------------------------------------------------------- //
	// Update
	// ---------------------------------------------------------------------------------------------- //
		
	function update(obj, options)
	{
		if (obj.$place.data('list')) {
		
			var storedObj = obj.$place.data('list');
			var storedID = storedObj.id;
			
			if (storedID.indexOf('_') != -1) {
				storedID = storedID.split('_');
				storedID = storedID[storedID.length-1];
			}
			
			storedObj.id = storedID;
			
			if (obj.status) {
				approvePending(storedObj);
				return false;
			} else if (obj.error) {
				declinePending(storedObj);
				//storedObj.id = storedID;			
			} else {
				removeOtherSelection(storedObj);
			
				$.each(obj.items, function(item) {
					setSelectedByValue( storedObj, this.value );
				});
			}
			
			obj = storedObj;
			
		} else {
			return false;
		}
		
		id.gui.select.init(obj, options);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Update By Buttons (Services rendered as list)
	// ---------------------------------------------------------------------------------------------- //
	
	function updateByButton(obj, button, $button, options)
	{
		var index = [];
		var clickElements = $('#'+obj.id+'-footer');
		index.push($button.attr('index'));
		
		if (clickElements.data('list')) obj = clickElements.data('list');
		var item = getItemByLevelAndIndex( obj, 0, index );
		item.services[0] = button;
		
		if (button.label)  {
			$button.children('a').html(item.label);
			item.label = button.label;
		} else {
			$button.children('a').html(item.id); 
			item.label = button.id;
		}

		if (button.hidden) {
			$button.addClass(css.none); 
			item.hidden = true;
		} else {
			$button.removeClass(css.none);
			item.hidden = false;
		}

		if (button.locked) { 
			$button.addClass(css.disabled); 
			item.locked = true;
		} else {
			$button.removeClass(css.disabled);
			item.locked = false;
		}
	}
    
    // ---------------------------------------------------------------------------------------------- //
	// Helper Functions
	// ---------------------------------------------------------------------------------------------- //
	
	function getItemByLevelAndIndex( obj, level, index ) {
		var top = obj.items[ index[ level ] ];
	
		if ( level == index.length - 1 ) {
			return top;
		} else {
			return getItemByLevelAndIndex( top, level + 1, index );
		}
	}
	
	function setSelectedByValue( obj, value ) {
		if(!obj.items) return;
						
		for (var i = 0; i < obj.items.length; i++)
		{	
			var item = obj.items[i];
			
			if (item.value == value) {
				item.selected = true;
			}		
					
			setSelectedByValue(item, value);
		}
	}
	
	function approvePending( obj ) {
		if(!obj.items) return;
						
		for (var i = 0; i < obj.items.length; i++)
		{	
			var item = obj.items[i];
			
			if (item.pending == true) {
				item.pending = false;
			}		
					
			approvePending(item);
		}
	}
	
	function declinePending( obj ) {
		if(!obj.items) return;
						
		for (var i = 0; i < obj.items.length; i++)
		{	
			var item = obj.items[i];
			
			if (item.pending == true) {
				obj.items.remove(i);
			}		
					
			declinePending(item);
		}
	}
	
	// Deselect all other items if selections is ALL
	function removeOtherSelection(obj) {
		if(!obj.items) return;
						
		for (var i = 0; i < obj.items.length; i++)
		{	
			var item = obj.items[i];
			
			if (!id.cos.isAll(item.value)) {
				//$item = dropList.find('#'+item.id);
				$item = $('#'+item.id);
				if ($item.hasClass(css.selected)) $item.removeClass(css.selected);
				item.selected = false;
			}		
					
			removeOtherSelection(item);
		}
	}

}());