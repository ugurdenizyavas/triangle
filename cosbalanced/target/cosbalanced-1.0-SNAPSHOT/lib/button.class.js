/*
 File: button.class.js
 Date: 08.06.12 10:43
 Author: Information Design
 Purpose: 

 Last Change: $Date: 2012-07-06 08:49:55 +0000 (Fr, 06 Jul 2012) $ by $Author: gabriel $
 Version: $Revision: 103212 $
 */

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { maxButtons:5, suffix:'-button', footer:'-footer' };

	// ---------------------------------------------------------------------------------------------- //
	// Vocabulary
	// ---------------------------------------------------------------------------------------------- //

	var COS = { add:'add', remove:'delete', cancel:'cancel', close:'close', multipart:'multipart', sort:'sort', up:'up', down:'down', none:'none' };
	var Class = { button:'button', select:'s2', disabled:'disabled', hidden:'none', dynamic:'dynamic', action:'action', wrap:'wrap', isSelect:'isSelect', internal:'internal', sort:'sort', up:'sort_up', down:'sort_down', changed:'changed', showTooltip:'showTooltip', calling:'calling' };
	var Suffix = { footer:'-footer' };
	var Service = { button:'button' };
	var Attr = { owner:'data-owner' };
	var At = { broadcast:'atBroadcast' };
	var My = { name:'button'};

	// ---------------------------------------------------------------------------------------------- //
	// Class
	// ---------------------------------------------------------------------------------------------- //

	module({ ns:'id.gui', definition:function()
	{
		classify({ name:'SingleButton', definition:function()
		{
			def({ name:'addButton', method:function addButton(obj, $place, button, options)
			{
				var buttons = obj.hasButtons();
				var $foot = $place;
				var $dialog = obj.getPlace();
				var that = this;

				delete button.exist;

				var buttonInDOM = '#' + button.id + ', #' + idOf(button.id);

				if (set($foot.find(buttonInDOM)));
				else if (set($dialog.find(buttonInDOM)));
				else {
					var $button = $(this.htmlOf(obj, button));

					this.setButton(obj, $button, button, options);
					this.insert($place, $button);
				}

				button.exist = true;

				function set($button)
				{
					if ($button.missed())
						return false;

					that.setButton(obj, $button, button, options);
					return true;
				}
			}});

			def({ name:'htmlOf', method:function htmlOf(obj, button)
			{
				var cache = '';

				cache += '<a id= "' + idOf(button.id) + '" ' + Attr.owner + '="' + obj.type + '" class="' + Class.button + (button.requestFormat == COS.multipart ? ' disabled' : '') + '">';
				cache += '<span></span>';
				cache += '</a>';

				return cache;
			}});

			def({ name:'insert', method:function insert($place, $button)
			{
				$place.append($button);
			}});

			def({ name:'setButton', method:function setButton(obj, $button, button, options)
			{
				// It is a Dropdown so move to Select package
				if ($button.is('li')) {
					id.gui.select.updateByButton(obj, button, $button, options);
					return false;
				}

				$button.attr('id', idOf(button.id));

				if ($button.hasClass(Class.showTooltip) || button.info) {
					$button.attr('title', button.info ? button.info : button.label);
					id.setTooltip($button);
				}

				if (button.type) $button.addClass(button.type);

				if (button.type == COS.sort && button.direction) {
					$button.removeAttr('class');
					switch (button.direction) {
						case COS.up:
							$button.addClass(Class.up);
							break;
						case COS.down:
							$button.addClass(Class.down);
							break;
						case undefined:
							$button.addClass(Class.sort);
							break;
					}
				}

				button.label ? $button.children('span').html(button.label) : $button.children('span').html(button.id);

				button.hidden ? $button.addClass(Class.hidden) : $button.removeClass(Class.hidden);

				if (button.locked) {
					$button.addClass(Class.disabled);
					$button.unbind('click' + ns);
				}
				else $button.removeClass(Class.disabled);

				if (!(button.locked || button.hidden || button.requestFormat == COS.multipart))
					$button.unbind('click' + ns).bind('click' + ns, { obj:obj, sid:button.id, $button:$button, options:options, that:this }, this.onClick);
			}});

			// ---------------------------------------------------------------------------------------------- //
			// Events
			// ---------------------------------------------------------------------------------------------- //

			def({ name:'onClick', method:function onClick(e)
			{
				var obj = e.data.obj;
				var sid = e.data.sid;
				var options = e.data.options || {};
				var $button = e.data.$button;
				var that = e.data.that;

				options.afterInit = function()
				{
					$button.removeClass(Class.calling);
				};

				options.afterCall = function()
				{
					if (obj.broadcast) {
						obj.broadcast(At.broadcast, obj);
					}
				};

				var service = obj.getService(sid, { trigger:Service.button });

				if (that.additionalOnClick(obj, service)) {
					return false;
				}

				if (options.before && (options.before(e, this) != true))    return false;

				if (service) {
					if (!(service.external || service.confirm)) $button.addClass(Class.calling);
					id.service.call(obj, service, options);
				}

				if (options.after) options.after(e, this);

				if (obj && obj.getTask && obj.getTask())
					obj.getTask().getPlace().removeClass(Class.changed);
			}});

			def({ name:'additionalOnClick', method:function additionalOnClick(obj, service)
			{
				return false;   // if return == true the onclick methods terminates.
			}});

		}});

		classify({ name:'CancelButton', base:id.gui.SingleButton, definition:function()
		{
			def({ name:'addButton', method:function addButton(obj, $place, button, options)
			{
				if (button.type === COS.cancel) {
					if (!$('#' + idOf(button.id)).exist()) {
						var $button = $(this.htmlOf(obj, button));

						this.setButton(obj, $button, button, options);
						this.insert($place, $button);
						button.exist = true;
					}
				}
			}});

			def({ name:'insert', method:function insert($place, $button)
			{
				$place.prepend($button);
			}});

			def({ name:'setButton', method:function setButton(obj, $button, button, options)
			{
				this.callSuper(obj, $button, button, options);

				if (button.trigger == COS.cancel) $button.bind('click' + ns, function()
				{
					obj.hide();
					return false;
				});
			}});

			def({ name:'additionalOnClick', method:function additionalOnClick(obj, service)
			{
				var terminate = !service.url;
				obj.hide();

				return terminate;
			}});
		}});

		classify({ name:'ButtonSelect', definition:function()
		{
			def({ name:'addButtons', method:function addButtons(obj, $place, buttons)
			{
				var $select;
				var select = {
					id:obj.id + Suffix.footer,
					label:'',
					type:COS.list,
					items:[],
					getTask:obj.getTask,
					getOwner:obj.getOwner,
					getPlace:obj.getPlace,
					broadcast:obj.broadcast
				};

				$.each(buttons, function(i, button)
				{
					if (button.exist) {
						return true;
						/* continue */
					}

					var item = {
						label:id.cos.labelOf(button),
						value:button.id,
						id:idOf(button.id),
						locked:button.locked,
						hidden:button.hidden
					};

					if (select.items.length == 0) select.items.push({ label:id.lang.get('select') });

					item.services = [];
					item.services.push(button);
					select.items.push(item);
				});

				$select = $(htmlOf(obj));
				$place.append($select);

				select.$place = $select;

				if (id.gui.select)
					id.gui.select.init(select, { button:true });

			}});

			function htmlOf(obj)
			{
				var cache = '';

				cache += '<div id="' + obj.id + prefs.footer + '" class="' + Class.isSelect + ' ' + Class.internal + '">';
				cache += '</div>';

				return cache;
			}
		}});

		classify({name:'Button', definition:function()
		{
			def({name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name:name });

				this.cancelButton = new id.gui.CancelButton();
				this.singleButton = new id.gui.SingleButton();
				this.buttonSelect = new id.gui.ButtonSelect();
			}});

			def({name:'init', method:function init(obj, $where, options)
			{
				this.reset($where, obj.type);
				return this.add(obj, $where, options);
			}});

			def({name:'update', method:function update(obj, $where, options)
			{
				var buttons = obj.hasButtons(/* updated = */ true);
				var that = this;

				if (buttons) {
					$.each(buttons, function(i, button)
					{
						var $button = $where.find('#' + idOf(button.id));

						if ($button.exist()) {
							if (button.type == COS.cancel) this.cancelButton.setButton(obj, $button, button, options);
							else that.singleButton.setButton(obj, $button, button, options);
						}
						else {
							if (button.type == COS.cancel) this.cancelButton.addButton(obj, dynamicPlaceOf($where), button, options);
							else that.singleButton.addButton(obj, dynamicPlaceOf($where), button, options);
						}
					});
				}
			}});

			def({ name:'reset', method:function reset($place, typeOfOwner)
			{
				dynamicPlaceOf($place).find('[' + Attr.owner + '=' + typeOfOwner + ']').remove();
			}});

			alias('destroy', 'reset');

			def({ name:'add', method:function add(obj, $place, options)
			{
				if (!obj.hasButtons()) return false;

				var buttons = obj.hasButtons();
				var $dialog = obj.getPlace();
				$place.find('.' + Class.isSelect).remove();

				var $dynamicButtons = dynamicPlaceOf($place);
				var dynamicButtons = getDynamicButtons(buttons, $dialog);
				var dynamicButtonsAdded = false;
				var that = this;

				if (buttons.length >= prefs.maxButtons) {
					that.buttonSelect.addButtons(obj, $dynamicButtons, dynamicButtons);
					dynamicButtonsAdded = true;
				}

				$.each(buttons, function(i, button)
				{
					if (button.type == COS.cancel) {
						that.cancelButton.addButton(obj, $place, button, options);
					}
					else if (isStaticButton(button, $dialog)) {
						that.singleButton.addButton(obj, $place, button, options);
					}
					else {
						if (dynamicButtonsAdded) {
							return true;
						}
						else {
							that.singleButton.addButton(obj, $dynamicButtons, button, options);
						}
					}
				});

				return true;
			}});

			function isStaticButton(button, $scope)
			{
				var buttonInDOM = '#' + button.id + ', #' + idOf(button.id);

				return $scope.find(buttonInDOM).exist();
			}

			function getDynamicButtons(buttons, $scope)
			{
				var foundButtons = [];
				$.each(buttons, function(i, button)
				{
					if (!isStaticButton(button, $scope)) {
						foundButtons.push(button);
					}
				});

				return foundButtons;
			}
		}});

		// ---------------------------------------------------------------------------------------------- //
		// Snippets
		// ---------------------------------------------------------------------------------------------- //

		function dynamicPlaceOf($place)
		{
			// Interims
			// Support old'n'new placement
			// of dynamic buttons ...

			var $dynamic = $place.find('.' + Class.dynamic);

			return $dynamic.exist() ? $dynamic : $place;
		}

		function idOf(buttonID)
		{
			return buttonID + prefs.suffix;
		}
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Renderer
	// ---------------------------------------------------------------------------------------------- //

	id.gui.button = new id.gui.Button(My.name);

	var ns = id.namespaceOf(My.name);
}()); 