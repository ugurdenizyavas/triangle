/*
	File: elements.js
	Purpose: Element index cache.

	$Author: udy $

*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { showPages: 10, isoTimeFormat: true };

	// Vocabulary

	var css = { isIndex: 'isIndex', info: 'info', indicator: 'indicator', kpis: 'kpi', left: 'left', right: 'right', first: 'first', table: 'dataTable', kpiOuterBox: 'kpiOuterBox', kpiBox: 'kpiBox', kpiInnerBox: 'kpiInnerBox', kpiTarget: 'kpiTarget', kpiTop: 'kpiTop', kpiBottom: 'kpiBottom', kpiValue1: 'kpiValue1', kpiValue2: 'kpiValue2', disabled: 'disabled', withService: 'withService', paging: 'paging', selected: 'selected', center: 'center', prev: 'previous', next: 'next', modal: 'modal', confirm: 'confirm', tableWrapper: 'tableWrapper', gridTable: 'gridTable', col1: 'col1', tabfooter: 'tabfooter', inner: 'inner', buttons: 'buttons', button: 'button', maxByValues: 'maxByValues', message: 'message', byClient: 'byClient', error: 'error', warning: 'warning', wait: 'wait', isRadio: 'isRadio', isCheck: 'isCheck', isSelect: 'isSelect', isCheckSelect: 'isCheckSelect', isSwapSelect: 'isSwapSelect', dynamic: 'dynamic', readonly: 'readonly', none: 'none', wrap: 'wrap', check: 'check', icon: 'icon', datepickerIcon: 'datepicker_icon', selectbox: 'selectbox', internal: 'internal', tooltipContent: 'tooltip-content', tooltip: 'tooltip', tooltipDone: 'tooltipDone', date: 'date', richEdit: 'richEdit', richEditDone: 'richEditDone', cleditorMain: 'cleditorMain', oldTimeFormat: 'oldTimeFormat', grid: 'grid', clearfix: 'clearfix', available: 'available', choosen: 'choosen', wmod1: 'wmod1', buttonbox: 'buttonbox', w1: 'w1', focused: 'focused', kpiUnit: 'kpiUnit', kpiInfo: 'kpiInfo', kpiAddOn: 'kpiAddOn', noLabel: 'noLabel', isImage: 'isImage', isLegend: 'isLegend', legendList: 'legendList', legendIcon: 'legendIcon', legendGroup: 'legendGroup', text: 'text', width: 'width', height: 'height', reload: 'reload', infoAsAddon: 'infoAsAddon' };
	var cos = { percent: 'percent', absolute: 'absolute', date: 'date', weekYear: 'weekYear', monthYear: 'monthYear', day: 'day', week: 'week', month: 'month', year: 'year', halfyear: 'halfyear', season: 'season', halfseason: 'halfseason', quarter: 'quarter', hourMinute: 'hourMinute', hour: 'hour', minute: 'minute', init: 'init', update: 'update', list: 'list', time: 'time', text: 'text', number: 'number', flag: 'flag', label:'label', tip: 'tip', index: 'index', paging: 'paging', password: 'password', plain: 'plain', html: 'html', upload: 'upload', image: 'image', yellow: 'yellow'  };
	var attr = { page: 'page', readonly: 'readonly', disabled: 'disabled', format: 'format', checked: 'checked', mark: 'mark', key: 'key', decimals: 'decimals', src: 'src' };
	var place = { yes: 'yes', no: 'no' };
	var event = { changed: 'changed' };
	var Data = { editorControls: 'data-editor-controls'};

	module({ ns:'id.gui', definition: function()
	{
		classify({ name:'Element', definition:function()
		{
			def({ name: 'initialize', method: function initialize(name)
			{
				id.object.register(this, { name:name });
			}});

			def({ name:'add', method: function add(obj, $place)
			{
				this.get(obj).add(obj, $place);
			}});

			def({ name:'htmlOf', method:function htmlOf(obj)
			{
				this.get(obj).htmlOf(obj);
			}});

			def({ name:'get', method:function get(obj)
			{
				return id.gui[obj.type] || id.error(me + 'Unknown or invalid element "' + obj.type + '".');
			}});

			def({ name:'setISOTimeFormat', method:function setISOTimeFormat(flag)
			{
				prefs.isoTimeFormat = flag;
			}});
		}});

		//-------------------------------------------------------------------------
		// Abstract Classes
		//-------------------------------------------------------------------------

		classify({ name:'AbstractElement', definition: function()
		{
			def({ name:'abstractError', method: function abstractError()
			{
			    id.error('Method not implemented');
			}});
		    def({ name: 'init'});
		    def({ name:'update', method: function update(obj)
		    {
		     	id.warning('Forced to do init instead of update');
				this.init(obj);
		    }});
			def({ name: 'delete'});
			def({ name: 'lock'});
			def({ name: 'hide'});

			def({ name:'setValue', method: function setValue(obj, options)
			{
				var options = options || {};

				if (!obj.$place.is('input, textarea')) {
					obj.$place = obj.$place.find('input, textarea');
				}

				if ((obj.value !== undefined && obj.value !== null) || (obj.value && obj.error) || (obj.value && obj.warning))
				{
					//if (obj.value.length == 0)
					//{
					// Note: jQuery Bug,
					// therefore '' do not replace the value. */

					//	obj.value = ' ';
					//}

					obj.$place.val(obj.value);
				}
				else if (obj.error || obj.warning) {
					/* do nothing */
				}
				else  {
					obj.$place.val("");
				}

				if (obj.hasService() && !options.withoutServiceCall)
				{
					// Fire service after leaving the input.
					// Todo: Check on change

					obj.$place.unbind('change'+ns).bind('change'+ns, {obj: obj, $input: obj.$place }, function(e)
					{
						var obj = e.data.obj;
						var service = obj.hasService();

						if (service.parameters) {
							id.service.call(obj.getOwner(), service, { $form: obj.getOwner().$place });
						} else {
							id.service.call(obj.getOwner(), service, { parameters: [{ id: obj.id, value: e.data.$input.val() }]});
						}
					});
				}
			}});
		}});

		classify({ name:'AbstractSimpleElement', base:id.gui.AbstractElement, definition:function()
		{
			def({ name:'init', method:function init(obj, options)
			{
				if (this.requirementsGiven(obj) == false) {
					return false;
				}

				this.setElement(obj);

			}});

			def({ name:'requirementsGiven', method:function requirementsGiven(obj)
			{
				return true;
			}});

			def({ name:'addBindings', method: function addBindings(obj)
			{
			    return true;
			}});

			def({ name: 'setElement'});
		}});

		classify({ name:'AbstractComplexElement', base: id.gui.AbstractElement, definition: function()
		{

		}});

		classify({ name: 'AbstractSelect', base: id.gui.AbstractComplexElement, definition: function()
		{

		}});
	}});

	id.gui.element = new id.gui.Element('element');
	var me = id.meOf(id.gui.element);
	var ns = id.namespaceOf(id.gui.element);

	// ---------------------------------------------------------------------------------------------- //
	// Elements
	// ---------------------------------------------------------------------------------------------- //

	module({ ns:'id.gui', definition:function()
	{
		classify({ name:'Index', base:id.gui.AbstractComplexElement, definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.serialize.register(css.isIndex, this.serialize);
			}});

			def({ name:'add', method: function add(obj, $place, options)
			{
				$place = $place || obj.$place;
				var options = options || {};

				if (obj.label) {
					options.label = true;
				}

				if ($place.hasClass(css.reload)) {
					options.reload = true;
				}

				if ($place.hasClass(css.infoAsAddon)) {
					options.infoAsAddon = true;
				}

				$place.data('object', obj);


				var $index = $place.find('.'+css.isIndex);

				if ($place.hasClass(css.noLabel) || $index.hasClass(css.noLabel)) {
					options.label = false;
				}

				if ($place.attr(attr.decimals)) options.decimals = $place.attr(attr.decimals);

				if ($index.exist())
				{
					// If there's a place holder, then take it,
					// otherwise create it.

					//$index.find('.'+css.kpiBox).remove();
					//$index.find('.'+css.noLabel).remove();
					$index.empty().html(this.htmlOf(obj, options));
				}
				else
				{
					$index = $(this.htmlOf(obj, options));
					$place.empty().html($index);

					var $mousePos = $index.find('.'+css.showTooltip);

					if (obj.$place.hasClass(css.showTooltip)) {
						$mousePos.attr('title', obj.title);
						id.setTooltip($mousePos);
					} else {
						$mousePos.removeAttr('title');
					}
				}

				if (obj.info)
				{
					// If there's a place holder, then take it,
					// otherwise the labeling handled by the parent function.

					var $info = $place.find('.'+css.info);

					if ($info.exist())
						$info.html(obj.info);
				}

				this.setService(obj, { $place: $place, reload: options.reload });

				var $tooltips = $place.find('[title]');

				if(jQuery().tipTip && $tooltips.length > 0) {
					id.setTooltip($tooltips);
				}

				return true;
			}});

			def({ name:'setService', method: function setService(obj, options)
			{
				if (!obj.services && !options.service)
					return false;

				var options = options || {};
				var $index = options.$place;

				$index.unbind('click'+ns).bind('click'+ns, {obj: options.owner ||obj, service: options.service ||obj.services[0], reload: options.reload, $scope: options.$scope || obj.getScope() }, function(e)
				{
					if (options.before) options.before(obj, options);
					id.service.call(e.data.obj, e.data.service, { $form: e.data.$scope, reload: e.data.reload });
					if (options.after) options.after(obj, options);
				});

				$index.addClass(css.withService);

				return true;
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};
				var cache = '';
				var kpiInfoList = '';
				var width = obj.value;

				if (obj.max < 0) { obj.max = obj.max * -1; }
				if (obj.top < 0) { obj.top = obj.top * -1; }
				if (obj.bottom < 0) { obj.bottom = obj.bottom * -1; }
				if (obj.value < 0) { width = obj.value * -1; }

				obj.max = maxOf(obj);

				if (obj.info)
				{
					if (id.isArray(obj.info))
						for (var i = 0; i < obj.info.length; i++)
							kpiInfoList += infoOf(obj.info[i].label, i);

					else kpiInfoList = infoOf(obj.info);
				}

				cache += '<div class="'+css.kpiOuterBox+'">';
				cache += (options.label ? '<label>'+obj.label+'</label>' : '');
				cache += '<div class="'+css.kpiBox+(obj.value == undefined || obj.value == null ? ' '+css.disabled : '')+'">';

				if (obj.threshold)
				{
					if (id.isArray(obj.threshold))
						for (var i = 0; i < obj.threshold.length; i++)
							if (obj.threshold[i] != null) cache += thresholdOf(obj.threshold[i], obj.max);

							else cache += thresholdOf(obj.threshold, obj.max);
				}

				if (!id.isArray(obj.value))
				{
					cache += '<div class="'+css.kpiValue1+'">'+(obj.value == undefined ? '' : valueOf(obj.value, obj.format, options))+'</div>';
					cache += '<div class="'+css.kpiInnerBox +' '+(obj.status ? obj.status : '')+'" style="width:'+(width/obj.max*100)+'%;"'+(obj.info && !options.infoAsAddon ? 'title="'+ (id.isString(obj.info) ? obj.info : id.formatNumber(obj.info)) +'"' : '')+'>';
					cache += '<div class="'+css.kpiValue2+'">'+valueOf(obj.value, obj.format, options)+'</div>';
					cache += '</div>';
				}
				else
				{
					for (var i = 0; i < obj.value.length; i++)
						if (obj.value[i] != null) cache += '<div class="'+css.kpiInnerBox+[i]+' '+(obj.value[i].status ? obj.value[i].status : '')+'" title="'+id.formatNumber(obj.value[i].value)+'" style="width:'+(obj.value[i].value/obj.max*100)+'%;"></div>';
				}

				cache += (obj.top ? '<div class="'+css.kpiTop+'" title="'+valueOf(obj.top, obj.format, options)+'" style="left:'+(obj.top/obj.max*100.)+'%;"></div>' : '');
				cache += (obj.bottom ? '<div class="'+css.kpiBottom+'" title="'+valueOf(obj.bottom, obj.format, options)+'" style="left:'+(obj.bottom/obj.max*100.)+'%;"></div>' : '');
				cache += '</div>';
				cache += '</div>';

				if (options.infoAsAddon)
				{
					cache += '<div class="'+css.kpiAddOn+'">';
					cache += (obj.unit ? '<div class="'+css.kpiUnit+'">'+obj.unit+'</div>' : '');
					cache += (obj.info ? '<div class="'+css.kpiInfo+'"><ul>'+kpiInfoList+'</ul></div>' : '');
					cache += '</div>';
				}

				return cache;

				function maxOf(obj)
				{
					var max = Math.max(obj.max || 0, obj.top || 0, obj.bottom || 0, sumValue(obj.value) || 0, id.isValue(obj.threshold) ? obj.threshold : 0);

					// There is maybe more
					// than one threshold

					if (id.isArray(obj.threshold))
					{
						for (var i = 0; i < obj.threshold.length; i++)
							if (max < obj.threshold[i])
								max = obj.threshold[i];
					}

					return max;
				}

				function valueOf(item, format, options) { return format == cos.percent ? id.formatPercent(item, { decimals: options.decimals, optimized: true }) : id.formatNumber(item, { decimals: options.decimals, optimized: true }); }
				function thresholdOf(threshold, max) { return '<div class="'+css.kpiTarget+'" title="'+id.formatNumber(threshold)+'" style="left:'+(threshold/max*100)+'%;"></div>'; }
				function infoOf(label, count) { return '<li class="infolabel'+(count ? count : '' )+'">'+label+'</li>'; }
				function sumValue(value)
				{
					if (!id.isArray(value)) return value;
					else
						var sum = 0;
					for (var i = 0; i < value.length; i++)
					{
						sum = sum + value[i].value;
					}
					return sum;
				}
			}});

			def({ name:'svgOf', method: function svgOf(obj, options)
			{
				var cache = '';
				var triTop = { 'p1': { 'x': 1, 'y': 0 }, 'p2': { 'x': 5, 'y': 7 }, 'p3': { 'x': 9, 'y': 0 } };
				var triBottom = { 'p1': { 'x': 1, 'y': 34 }, 'p2': { 'x': 5, 'y': 27 }, 'p3': { 'x': 9, 'y': 34 } };
				var targetLine = { 'p1': { 'x': 5, 'y': 1 }, 'p2': { 'x': 5, 'y': 34 } };
				var status = { 'red': '#cf2215', 'yellow': '#fecb00', 'green': '#05ab41' , 'blue': '#0073cf' };

				var width = obj.value;

				if (obj.max < 0) { obj.max = obj.max * -1; }
				if (obj.top < 0) { obj.top = obj.top * -1; }
				if (obj.bottom < 0) { obj.bottom = obj.bottom * -1; }
				if (obj.value < 0) { width = obj.value * -1; }

				obj.max = maxOf(obj);

				cache += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="110px" height="35px">';

				var mtpTop = obj.top !== undefined ? obj.top/obj.max*100 : 0;
				var mtpBottom = obj.bottom !== undefined ? obj.bottom/obj.max*100 : 0;
				if (obj.value) {
					cache += '<defs>';
					cache += '<clipPath id="cp1">'; // this mask will cut-off and split the value text in two white/black sections
					cache += '<rect x="4" y="7" width="'+(width/obj.max*100.)+'" height="20" fill="none" />';
					cache += '</clipPath>';
					cache += '</defs>';
				}
				cache += (obj.top !== null && obj.top !== undefined ? '<polygon points="'+(triTop.p1.x + mtpTop)+','+triTop.p1.y+' '+(triTop.p2.x + mtpTop)+','+triTop.p2.y+' '+(triTop.p3.x + mtpTop)+','+triTop.p3.y+'" fill="#000000"/>' : '');
				cache += '<rect x="5" y="7" width="100" height="20" fill="#ffffff" style="'+ (obj.value === undefined || obj.value === null ? 'stroke:#9A9A9A; stroke-dasharray:3 3;' : 'stroke:#DDDDDD; ')+'stroke-width:1;  shape-rendering:crispEdges;" />';

				if (obj.threshold)
				{
					if (id.isArray(obj.threshold))
						for (var i = 0; i < obj.threshold.length; i++)
							if (obj.threshold[i] != null) cache += thresholdOf(obj.threshold[i], obj.max);

							else cache += thresholdOf(obj.threshold, obj.max);
				}

				if (obj.value) {
					cache += '<text x="10" y="21" width="10" fill="#000000" style="font-family:&apos;Lucida Grande&apos;, &apos;Lucida Sans Unicode&apos;, Verdana, Arial, Helvetica, sans-serif; font-size:10px; font-size:10px;">'+valueOf(obj.value, obj.format, options)+'</text>';
					cache += '<rect x="4" y="7" width="'+(width/obj.max*100.)+'" height="20" fill="'+(obj.status ? status[obj.status] : '')+'" />';
					cache += '<text x="10" y="21" fill="'+(obj.status ==  cos.yellow ? '#000000' : '#ffffff')+'" clip-path="url(#cp1)" style="font-family:&apos;Lucida Grande&apos;, &apos;Lucida Sans Unicode&apos;, Verdana, Arial, Helvetica, sans-serif; font-size:10px;">'+valueOf(obj.value, obj.format, options)+'</text>';
				}

				cache += (obj.bottom !== null && obj.bottom !== undefined ? '<polygon points="'+(triBottom.p1.x + mtpBottom)+','+triBottom.p1.y+' '+(triBottom.p2.x + mtpBottom)+','+triBottom.p2.y+' '+(triBottom.p3.x + mtpBottom)+','+triBottom.p3.y+'" fill="#000000" />' : '');
				cache += '</svg>';

				return cache;

				function maxOf(obj)
				{
					var max = Math.max(obj.max || 0, obj.top || 0, obj.bottom || 0, obj.value || 0, id.isValue(obj.threshold) ? obj.threshold : 0);

					// There is maybe more
					// than one threshold

					if (id.isArray(obj.threshold))
					{
						for (var i = 0; i < obj.threshold.length; i++)
							if (max < obj.threshold[i])
								max = obj.threshold[i];
					}

					return max;
				}

				function valueOf(item, format, options) { return format == cos.percent ? id.formatPercent(item, { decimals: options.decimals, optimized: true }) : id.formatNumber(item, { decimals: options.decimals, optimized: true }); }
				//function thresholdOf(threshold, max) { return '<div class="'+css.kpiTarget+'" style="left:'+(threshold/max*100.)+'%;"></div>'; }

				function thresholdOf(threshold, max) {
					var mtpThreshold = threshold !== undefined ? threshold/max*100 : 0;
					return '<line x1="'+(targetLine.p1.x + mtpThreshold)+'" y1="'+(targetLine.p1.y)+'" x2="'+(targetLine.p2.x + mtpThreshold)+'" y2="'+(targetLine.p2.y)+'" style="stroke:#000000; stroke-width:1; shape-rendering:crispEdges;" />';
				}
			}});

			def({ name:'serialize', method: function serialize(map, field, $element)
			{
				var index, value;
				var options = {};

				if ($element.data('object')) {
					options.decimals =  $element.attr(attr.decimals) || 1;
					index = $element.data('object');
				} else {
					return false;
				}

				value = this.svgOf(index, options);

				map[field] = value;

				return true;
			}});

			alias('init', 'add');
		}});

		classify({ name:'Indicator', base: id.gui.AbstractComplexElement,  definition: function()
		{

		    def({ name:'add', method: function add(obj, $place)
			{
				$place = $place || obj.$place;

				$place.append(this.htmlOf(obj));

				var $status = $place.find('.'+css.indicator).children('div:first');

				if(jQuery().tipTip && $status.attr('title')) {
					id.setTooltip($status);
				}

				if (obj.services)
				{
					$status.bind('click', obj, function(e) { e.data.getOwner().call(e.data.services[0]) });
					$status.addClass(css.withService);
				}

				return true;
			}});

			alias('init', 'add');

			def({ name:'htmlOf', method: function htmlOf(obj)
			{
				var cache = '';

				cache += '<div class="'+css.indicator+'">';
				cache += '<p class="'+ css.text +'">'+obj.label+'</p>';
				if (obj.time) cache += '<p class="'+ css.info +'">'+obj.time+'</p>';
				cache += '<div class="'+obj.status+'" '+ (obj.info ? 'title="'+obj.info+'"' : '') +'></div>';
				cache += '</div>';

				return cache;
			}});
		}});

		classify({ name:'Paging', base: id.gui.AbstractComplexElement, definition: function()
		{
		    def({ name:'add', method: function add(obj, options)
			{
				var $place = obj.$paging;

				$place.append(this.htmlOf(obj, options));

				return true;
			}});

			alias('init', 'add');

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};

				var sign = { prev: '<', pause: '...', next: '>' };
				var number = 1, begin = 3, end = 3, prev = 1, next = 1 /* numbers in line */;
				var min = prev+number+next;

				var page = obj.page;
				if ( id.isString(obj.page) ){
					id.warning( "type-error in COS: 'page' is type:string, should be type:integer. can continue..");
					page = parseInt(obj.page, 10);
				}
				var max = obj.pageCount;
				if ( id.isString(obj.pageCount) ){
					id.warning( "type-error in COS: 'pageCount' is type:string, should be type:integer. can continue..");
					max = parseInt(obj.pageCount, 10);
				}

				var showPages = options.showPages || prefs.showPages;
				var cache = '';

				cache += '<td class="'+css.center+'"><div class="'+css.paging+'">';
				cache += (page > 1 ? '<a class="'+css.prev+'" '+attr.page+'="'+(page-1)+'">' : '')+'<span>'+sign.prev+' '+id.lang.get('prev')+'</span>'+(page > 1 ? '</a>' : '')+' |';

				if (max && max <= showPages)
				{
					// Show all numbers
					// at once, that's it.

					cache += entry(1, max, page);
				}
				else
				{
					// Show intervals
					// of numbers.

					// First, always.

					cache += entry(1, begin, page);

					// Left block

					if (page < begin+min) cache += entry(1+begin, page+next, page);
					cache += pause();

					// Middle or right block

					if (page >= begin+min && (max ? page <= max-(min+end) : true))
					{
						cache += entry(page-prev, page+next, page);
						cache += pause();
					}

					// Right block,
					// if there's a right block

					if (max)
					{
						if (page > max-(min+end))
							cache += entry(page-prev, max-end, page);

						cache += entry(max-(end-1), max, page);
					}
				}

				cache += '| '+(!max || page < max ? '<a class="'+css.next+'" '+attr.page+'="'+(page+1)+'">' : '')+'<span>'+id.lang.get('next')+' '+sign.next+'</span>'+(!max || page < max ? '</a>' : '');
				cache += '</div></td>';

				return cache;

				// Functions

				function entry(begin, end, page)
				{
					var cache = '';

					for (var i = begin; i <= end; i++)
						cache += '<a'+(i == page ? ' class="'+css.selected+'"' : '')+'>'+'<span>'+i+'</span></a>';

					return cache;
				}

				function pause()
				{
					return ' '+sign.pause+' ';
				}
			}});
		}});

		classify({ name:'Confirm', definition: function()
		{
			def({ name:'add', method: function add(options)
			{
				var title = 'confirm';

				var dialog = new Boxy(this.htmlOf(options.obj, { text: options.service.confirm }), { title: id.lang.get(title), windowMode: title, closeText: '', draggable: true, modal: false, unloadOnHide: true, closeable: false, cache: true,
					behaviours: function(c)
					{
						c.find('#'+place.yes).click( function() { dialog.hide(); if (options.afterConfirm) options.afterConfirm(true, options); });
						c.find('#'+place.no).click( function()  { dialog.hide(); if (options.afterConfirm) options.afterConfirm(false, options); });
					}
				});
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var cache = '';

				cache += '<div class="'+css.modal+' '+css.confirm+'"><form><div class="'+css.tableWrapper+'">';
				cache += '<table class="'+css.gridTable+'"><tr><td class="'+css.col1+'">';
				cache += '<p>'+options.text+'</p>';
				cache += '</td></tr></table></div>';
				cache += '<div class="'+css.tabfooter+'"><div class="'+css.inner+'"><div class="'+css.buttons+'">';
				cache += '<a class="'+css.button+'" id="'+place.no+'"><span>'+ id.lang.get('no') +'</span></a><a class="'+css.button+'" id="'+place.yes+'"><span>'+ id.lang.get('yes') +'</span></a>';
				cache += '</div></div></div></form></div>';

				return cache;
			}});
		}});

		classify({ name:'Time', base: id.gui.AbstractComplexElement, definition: function()
		{
		    def({ name:'init', method: function init(obj, options)
			{
				if (obj.$place.data('obj') && obj.getTask().mode == cos.update) {
					var storedObj = obj.$place.data('obj');
					storedObj.error = undefined;
					storedObj.warning = undefined;
					storedObj.hidden = undefined;
					storedObj.locked = undefined;

					if (obj.value === null){
						obj.value = "";
						obj.$place.val('');
					} else if (obj.value === undefined)
						obj.value = obj.$place.val();

					obj = $.extend(true, storedObj, obj);
				} else {
					obj.$place.data('obj', obj);
				}

				var options = options || {};
				var format = obj.format ? id.format.toNewTimeFormat(obj.format) : cos.day;
				var $elm;
				var activeImplementation;

				options.clientValidation = (options.clientValidation == false) ? false : true;

				if (prefs.isoTimeFormat) {
					if (obj.value) {
						obj.value = id.format.toTimeConversion(obj.value, format);
					} else {
						if (obj.$place.val() != '' && id.format.checkTime(obj.$place, { format: format })) {
							obj.value = id.format.fromTimeConversion(obj.$place.val(), format);
						} else {
							obj.value = obj.$place.val();
						}
					}
				} else {
					//if (obj.$place.val() != '' && id.format.checkTime(obj.$place, { format: format })) obj.value = obj.$place.val();
					if (!obj.value && obj.value !== null) {
						obj.value = obj.$place.val();
					}
					obj.oldTimeFormat = true;
				}

				this.hide(obj);
				this.locked(obj);

				if (id.isMember([cos.day, cos.month, cos.week, cos.year, cos.halfyear, cos.season, cos.halfseason, cos.quarter], format)) {
					activeImplementation = new id.gui.DatePicker();
				} else {
					activeImplementation = new id.gui.TimePicker();
				}

				if (!obj.$place.is('input')) {
					$elm = $(this.htmlOf(obj, options));
					obj.$place = $elm.find('input');
					obj.$place.data('obj', obj);
					$elm.find('div.wrap').append(activeImplementation.setPicker(obj, format, options));
				} else {
					activeImplementation.setPicker(obj, format, options);
				}

				this.setValue(obj, {withoutServiceCall: true});

				obj.$place.unbind('focus'+ns).bind('focus'+ns, obj, function(e) {
					id.key.register(e.data, null, { keyup: [ 'tab' ] });
				});

				return $elm;
			}});

			def({ name:'locked', method: function locked(obj)
			{
				if (obj.locked) {
					obj.$place.prop(attr.readonly, true).addClass(css.readonly).prev(/*label*/).addClass(css.readonly);
				} else {
					obj.$place.removeProp(attr.readonly).removeClass(css.readonly).prev(/*label*/).removeClass(css.readonly);
				}
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.parent().parent().children().addClass(css.none);
				} else {
					obj.$place.parent().parent().children().removeClass(css.none);
				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};
				var cache = '';

				if (options.dynamic) cache += id.gui.label.htmlOf(obj);
				cache += '<span class="datepicker_icon"></span>';
				cache += '<div class="wrap icon">';
				cache += '<input '+(options.skipID ? '' : 'id="'+ obj.id +'"')+' />';
				cache += '</div>';

				return cache;
			}});
		}});

		classify({ name:'TimePicker', base:id.gui.Time, definition:function()
		{
			def({ name:'setPicker', method:function setPicker(obj, format, options)   // TODO unused parameter format??
			{
				var $id = obj.$place;
				var lang = id.lang.getLang();
				var $label = $id.parent(/*div*/).parent(/*td*/).children('label');
				var now = new Date();
				var nowTime = now.getHours() + ':' + now.getMinutes();

				id.gui.label.init(obj);

				var settings = {
					'hourMinute':{ time:nowTime, format:'hr:min', view:'hourMinute', validation:{ en:"h:m", de:"s:m" }, label:{ en:"Time", de:"Zeit" } },
					'hour':{ time:nowTime, format:'hr', view:'hour', validation:{ en:"h", de:"m" }, label:{ en:"Hours", de:"Stunden" } },
					'minute':{ time:nowTime, format:'min', view:'minute', validation:{ en:"h:m", de:"s:m" }, label:{ en:"Minutes", de:"Minuten" } }
				};

				// Format check and
				// integration of Time Picker

				var formats = obj.formats ? obj.formats : ( obj.format ? [ obj.format ] : [ cos.hourMinute ] );
				//var format = formats[ 0 ]; // TODO**: Ensure that this format is compatible to the value's content.

				var format = obj.format ? obj.format : cos.hourMinute;

				if (obj.label) {
					$label.append('<span>[' + settings[format].validation[lang] + ']</span>');
				}

				if (!id.isMember([cos.hourMinute, cos.hour, cos.minute], format)) {
					id.warning('Forcing format "' + cos.hourMinute + '", was "' + format + '".');
					format = cos.hourMinute;
				}

				if (!$id.attr(attr.format) /* == Picker not initialised yet */ || $id.attr(attr.format) != format) {
					var $tp = $id.parent(/*div*/).prev(/*span*/);

					$id.attr(attr.format, format);

					$tp.TimePicker({
						format:settings[format].format,
						date:$id.val(),
						current:$id.val(),

						view:settings[format].view,

						onBeforeShow:function()
						{
							if (($id.val() == '') || (id.format.checkTime($id, { format:format }) == false)) {
								$tp.TimePickerSetTime(settings[format].time, true);
							}
							else {
								var value = formats ? id.format.toDate($id.val(), { format:format }) : $id.val();
								$tp.TimePickerSetTime(value, true);
							}
						},

						onChange:function(formated)
						{
							$id.attr(attr.format, format);
							$id.trigger(event.changed);

							if (!$id.hasClass(css.readonly)) {
								$label.find('span').remove();
								$label.append('<span>[' + settings[format].validation[lang] + ']</span>');
								$id.val(formated);
							}
						},

						onHide:function()
						{
							$id.trigger('change' + ns);
						}
					});

					delete now;

					$id.unbind('change' + ns).bind('change' + ns, obj, function(e)
					{
						var obj = e.data;
						var format = $id.attr(attr.format);

						obj.$place.data('obj').value = id.format.fromTimeConversion($id.val(), format);

						if (options.clientValidation) {
							if (id.format.checkTime(this, { format:format }) == false) {
								obj.error = id.lang.get('invalidFormat');
								id.gui.message.add(obj, { byClient:true });
								e.stopPropagation();
							}
							else {
								id.gui.message.clear(obj);
							}
						}

						obj.change();
					});

					$id.unbind('focus' + ns).bind('focus' + ns, obj, function(e)
					{
						id.key.register(obj, null, { keyup:[ 'tab' ] });
					});

					return $id;
				}
			}});
		}});

		classify({ name:'DatePicker', base:id.gui.Time, definition: function()
		{
		    def({ name:'setPicker', method: function setPicker(obj, format, options)
			{
				var $id = obj.$place;
				var $label = $id.parent(/*div*/).parent(/*td*/).children('label');
				var lang = id.lang.getLang();

				var formats = obj.formats;
				//var format = formats[ 0 ]; // TODO**: Ensure that this format is compatible to the value's content.

				if(obj.oldTimeFormat) {
					$id.addClass(css.oldTimeFormat);
				}

				//this.setValue(obj);


				if (!id.isMember([cos.day, cos.week, cos.month, cos.year, cos.halfyear, cos.season, cos.halfseason, cos.quarter], format))
				{
					id.warning('Forcing format "'+cos.day+'", was "'+format+'".');
					format = cos.day;
				}

				if (!$id.attr(attr.format) /* == Picker not initialised yet */ || $id.attr(attr.format) != format)
				{
					var now = new Date();
					var nowDate = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear();
					var nowWeekYear = id.lang.get('cw')+' '+  now.getWeekNumber() + ' ' + now.getFullYear();
					var nowMonthYear = (now.getMonth() + 1) + '.' + now.getFullYear();
					var nowYear = now.getFullYear()+'';
					var nowHalfyear = (now.getMonth() >= 0) && (now.getMonth() < 7) ? 'H1' : 'H2' + ' ' + now.getFullYear();
					var nowSeason = (now.getMonth() >= 3) && (now.getMonth() < 10) ? 'SS' : 'SW' + ' ' + now.getFullYear();
					var nowHalfSeason = (now.getMonth() >= 0) && (now.getMonth() < 6) ? (now.getMonth() >= 0) && (now.getMonth() < 3) ? 'SS '+nowYear+'/H1' : 'SS '+nowYear+'/H2' : (now.getMonth() >= 6) && (now.getMonth() < 11) ? 'SW '+nowYear+'/H1' :'SS '+nowYear+'/H2';
					var nowQuarter = (now.getMonth() >= 0) && (now.getMonth() < 6) ? (now.getMonth() >= 0) && (now.getMonth() < 3) ? 'Q1' : 'Q2' : (now.getMonth() >= 6) && (now.getMonth() < 11) ? 'Q3' : 'Q4' + ' ' + now.getFullYear();

					var settings = {
						'day': { id: 'day', time: nowDate, format: 'e.n.Y'  /* [d]d.[m]m.yyyy */, view: 'days', validation: { en: "d.m.yy", de: "t.m.jj" }, label: { en: "Date", de: "Datum" } },
						'week': { id: 'week', time: nowWeekYear, format: 'c w Y', view: 'days', validation: { en: "w yy", de: "w jj" }, label: { en: "Week", de: "Woche" } },

						'month': { id: 'month', time: nowMonthYear, format: 'n.Y' /* [m]m.yyyy */, view: 'months', validation: { en: "m.yy", de: "m.jj" }, label: { en: "Month", de: "Monat" } },
						'year': { id: 'year', time: nowYear, format: 'Y' /* yyyy */, view: 'years', validation: { en: "yy", de: "jj" }, label: { en: "Year", de: "Jahr" } },

						'halfyear': { id: 'halfyear', time: nowHalfyear, format: 'h Y', view: 'halfyears', validation: { en: "h yy", de: "h jj" }, label: { en: "Halfyear", de: "Halbjahr" } },

						'season': { id: 'season', time: nowSeason, format: 't Y', view: 'seasons', validation: { en: "s yy", de: "ss jj" }, label: { en: "Season", de: "Saison" } },
						'halfseason': { id: 'halfseason', time: nowHalfSeason, format: 't Y/h', view: 'halfseasons', validation: { en: "s yy/h", de: "s jj/h" }, label: { en: "Halfseason", de: "Halbsaison" } },

						'quarter': { id: 'quarter', time: nowQuarter, format: 'q Y', view: 'quarters', validation: { en: "q yy", de: "q jj" }, label: { en: "Quarter", de: "Quartal" } }
					};

					id.gui.label.init(obj);

					if (obj.label) {
						$label.append('<span>['+ settings[format].validation[lang] +']</span>');
					}

					var $dp = $id.parent(/*div*/).prev(/*span*/);

					$id.attr(attr.format, format);

					if(formats) {
						var unitFormats = [];
						$.each(formats, function(index, format) {
							unitFormats.push( settings[id.format.toNewTimeFormat(format)] );
						});
					}

					$dp.DatePicker(
						{
							format: settings[format].format,
							formatId: settings[format].id,
							date: $id.val(),
							current: $id.val(),
							starts: 0 /* Monday */,
							position: 'right',
							eventName: 'click',
							settings: settings,

							lang: lang,

							formats: unitFormats,

							view: settings[format].view,

							locale: {
								days: id.lang.getDays('large'),
								daysShort: id.lang.getDays('small'),
								daysMin: id.lang.getDays('xsmall'),
								months: id.lang.getMonths('large'),
								monthsShort: id.lang.getMonths('medium'),
								weekMin: id.lang.get('cw'),

								halfyearsShort: ["H1", "H2"],
								seasonsShort: ["SS", "SW"],
								halfseasonsShort: ["SS H1", "SS H2", "SW H1", "SW H2"],
								quartersShort: ["Q1", "Q2", "Q3", "Q4"]
							},

							onBeforeShow: function()
							{
								// Multiple format handling ...

								var format = $id.attr(attr.format);

								// Set default in the date picker
								// by the value of the related input field.

								if (($id.val() == '') || (id.format.checkTime($id, { format: format }) == false)) {
									$dp.DatePickerSetDate(settings[format].time, true);
								}
								else {
									var value = $id.val();
									$dp.DatePickerSetDate(value, true);
								}

							},

							onChange: function(formated, dates, format)
							{
								// Format change ...
								$id.attr(attr.format, format);
								$id.trigger(event.changed);

								// Copy date pick
								// to related input field.

								if (!$id.hasClass(css.readonly)) {
									//$id.attr(attr.format, format);
									$label.find('span').remove();
									$label.append('<span>['+ settings[format].validation[lang] +']</span>');
									$id.val(formated);
								}
							},

							onHide: function()
							{
								$id.trigger('change'+ns);
							}
						});

					delete now;

					$id.unbind('change'+ns).bind('change'+ns, obj, function(e)
					{
						var obj = e.data;
						var format = $id.attr(attr.format);



						if (options.clientValidation) {
							if (id.format.checkTime(this, { format: format }) == false)
							{
								//obj.$place.data('obj').value = nowHalfSeason;
								obj.error = id.lang.get('invalidFormat');
								id.gui.message.add(obj, { byClient: true });
								obj.$place.data('obj').value = null;  // so that a wrong input is not overwritten by the old value.
								e.stopPropagation();
							} else {
								if(obj.oldTimeFormat) {
									obj.$place.data('obj').value = $id.val();
								} else {
									obj.$place.data('obj').value = id.format.fromTimeConversion($id.val(), format);
								}
								id.gui.message.clear(obj);
							}
						}

						//if (obj.hasService())
						obj.change();
					});

					$id.unbind('focus'+ns).bind('focus'+ns, obj, function(e) {
						id.key.register(obj, null, { keyup: [ 'tab' ] });
					});

					return $id;
				}


			}});
		}});

		classify({ name:'Text', base: id.gui.AbstractComplexElement, definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name: name });
			}});

			def({ name:'update', method: function update(obj)
			{
			    this.hide(obj);
				this.lock(obj);

				// TODO other updates
			}});

			def({ name:'init', method: function init(obj, options)
			{
				var options = options || {};
				var format;

				if (obj.format) {
					if (id.isObject(obj.format)) {
						format = obj.format.value || cos.plain;
					} else {
						format = obj.format || cos.plain;
					}
				} else {
					format = cos.plain;
				}

				this.hide(obj);
				this.lock(obj);

				return type(format).text(obj, options);
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};
				var cache = '';

				if (options.dynamic) cache += id.gui.label.htmlOf(obj);

				cache += '<div class="wrap">';
				cache += '<input '+(options.skipID ? '' : 'id="'+ obj.id +'"')+' '+(obj.type == cos.password ? ' type="password"' : '' )+' />';
				cache += '</div>';

				return cache;
			}});

			def({ name:'serialize', method: function serialize( map, field, $element, wanted)
			{
				//FUTURE: ggf. in precall/'preflight' integrieren
				var htmlString = $element.val();

				if ( wanted(field) && id.hasTextContent( htmlString ) )
				{
					try
					{
						//TODO: DEPRECATED, RichText-Cleaning delegated to Backend-Service
						// save the genuine user-input as a default
						// in case of error, transmit it to the BE-Service
						map[field] = htmlString;
					}
					catch( err )
					{  // some JS-Error occured
						id.error( me+"id.gui.text.serialize msg: "+String(err));
					}
				}
				else map[field] = "";

				return map;
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.parent().parent().children().addClass(css.none);
				} else {
					obj.$place.parent().parent().children().removeClass(css.none);
				}
			}});

			def({ name:'lock', method: function lock(obj)
			{
				if (obj.locked) {
					obj.$place.prop(attr.readonly, true).addClass(css.readonly).prev(/*label*/).addClass(css.readonly);
				} else {
					obj.$place.removeProp(attr.readonly).removeClass(css.readonly).prev(/*label*/).removeClass(css.readonly);
				}
			}});

			function type(format) {
				switch (format)
				{
					case cos.plain : return new id.gui.Plaintext(); break;
					case cos.html : return new id.gui.Richtext(); break;
				}
			}
		}});

		classify({ name:'Plaintext', base: id.gui.Text, definition: function()
		{
			def({ name:'text', method: function text(obj, options)
			{
				var options = options || {};
				var $elm;

				if (!obj.$place.is('input, textarea')) {
					$elm = $(this.htmlOf(obj, options));
					obj.$place = $elm.find('input');
				}

				obj.$place.unbind('focus'+ns).bind('focus'+ns, obj, function(e) {
					id.key.register(e.data, null, { keyup: [ 'tab' ] });
				});

				obj.$place.unbind('change'+ns).bind('change'+ns, obj, function(e) {
					if (obj.$place.data('obj')) obj.$place.data('obj').value = obj.$place.val();
				});

				if (obj.label) id.gui.label.init(obj);

				this.setValue(obj);

				if (obj.$scope && (obj.$scope.find('#'+obj.id).is('textarea') && obj.$scope.find('#'+obj.id).hasClass('scrollToBottom'))) {
					setTimeout( function() { obj.$scope.find('#'+obj.id).animate({
						scrollTop: 10000000 }, 1);
					}, 1);
				}

				if (obj.hasService(cos.paging)) {
					id.gui.table.addPaging(obj, true);
				}

				return $elm;
			}});
		}});

		classify({ name:'Richtext', base: id.gui.Text, definition: function()
		{
			def({ name:'text', method: function text(obj, options)
			{
				var editor, controls;
				var $place = obj.$place;
				var $parent = obj.$place.parent();
				var areaHeight = $place.css('height').replace(/px/g, '') * 1;

				id.serialize.register(css.richEdit, this.serialize);

				if (obj.value && obj.value.length != 0) {
					obj.value = obj.value.nl2br();
					obj.value = obj.value.replace(/(<br[ \/]{0,2}>)*$/, '');
				}

				if (obj.label) id.gui.label.init(obj);

				this.setValue(obj);

				$parent.find('.'+css.richEdit).remove();

				if(obj.locked) {

					$place.addClass(css.none);
					$parent.find('.'+css.cleditorMain).addClass(css.none);

					if (obj.value && obj.value.length == 0) {
						obj.value = ' ';
					}

					$parent.append('<div class="'+ css.richEdit+'">'+ obj.value +'</div>');
					$parent.addClass(css.readonly);

				} else {

					$place.addClass(css.none);
					$parent.removeClass(css.readonly);
					$parent.find('.'+css.cleditorMain).removeClass(css.none);

					if ($place.data('cleditor')) {
						editor = $place.data('cleditor');
					}

					controls = getEditorControls($place.attr(Data.editorControls));

					// Create a RichText Instance
					if (!editor) {
						var editor = $place.cleditor({
							width: '100%', // width not including margins, borders or padding
							height: '100%', // height not including margins, borders or padding
							// controls to add to the toolbar
							controls: "bold italic underline strikethrough | style color | bullets numbering" + controls,
							// styles in the style popup
							styles: [["Paragraph", "<p>"],
								["Header 1", "<h1>"], ["Header 2", "<h2>"], ["Header 3", "<h3>"],
								["Pre","<pre>"]],
							// colors in the color popup
							//colors: 'cc0000 ff9900 009900 0066cc 000000'
							colors: 'c00 f90 090 36f 000'
						})[0];

						editor.change(function() {
							obj.change();
						});
					} else {
						editor.updateFrame();
					}

					if (obj.selected) {
						if (obj.value == '' || obj.value.length == 0) { obj.value = '<span></span>'; }
						var value = obj.value;
						editor.focus();
						editor.doc.body.innerHTML = '';
						setTimeout( function () { editor.execCommand('insertHTML', value) }, 1);
					}
				}
			}});

			function getEditorControls(txt)
			{
				if (!txt) return '';

				var controls = '';
				var tool = { hyperlink:'hyperlink' };

				tools = txt.split(' ');

				$.each(tools, function(index, value)
				{
					switch (value) {
						case tool.hyperlink:
							controls += ' | link unlink';
							break;
					}
				});

				return controls;
			}
		}});

		classify({ name:'Number', base: id.gui.AbstractSimpleElement, definition: function()
		{
		    def({ name:'init', method: function init(obj, options)
			{
				this.requirementsGiven(obj);
				var $elm = this.setElement(obj,options);
				this.addBindings(obj);

				return $elm;
			}});

			def({ name:'requirementsGiven', method: function requirementsGiven(obj)
			{
				if (obj.$place.data('obj') && obj.getTask().mode == cos.update) {
					var storedObj = obj.$place.data('obj');
					obj = $.extend(true, storedObj, obj);
				} else {
					obj.$place.data('obj', obj);
				}

				return true;
			}});

			def({ name:'setElement', method: function setElement(obj, options)
			{
				var options = options || {};
				var $elm;

				this.hide(obj);
				this.lock(obj);

				if (!obj.$place.is('input')) {
					$elm = $(id.gui.text.htmlOf(obj, options));
					obj.$place = $elm.find('input');
				}

				if (obj.label) id.gui.label.init(obj);

				this.setValue(obj);

				return $elm;
			}});

			def({ name:'lock', method: function lock(obj)
			{
				if (obj.locked) {
					obj.$place.prop(attr.readonly, true).addClass(css.readonly).prev(/*label*/).addClass(css.readonly);
				} else {
					obj.$place.removeProp(attr.readonly).removeClass(css.readonly).prev(/*label*/).removeClass(css.readonly);
				}
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.parent().parent().children().addClass(css.none);
				} else {
					obj.$place.parent().parent().children().removeClass(css.none);
				}
			}});

			def({ name:'addBindings', method: function addBindings(obj)
			{
				obj.$place.unbind('change'+ns).bind('change'+ns, obj, function(e)
				{
					var obj = e.data;
					obj.$place.data('obj').value = obj.$place.val();

					if (id.format.checkNumber(obj.$place, {}) == false)
					{
						obj.error = id.lang.get('invalidFormat');
						id.gui.message.add(obj, { byClient: true });
						e.stopPropagation();
					}
					else id.gui.message.clear(obj);
				});
			}});

		}});

		classify({ name:'NewSelect', base: id.gui.AbstractComplexElement, definition: function()
		{
		    def({ name:'init', method: function init(obj, options)
			{
				var options = options || {};
				var $elm;

				this.hide(obj);

				if (obj.$place.is('table')) {
					id.gui.select.init(obj, options)
				} else if (obj.$place.is('div')) {
					id.gui.select.init(obj, options)
				} else {
					$elm = $(this.htmlOf(obj, options));
					obj.$place = $elm;
					$elm.append(id.gui.select.init(obj, options));
				}

				return $elm;
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.parent().children().addClass(css.none);
				} else {
					obj.$place.parent().children().removeClass(css.none);
				}
			}});

			def({ name:'update', method: function update(obj, options)
			{
				id.gui.select.update(obj, options)
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};
				var cache = '';

				if (options.dynamic) cache += id.gui.label.htmlOf(obj);
				cache += '<div '+(options.skipID ? '' : 'id="'+ obj.id +'"')+' class="wrap isSelect"></div>';

				return cache;
			}});
		}});

		classify({ name:'Radio', base: id.gui.AbstractSimpleElement, definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name: name });
			}});

			def({ name:'init', method: function init(obj, options)
			{
				if (!obj.$place.is('div')) {
					var $elm = $(this.htmlOf(obj));
					obj.$place = $elm;
				}

				// Fill a
				// predesigned radio button section

				if (obj.label)
					setLabel(obj);

				this.hide(obj);

				if (addList(obj)) {
					this.addBindings(obj);
					return $elm;
				}

				// Functions

				function addList(obj)
				{
					var $buttons = obj.$place.find('input[type=radio]');
					var $button;

					if ($buttons.missed())
						return id.error(this.me+'Missing radio buttons for "'+obj.id+'".');

					if (obj.items) $.each(obj.items, function(i, item)
					{
						var value = id.cos.valueOf(item);
						var label = item.label ? item.label : value;

						$button = $buttons.eq(i);

						$button
							.attr(attr.key, value)
							.next('label').text(label);

						if (this.selected) $button.prop('checked', true);
						if (obj.locked) $button.addClass(css.disabled).prop('disabled', 'yes');
						else $button.removeClass(css.disabled).removeProp('disabled');
					});

					return true;
				}

				function setLabel(obj)
				{
					var $label = obj.$place.prev(/*label*/);
					var required = obj.required != undefined ? obj.required : ($label.text().indexOf('*') != -1 && obj.label.indexOf('*') == -1);

					$label.text(obj.label + (required == true ? ' *' : ''));
				}
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.prev(/*label*/).hide();
					obj.$place.hide();
				}
				else {
					obj.$place.prev(/*label*/).show();
					obj.$place.show();
				}
			}});

			def({ name:'addBindings', method: function addBindings(obj)
			{
				// Note (IE Bug)
				// IE has a bug by handling change events by radio buttons,
				// therefore the click event is used.

				if (obj.locked)
					return false;

				var $buttons = obj.$place.find('input[type=radio]');
				var event = id.isIE() ? 'click'+this.ns : 'change'+this.ns;

				if (obj.hasChange())
					$buttons.unbind(event+this.ns).bind(event+this.ns, { obj: obj }, function(e) { e.data.obj.change(); });

				return true;
			}});

			def({ name:'htmlOf', method: function htmlOf(obj) {
				var cache = '';

				cache += '<div class="'+css.wrap+' '+css.isRadio+'">';

				if (obj.items) $.each(obj.items, function(i, item) {
					cache += '<input name="'+obj.id+'" type="radio" class="'+css.check+'" />';
					cache += id.gui.label.htmlOf(item);
				});

				cache += '</div>';

				return cache;
			}});
		}});

		classify({ name:'CheckSelect', base:id.gui.AbstractSelect, definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name: name, docType: css.isCheckSelect, serializer: this.serialize });
			}});

		    def({ name:'init', method: function init(obj, options)
			{
				var me = this.me;
				var ns = this.ns;

				// Build a list
				// with multiple checks.

				if (obj.label)
					setLabel(obj);

				reset(obj);

				if (obj.items)
				{
					addList(obj);
					setEvents(obj);
				}

				// Functions

				function reset(obj)
				{
					obj.$place.empty();
				}

				function addList(obj)
				{
					obj.$place.html(this.htmlOf(obj));

					this.lock(obj);
					this.hide(obj);
				}

				function setEvents(obj)
				{
					if (obj.locked)
						return false;

					obj.$place
						.unbind('click'+ns).bind('click'+ns, function(e) { if (!obj.$place.hasClass(css.disabled)) $(e.target).toggleClass(css.selected); })
						.unbind('mouseover'+ns).bind('mouseover'+ns, function(e) { $(e.target).addClass(css.focused); })
						.unbind('mouseout'+ns).bind('mouseout'+ns, function(e) { $(e.target).removeClass(css.focused); });

					return true;
				}

				function setLabel(obj)
				{
					var $label = obj.$place.prev(/*label*/);
					var required = obj.required != undefined ? obj.required : ($label.text().indexOf('*') != -1 && obj.label.indexOf('*') == -1);

					$label.text(obj.label + (required == true ? ' *' : ''));
				}
			}});

			def({ name:'lock', method: function lock(obj)
			{
				if (obj.locked) obj.$place.addClass(css.disabled).prop('disabled', 'yes');
				else obj.$place.removeClass(css.disabled).removeProp('disabled');
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) obj.$place.parent().addClass(css.none);
				else obj.$place.parent().removeClass(css.none);
			}});

			def({ name:'htmlOf', method: function htmlOf(obj) {
				var cache = '', value;

				cache += '<ul>';

				$.each(obj.items, function(i, item)
				{
					value = item.value ? item.value : item.valueOf();
					cache += '<li '+attr.key+'="'+value+'"'+(item.selected ? ' class="'+css.selected+'"' : '')+'>'+(item.label ? item.label : value)+'</li>';
				});

				cache += '</ul>';

				return cache;
			}});

			def({ name:'serialize', method: function serialize(map, field, $element, wanted)
			{
				if (wanted(field))
				{
					var count = 0;
					var $found = $element.find('ul').find('li.'+css.selected);

					$found.each(function()
					{
						id.serialize.addField(map, field, $(this).attr(attr.key));
						count++
					});

					if (count == 0)
						id.serialize.addField(map, field, '');
				}

				return map;
			}});
		}});

		classify({ name:'LegendGroup', base: id.gui.AbstractComplexElement,  definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name: name });
			}});

		    def({ name:'init', method: function init(obj)
			{
				var me = this.me;
				var ns = this.ns;

				if (obj.$place.data('obj') && obj.getTask().mode == cos.update) {
					var storedObj = obj.$place.data('obj');
					obj = $.extend(true, storedObj, obj);
				} else {
					obj.$place.data('obj', obj);
				}

				obj.$place.empty();
				obj.$place.append(this.htmlOf(obj));
				this.hide(obj);
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.addClass(css.none);
				} else {
					obj.$place.removeClass(css.none);
				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj)
			{
				var cache = '';
				var group = obj.items;

				cache += '<label>'+(obj.label ? obj.label : obj.id)+'</label>';
				for (var j = 0; j < group.length; j++)
				{
					cache += new id.gui.SingleLegend().htmlOf(group[j]);
				}

				return cache;
			}});
		}});

		classify({ name:'SingleLegend', definition: function()
		{
		    def({ name:'htmlOf', method: function htmlOf(obj)
		    {
		    	var cache = '';

				cache +=  '<div class="'+css.legendGroup+'">';
				cache += '<label>'+(obj.label ? obj.label : obj.id)+'</label>';
				cache += '<ul class="'+css.legendList+'">';

				if (obj.items.length >= 1) {
					for ( var i = 0; i < obj.items.length; i++) {
						var item = obj.items[i];
						cache += '<li id="l'+i+'"><span class="'+css.legendIcon+'_'+(item.status ? item.status : 'blank')+'"></span>'+(item.label ? item.label.toEntity() : 'No Data')+'</li>';
					}
				} else {
					cache += '<li><span class="'+css.legendIcon+'_blank"></span> No Data </li>';
				}

				cache += '</ul>';
				cache +=  '</div>';

				return cache;
		    }});
		}});

		classify({ name:'SwapSelect', base:id.gui.AbstractSelect, definition: function()
		{
			def({ name:'initialize', method:function initialize(name)
			{
				id.object.register(this, { name: name, docType: css.isSwapSelect, serializer: this.serialize });
			}});

			def({ name:'init', method: function init(obj)
			{
				var me = this.me;
				var ns = this.ns;
				var Button = { add: { id: 'add', label: '&gt;&gt;' }, remove: { id: 'remove', label: '&lt;&lt;' }, up: { id: 'up', label: id.lang.get('up') }, down: { id: 'down', label: id.lang.get('down') }};

				// Multiple select provided by two swap lists,
				// one list with available elements, one list with selected elements,
				// connected by two buttons (<<, >>).

				this.hide(obj);
				this.lock(obj);


				clrMessage(obj);
				if (obj.error != undefined || obj.warning != undefined ) addMessage(obj);

				if (!obj.items) return false;

				// Init ..

				obj.$place.empty();
				obj.$place.append(this.htmlOf(obj));

				// Set

				if (obj.label)
				{
					setLabel(obj, css.available, 'available');
					setLabel(obj, css.choosen, 'selected', { edit: true });
				}

				if (obj.items)
				{
					var $available = addList(obj, css.available);
					var $choosen = addList(obj, css.choosen, { edit: true });

					setEvents(obj, $available, $choosen);
					setEvents(obj, $choosen, $available);
					setButtons(obj, $available, $choosen);
				}

				return true;

				// Functions

				function addList(obj, place, options)
				{
					var cache = '', value;
					var edit = options && options.edit;
					var $list = obj.$place.find('.'+place);

					cache += '<ul>';

					$.each(obj.items, function(i, item)
					{
						value = item.value ? item.value : item.valueOf();

						if ((edit && item.selected) || (!edit && !item.selected))
							cache += '<li '+attr.key+'="'+value+'"'+(i == 0 && !obj.locked ? ' class="'+css.selected+'"' : '')+'>'+(item.label ? item.label : value)+'</li>';
					});

					cache += '</ul>';

					$list.html(cache);

					if (obj.locked) $list.addClass(css.disabled);
					else $list.removeClass(css.disabled);

					return $list.children();
				}

				function setEvents(obj, $list, $to)
				{
					if (obj.locked)
						return false;

					$list
						.bind('click'+ns, onSelect)
						.bind('dblclick'+ns, { obj: obj, $from: $list, $to: $to, selected: true }, onSwap)
						.bind('mouseover'+ns, function(e) { $(e.target).addClass(css.focused); })
						.bind('mouseout'+ns, function(e) { $(e.target).removeClass(css.focused); });

					if (id.isMozilla())
					{
						// Note (FF bug)
						// Even the very good Firefox (3.0) has some issues ..
						// .. in this case: if the mouse crosses a scrollbar,
						// than the <li> event doesn't fired.

						$list.bind('mouseout'+ns, function(e) { $(this).find('.'+css.focused).removeClass(css.focused); });
					}

					return true;
				}

				function setButtons(obj, $available, $choosen)
				{
					if (obj.locked)
					{
						obj.$place.find('#'+Button.add.id).unbind('click'+ns).addClass(css.disabled);
						obj.$place.find('#'+Button.remove.id).unbind('click'+ns).addClass(css.disabled);
						obj.$place.find('#'+Button.up.id).unbind('click'+ns).addClass(css.disabled);
						obj.$place.find('#'+Button.down.id).unbind('click'+ns).addClass(css.disabled);
					}
					else
					{
						obj.$place.find('#'+Button.add.id).removeClass(css.disabled).unbind('click'+ns).bind('click'+ns, { obj: obj, $from: $available, $to: $choosen }, onSwap);
						obj.$place.find('#'+Button.remove.id).removeClass(css.disabled).unbind('click'+ns).bind('click'+ns, { obj: obj, $from: $choosen, $to: $available }, onSwap);
						obj.$place.find('#'+Button.up.id).removeClass(css.disabled).unbind('click'+ns).bind('click'+ns, { obj: obj, direction: 'up' }, onSort);
						obj.$place.find('#'+Button.down.id).removeClass(css.disabled).unbind('click'+ns).bind('click'+ns, { obj: obj, direction: 'down' }, onSort);
					}
				}

				function setLabel(obj, place, extension, options)
				{
					var $label = obj.$place.find('.'+place).prev(/* label */);
					var required = obj.required != undefined ? obj.required : ($label.text().indexOf('*') != -1 && obj.label.indexOf('*') == -1);

					$label.text(obj.label+(extension ? ' '+id.lang.get(extension) : '')+(options && options.edit && required? ' *' : ''));
				}

				function addMessage(obj)
				{
					// An error only set by an event, so it will be added occasionally.
					// If there's an old error message, it will be removed before.

					var message = '';

					clrMessage(obj);

					if (obj.error) { message = obj.error; }
					else if (obj.warning) { message = obj.warning; }

					var $p = $('<p class="'+css.message+(obj.warning ? ' '+css.warning : '')+(obj.error ? ' '+css.error : '')+'">'+message+'</p>');

					obj.$place.find('.'+css.choosen).parent().append($p).css({'paddingBottom': $p.outerHeight()});

					$p.fadeIn('slow');
				}

				function clrMessage(obj)
				{
					obj.$place.find('p.'+css.message).remove();
					obj.$place.find('.'+css.choosen).parent().removeAttr("style");
				}

				// Events

				function onSelect(e)
				{
					var $list = $(this);
					var $item = $(e.target);

					if (!e.shiftKey)
					{
						// Unique select
						// Deselect everything else ...

						$list.find('li.'+css.selected).removeClass(css.selected);
					}

					$item.addClass(css.selected);

					if (e.shiftKey)
					{
						// Multiple select
						// Select everything between first and last selected item.

						var $selected = $list.find('li.'+css.selected);
						var begin = false;

						if ($selected.size() == 1)
							return true;

						$selected.filter('.'+css.selected+':first').attr(attr.mark, 'begin');
						$selected.filter('.'+css.selected+':last').attr(attr.mark, 'end');

						$list.children('li').each(function(i, item)
						{
							if (!begin)
							{
								// Find the first selected item ...
								// .. then begin to select.

								if ($(item).attr(attr.mark))
								{
									$(item).removeAttr(attr.mark);
									begin = true;
								}

								return true /* = continue */;
							}
							else
							{
								// Find the last selected item ..
								// then stop to select.

								if ($(item).attr(attr.mark))
								{
									$(item).removeAttr(attr.mark);
									return false /* = break */;
								}
							}

							$(item).addClass(css.selected);
						});
					}
				}

				function onSwap(e)
				{
					var $from = e.data.$from;
					var $to = e.data.$to;
					var $item = e.data.selected ? $(e.target) : $from.find('.'+css.selected);
					var obj = e.data.obj;

					if ($item.missed()) $item = $from.children(':first');

					$to.find('.'+css.selected).removeClass(css.selected);

					if ($item.next('li').exist()) $item.next('li').eq(0).addClass(css.selected);
					else $item.prev('li').eq(0).addClass(css.selected);

					// The function jQuery.append() works like a move operation,
					// so there's no need for an from.remove().

					$to.append($item);

					$item.removeClass(css.focused).unbind('dblclick'+ns).bind('dblclick'+ns, { obj: e.data.obj, $from: $to, $to: $from, selected: true }, onSwap);

					obj.change();
				}

				function onSort(e)
				{
					var direction = e.data.direction;
					var $selected = $.find('div.'+css.choosen+' li.'+css.selected);


					switch(direction){
						case 'up': moveUp(); break;
						case 'down': moveDown(); break;
					}

					function moveUp(){
						for (var i = 0; i < $selected.length; i++){
							var $item = $($selected[i]);
							$item.insertBefore($item.prev());
						}
					}

					function moveDown(){
						for (var i = $selected.length; i >= 0; i--){
							var $item = $($selected[i]);
							$item.insertAfter($item.next());
						}
					}
				}
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.addClass(css.none);
					obj.$place.prop(attr.disabled, 'yes');
				} else {
					obj.$place.removeClass(css.none);
					obj.$place.removeProp(attr.disabled);
				}
			}});

			def({ name:'lock', method: function lock(obj)
			{
				if (obj.locked) {
					obj.$place.prop(attr.readonly, true);
				} else {
					obj.$place.removeProp(attr.readonly);
				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj)
			{
				var Button = { add: { id: 'add', label: '&gt;&gt;' }, remove: { id: 'remove', label: '&lt;&lt;' }, up: { id: 'up', label: id.lang.get('up') }, down: { id: 'down', label: id.lang.get('down') }};
				var cache = '';

				cache += '<table class="'+css.gridTable+'"><tr>';
				cache += '<td class="'+css.wmod1+'">'+id.gui.label.htmlOf(obj, id.lang.get('available'))+'<div class="'+css.wrap+' '+css.selectbox+' '+css.available+'"></div></td>'
				cache += '<td class="'+css.center+'"><div class="'+css.buttonbox+( obj.sortable == true ?  ' ' +css.sortable : '')+'">';
				cache += '<a id="'+Button.add.id+'" class="'+css.button+' '+css.w1+'"><span>'+Button.add.label+'</span></a>';
				cache += '<a id="'+Button.remove.id+'" class="'+css.button+' '+css.w1+'"><span>'+Button.remove.label+'</span></a>';
				if (obj.sortable === true){
					cache += '<a id="'+Button.up.id+'" class="'+css.button+' '+css.w1+'"><span>'+Button.up.label+'</span></a>';
					cache += '<a id="'+Button.down.id+'" class="'+css.button+' '+css.w1+'"><span>'+Button.down.label+'</span></a>';
				}
				cache += '</div></td>';
				cache += '<td class="'+css.wmod1+'">'+id.gui.label.htmlOf(obj, id.lang.get('selected'))+'<div class="'+css.wrap+' '+css.selectbox+' '+css.choosen+'"></div></td>';
				cache += '</tr></table>';

				return cache;
			}});

			def({ name:'serialize', method: function serialize(map, field, $element, wanted)
			{
				if ($element.prop(attr.disabled)) {
					return false;
				}

				if (wanted(field))
				{
					var count = 0;
					var $found = $element.find('ul').eq(1 /* the right (not left) list */).find('li');

					$found.each(function()
					{
						id.serialize.addField(map, field, $(this).attr(attr.key));
						count++
					});

					if (count == 0)
						id.serialize.addField(map, field, '');
				}

				return map;
			}});
		}});

		classify({ name:'Tooltip', base: id.gui.AbstractSimpleElement, definition: function()
		{
			def({ name:'setElement', method: function setElement(obj)
			{
				var $label;
				var $tip;

				switch (obj.type)
				{
					case cos.time : $label = obj.$place.parent(/*div*/).prev(/*span*/).prev(/*label*/).addClass(css.date); break;
					case cos.text : $label = obj.$place.parent(/*div*/).prev(/*label*/); break;
					case cos.list : if (obj.$place.hasClass(css.isSwapSelect)) { $label = obj.$place.find('.'+css.selectbox).prev(/* label */);} else { $label = obj.$place.prev(/*label*/); }; break;
					case cos.flag : $label = obj.$place.next(/*label*/); break;
				}

				if (!$label.hasClass(css.tooltipDone))
				{
					$label.addClass(css.tooltipDone);
					$label.attr('id', 'tpanchor-' + obj.id);

					$tip = $(this.htmlOf(obj));
					$('#content').append($tip);

					$label.tooltip({
						tip: $tip ,
						position: 'center right',
						offset: [0, 0],
						lazy: false,
						predelay: 750,
						delay: 500
					}).dynamic();

				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj)
			{
				var cache = '';

				cache += '<div id="'+obj.id+'-tooltip'+'" class="'+css.tooltip+'">';
				cache += '<div class="'+css.tooltipContent+'">'+obj.tip+'</div>';
				cache += '<div class="shadowbox"><div class="shadow_t"></div><div class="shadow_b"></div><div class="shadow_l"></div><div class="shadow_r"></div><div class="shadow_tl"></div><div class="shadow_tr"></div><div class="shadow_bl"></div><div class="shadow_br"></div></div>';
				cache += '</div>';

				return cache;
			}});
		}});

		classify({ name:'Label', base: id.gui.AbstractSimpleElement, definition: function()
		{
			def({ name:'requirementsGiven', method: function requirementsGiven(obj)
			{
				if (!obj.label)
					return false;

				if (obj.getPlace().hasClass(css.noLabel))
					return false;

				return true;
			}});

			def({ name:'setElement', method: function setElement(obj)
			{
				var required;

				if (obj.type == cos.label)
				{
					// set lonley labels as headlines
					obj.$place.text(obj.label.toEntity());
				}
				else
				{
					var $label = obj.$place.parent(/*div*/).parent(/*td*/).children('label');

					if (obj.required === undefined) {
						if (obj.getTask().mode == cos.init) {
							required = false;
						} else {
							required = $label.text().indexOf('*') != -1;
						}
					} else {
						required = obj.required;
					}

					$label.text(obj.label.toEntity() + (required == true  ? ' *' : ''));

					if (obj.format && id.isObject(obj.format)) {
						var format = obj.format;
						if (format.label) {
							$label.find('span').remove();
							$label.append('<span>['+ format.label +']</span>');
						}
					}
				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, extension)
			{
				return '<label for="'+obj.id+'">'+obj.label.toEntity() + (extension ? ' '+extension : '')+'</label>';
			}});
		}});

		classify({ name:'Flag', base: id.gui.AbstractSimpleElement, definition: function()
		{
			def({ name:'initialize', method: function initialize(name)
			{
				id.object.register(this, { name:name, docType:css.isCheck, serializer:this.serialize })
			}});

			def({ name:'init', method:function init(obj)
			{
				if (!obj.$place.is('input')) {
					var $elm = $(this.htmlOf(obj));
					obj.$place = $elm.find('input');
				}

				if (obj.$place.data('obj') && obj.getTask().mode == cos.update) {
					var storedObj = obj.$place.data('obj');
					obj = $.extend(true, storedObj, obj);
				}
				else {
					obj.$place.data('obj', obj);
				}

				this.setElement(obj);
				this.addBindings(obj);

				return $elm;
			}});

			def({ name:'setElement', method: function setElement(obj)
			{
				this.hide(obj);

				if (obj.label) obj.$place.next(/*label*/).text(obj.label + (obj.required ? ' *' : ''));
				obj.$place.prop('checked', obj.value == true ? true : false);

				this.lock(obj);

				if (obj.value) obj.$place.prop('checked', 'true');
			}});

			def({ name:'addBindings', method: function addBindings(obj)
			{
				obj.$place.unbind('change' + ns).bind('change' + ns, obj, function(e)
				{
					obj.$place.data('obj').value = obj.$place.prop('checked');
				});

				if (obj.hasService()) {
					obj.$place.unbind('change' + ns).bind('change' + ns, {obj:obj, $input:obj.$place }, function(e)
					{
						var obj = e.data.obj;
						var service = obj.hasService();

						if (service.parameters) {
							id.service.call(obj.getOwner(), service, { $form:obj.getOwner().$place });
						}
						else {
							id.service.call(obj.getOwner(), service, { parameters:[
								{ id:obj.id, value:e.data.$input.val() }
							]});
						}
					});
				}
			}});

			def({ name:'htmlOf', method: function htmlOf(obj)
			{
				var cache = '';

				cache += '<div class="'+css.wrap+' '+css.isCheck+'">';
				cache += '<input id="'+obj.id+'" type="checkbox" class="'+css.check+'" />';
				cache += id.gui.label.htmlOf(obj);
				cache += '</div>';

				return cache;
			}});

			def({ name:'serialize', method: function serialize(map, field, $element, wanted)
			{
				if (wanted(field))
					map[field] = $element.is(':checked') ? 'true' : 'false';

				return map;
			}});

			def({ name:'hide', method: function hide(obj)
			{
				if (obj.hidden) {
					obj.$place.parent().children().addClass(css.none);
					return false;
				}
				else {
					obj.$place.parent().children().removeClass(css.none);
				}
			}});

			def({ name:'lock', method: function lock(obj)
			{
				if (obj.locked) obj.$place.prop('disabled', 'yes');
				else obj.$place.removeProp('disabled');
			}});
		}});

		classify({ name:'Image', base: id.gui.AbstractSimpleElement, definition: function()
		{
			def({ name:'init', method:function init(obj, options)
			{
				options = options || {};
				var $elm;

				obj.$place.data('obj', obj);
				$elm = $(this.htmlOf(obj, options));
				obj.$place.empty();
				obj.$place.append($elm);
				this.setElement(obj);


				return $elm;
			}});

			def({ name:'update', method:function update(obj, options)
			{
				options = options || {};
				var $elm;

//				var storedObj = obj.$place.data('obj');
//				obj = $.extend(true, storedObj, obj);

				var $img = obj.$place.find('img');

				$img.remove();
				$img = $('<img />');
				$img = this.setElement(obj);
				obj.$place.find('.wrap').append($img);
			}});

			def({ name:'setElement', method: function setElement(obj)
			{
				var $img = obj.$place.find('img');

				if (obj.label) obj.$place.next(/*label*/).text(obj.label.toEntity() + (obj.required ? ' *' : ''));

				if (obj.source) $img.attr(attr.src, 'data:image/' + (obj.format ? obj.format.toLowerCase() : 'png') + ';base64,' + obj.source);
				else if (obj.url) $img.attr(attr.src, obj.url);

				if (obj.width) $img.css(css.width, obj.width);
				if (obj.height) $img.css(css.height, obj.height);

				return $img;
			}});

			def({ name:'htmlOf', method: function htmlOf(obj, options)
			{
				var options = options || {};
				var cache = '';

				cache += id.gui.label.htmlOf(obj);
				cache += '<div class="wrap">';
				cache += '<img />';
				cache += '</div>';

				return cache;
			}});
		}});

		classify({ name:'Value', base:id.gui.AbstractElement,  definition: function()
		{
			def({ name:'set', method: function set(obj)
			{
				id.warning('id.gui.value.set() is deprecated');
			    this.setValue(obj);
			}});
		}});

		classify({ name:'Message', base:id.gui.AbstractSimpleElement, definition:function()
		{
			def({ name:'add', method:function add(obj, options)
			{
				this.requirementsGiven(obj);
				this.setElement(obj, options);
			}});

			def({ name:'clear', method:function clear(obj)
			{
				// Only clear errors,
				// which are set by the client (temporarily).

				obj.getPlace().parent(/*div*/).parent(/*td*/).find('p.' + css.message).each(function()
				{
					if ($(this).hasClass(css.byClient)) {
						$(this).remove();
					}
				});
			}});

			def({ name:'clearAll', method:function clearAll(obj)
			{
				obj.getPlace().find('p.' + css.message).remove();
				obj.getPlace().find('.' + css.table + ' td.' + css.error).removeClass(css.error);
			}});

			def({ name:'setElement', method:function setElement(obj, options)
			{
				this.clear(obj);
				var $p = $(this.htmlOf(obj, options));

				obj.getPlace().parent(/*div*/).parent(/*td*/).append($p);
				$p.fadeIn('slow');
			}});

			def({ name:'htmlOf', method:function htmlOf(obj, options)
			{
				var options = options || {};
				var message = getMessage(obj);
				var cache = '';

				cache += '<p class="' + css.message + (options && options.byClient ? ' ' + css.byClient : '') + (obj.warning ? ' ' + css.warning : '') + (obj.error ? ' ' + css.error : '') + '">';
				cache += message;
				cache += '</p>';

				return cache;
			}});

			def({ name:'requirementsGiven', method:function requirementsGiven(obj)
			{
				if (!obj.$place.is('input, textarea')) {
					obj.$place = obj.$place.find('input, textarea');
				}
				return true;
			}});

			function getMessage(obj)
			{
				var message;

				if (obj.error) {
					message = obj.error;
				}
				else if (obj.warning) {
					message = obj.warning;
				}

				return message;
			}
		}});
	}});

	// ---------------------------------------------------------------------------------------------- //
	// Static Initializers
	// ---------------------------------------------------------------------------------------------- //

	id.gui.index = new id.gui.Index('index');
	id.gui.indicator = new id.gui.Indicator();
	id.gui.paging = new id.gui.Paging();
	id.gui.confirm = new id.gui.Confirm();
	id.gui.time = new id.gui.Time();
	id.gui.text = new id.gui.Text();
	id.gui.number = new id.gui.Number();
	id.gui.newSelect = new id.gui.NewSelect();
	id.gui.radio = new id.gui.Radio('radio');
	id.gui.checkSelect = new id.gui.CheckSelect('checkSelect');
	id.gui.legendGroup = new id.gui.LegendGroup('legendGroup');
	id.gui.swapSelect = new id.gui.SwapSelect('swapSelect');
	id.gui.tooltip = new id.gui.Tooltip();
	id.gui.label = new id.gui.Label();
	id.gui.flag = new id.gui.Flag();
	id.gui.image = new id.gui.Image();
	id.gui.value = new id.gui.Value();
	id.gui.message = new id.gui.Message();

}());