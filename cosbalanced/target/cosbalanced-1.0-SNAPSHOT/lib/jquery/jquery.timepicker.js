/**
 *
 * Date picker
 * Author: 
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */
(function ($) {
	var TimePicker = function () {
		var	ids = {},
			views = {
				hourMinute: 'timepickerViewHours',
				hour: 'timepickerViewHours',
				minute: 'timepickerViewMinutes'
			},
			tpl = {
				wrapper: '<div class="timepicker"><div class="shadowbox"><div class="shadow_t" /><div class="shadow_b" /><div class="shadow_l" /><div class="shadow_r" /><div class="shadow_tl" /><div class="shadow_tr" /><div class="shadow_bl" /><div class="shadow_br" /></div><div class="timepickerContainer"><table cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div></div>',
				head: [
					'<td>',
					'<table cellspacing="0" cellpadding="0">',
						'<thead>',
							'<tr>',
								'<th colspan="6" class="timepickerHours"><a href="#"><span></span></a></th>',
							'</tr>',
						'</thead>',
					'</table></td>'
				],
				space : '<td class="timepickerSpace"><div></div></td>',

				hours: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td class="<%=hours[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td class="<%=hours[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
							'<td class="<%=hours[2].classname%>"><a href="#"><span><%=data[2]%></span></a></td>',
							'<td class="<%=hours[3].classname%>"><a href="#"><span><%=data[3]%></span></a></td>',
							'<td class="<%=hours[4].classname%>"><a href="#"><span><%=data[4]%></span></a></td>',
							'<td class="<%=hours[5].classname%>"><a href="#"><span><%=data[5]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=hours[6].classname%>"><a href="#"><span><%=data[6]%></span></a></td>',
							'<td class="<%=hours[7].classname%>"><a href="#"><span><%=data[7]%></span></a></td>',
							'<td class="<%=hours[8].classname%>"><a href="#"><span><%=data[8]%></span></a></td>',
							'<td class="<%=hours[9].classname%>"><a href="#"><span><%=data[9]%></span></a></td>',
							'<td class="<%=hours[10].classname%>"><a href="#"><span><%=data[10]%></span></a></td>',
							'<td class="<%=hours[11].classname%>"><a href="#"><span><%=data[11]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=hours[12].classname%>"><a href="#"><span><%=data[12]%></span></a></td>',
							'<td class="<%=hours[13].classname%>"><a href="#"><span><%=data[13]%></span></a></td>',
							'<td class="<%=hours[14].classname%>"><a href="#"><span><%=data[14]%></span></a></td>',
							'<td class="<%=hours[15].classname%>"><a href="#"><span><%=data[15]%></span></a></td>',
							'<td class="<%=hours[16].classname%>"><a href="#"><span><%=data[16]%></span></a></td>',
							'<td class="<%=hours[17].classname%>"><a href="#"><span><%=data[17]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=hours[18].classname%>"><a href="#"><span><%=data[18]%></span></a></td>',
							'<td class="<%=hours[19].classname%>"><a href="#"><span><%=data[19]%></span></a></td>',
							'<td class="<%=hours[20].classname%>"><a href="#"><span><%=data[20]%></span></a></td>',
							'<td class="<%=hours[21].classname%>"><a href="#"><span><%=data[21]%></span></a></td>',
							'<td class="<%=hours[22].classname%>"><a href="#"><span><%=data[22]%></span></a></td>',
							'<td class="<%=hours[23].classname%>"><a href="#"><span><%=data[23]%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				minutes: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td class="<%=minutes[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td class="<%=minutes[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
							'<td class="<%=minutes[2].classname%>"><a href="#"><span><%=data[2]%></span></a></td>',
							'<td class="<%=minutes[3].classname%>"><a href="#"><span><%=data[3]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=minutes[4].classname%>"><a href="#"><span><%=data[4]%></span></a></td>',
							'<td class="<%=minutes[5].classname%>"><a href="#"><span><%=data[5]%></span></a></td>',
							'<td class="<%=minutes[6].classname%>"><a href="#"><span><%=data[6]%></span></a></td>',
							'<td class="<%=minutes[7].classname%>"><a href="#"><span><%=data[7]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=minutes[8].classname%>"><a href="#"><span><%=data[8]%></span></a></td>',
							'<td class="<%=minutes[9].classname%>"><a href="#"><span><%=data[9]%></span></a></td>',
							'<td class="<%=minutes[10].classname%>"><a href="#"><span><%=data[10]%></span></a></td>',
							'<td class="<%=minutes[11].classname%>"><a href="#"><span><%=data[11]%></span></a></td>',
						'</tr>',
					'</tbody>'
				]
			},
			defaults = {
				prev: '&nbsp;',
				next: '&nbsp;',
				view: 'hourMinute',
				calendars: 1,
				format: 'hr:min',
				
				unitTime: false,
				unitHours: false,
				unitMinutes: false,
				
				fromUnit: false,
				
				position: 'right',
				eventName: 'click',
				onRender: function(){return {};},
				onChange: function(){return true;},
				onShow: function(){return true;},
				onBeforeShow: function(){return true;},
				onHide: function(){return true;},
				locale: {
					hoursGrid: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
					minutesGrid: ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
				}
			},
			fill = function(el) {
			
				var options = $(el).data('timepicker');
				var cal = $(el);
				var currentCal = Math.floor(options.calendars/2), date, data, dow, month, cnt = 0, week, days, indic, indic2, html, tblCal;
				cal.find('td>table tbody').remove();
				
				for (var i = 0; i < options.calendars; i++) {
				
					tblCal = cal.find('table').eq(i+1);
					
					switch (tblCal[0].className) {
						case 'timepickerViewHours':
							dow = id.lang.get('hours');
							break;
						case 'timepickerViewMinutes':
							dow = id.lang.get('minutes');
							break;
					} 
					
					tblCal.find('thead tr:first th:eq(0) span').text(dow);
					
					
					// HOURS
					data = {
						data: options.locale.hoursGrid,
						className: 'timepickerHours',
						hours: []
					};
				
					date = new Date( options.current );
					date = date.getHours();
					
					var dateEnd = new Date( options.current );
					dateEnd.setHours(0);
					dateEnd = dateEnd.getHours();
					
					for ( var hoursIndex = 0; hoursIndex < data.data.length; hoursIndex++ )
					{
						data.hours[ hoursIndex ] = { 'classname': [] };
						
						var fromUser = options.onRender(date);
						var val1 = date;
						var val2 = dateEnd + hoursIndex;
						
						if (fromUser.selected || ( val1 == val2 ) ) // TODO: || $.inArray(val, options.date) > -1 || (options.mode == 'range' && val >= options.date[0] && val <= options.date[1])) 
						{
							data.hours[ hoursIndex ].classname.push( 'timepickerSelected' );
						}
						
						if (fromUser.disabled) {
							data.hours[ hoursIndex ].classname.push('timepickerDisabled');
						}

						data.hours[ hoursIndex ].classname = data.hours[ hoursIndex ].classname.join( ' ' );
						
					}
					
					html = tmpl(tpl.hours.join(''), data);
					
					
					// MINUTES
					data = {
						data: options.locale.minutesGrid,
						className: 'timepickerMinutes',
						minutes: []
					};

					date = new Date( options.current );
					date = date.getMinutes();
					date = Math.round(date/5)*5 ;
					
					var dateEnd = new Date( options.current );
					dateEnd.setMinutes(0);
					dateEnd = dateEnd.getMinutes();
					dateEnd = Math.round(dateEnd/5)*5 ;
					
					for ( var minutesIndex = 0; minutesIndex < data.data.length; minutesIndex++ )
					{
						data.minutes[ minutesIndex ] = { 'classname': [] };
						
						var fromUser = options.onRender(date);
						var val1 = date;
						var val2 = dateEnd + ( minutesIndex * 5 );
						
						if (fromUser.selected || ( val1 == val2 ) ) // TODO: || $.inArray(val, options.date) > -1 || (options.mode == 'range' && val >= options.date[0] && val <= options.date[1])) 
						{
							data.minutes[ minutesIndex ].classname.push( 'timepickerSelected' );
						}
						
						if (fromUser.disabled) {
							data.minutes[ minutesIndex ].classname.push('timepickerDisabled');
						}

						data.minutes[ minutesIndex ].classname = data.minutes[ minutesIndex ].classname.join( ' ' );
					}
										
					html = tmpl(tpl.minutes.join(''), data) + html;
					tblCal.append(html);
					
				}
			},
			parseDate = function (date, format) {
				
				if (date.constructor == Date) {
					return new Date(date);
				}
				
				var parts = date.split(/\W+/);
				var against = format.split(/\W+/), hr, min, sec, now = new Date();
				
				for (var i = 0; i < parts.length; i++) {
					switch (against[i]) {
						case 'hr':
							hr = parseInt(parts[i], 10);
							break;
						case 'min':
							min = parseInt(parts[i], 10);
							break;
						case 'sec':
							sec = parseInt(parts[i], 10);
							break;
					}
				}
				
				return new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					hr === undefined ? now.getHours() : hr,
					min === undefined ? now.getMinutes() : min,
					sec === undefined ? now.getSeconds() : sec
				);
			},
			formatDate = function(date, format) {
			
				var hr = date.getHours();
				var min = date.getMinutes();
				var sec = date.getSeconds();
				
				var parts = format.split(/\W+/), part, splitter = format.match(/\W+/);
				for ( var i = 0; i < parts.length; i++ ) {
					part = parts[i];
					switch (parts[i]) {
						case 'hr':
							part = hr < 10 ? hr = '0' + hr : hr;
							break;
						case 'min':
							part = min < 10 ? min = '0' + min : min;
							break;
						case 'sec':
							part = sec < 10 ? sec = '0' + sec : sec;
							break;
					}
					parts[i] = part;
				}
				return parts.join(splitter);
			},
			layout = function (el) {
				var options = $(el).data('timepicker');
				var cal = $('#' + options.id);
				if (!options.extraHeight) {
					var divs = $(el).find('div');
					options.extraHeight = divs.get(0).offsetHeight + divs.get(1).offsetHeight;
					options.extraWidth = divs.get(2).offsetWidth + divs.get(3).offsetWidth;
				}
				var tbl = cal.find('table:first').get(0);
				var width = tbl.offsetWidth;
				var height = tbl.offsetHeight;
			},
			click = function(ev) {
				if ($(ev.target).is('span')) {
					ev.target = ev.target.parentNode;
				}
				var el = $(ev.target);
				if (el.is('a')) {
					ev.target.blur();
					if (el.hasClass('timepickerDisabled')) {
						return false;
					}
					var options = $(this).data('timepicker');
					var parentEl = el.parent();
					var cal = $('#' + options.id);
					var tblEl = parentEl.parent().parent().parent();
					var tblIndex = $('table', this).index(tblEl.get(0)) - 1;
					var tmp = new Date(options.current);
					var changed = false;
					var fillIt = false;
					
					// CLICK ON HEADER
					if (parentEl.is('th')) {
					
						// CLICK ON HEADER
						if (parentEl.hasClass('timepickerHours')) {
							tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
							
							switch (tblEl.get(0).className) {
									
								case 'timepickerViewHours':
									
									if (options.view == 'hourMinute') {	
										// set new class after click on the header
										tblEl.get(0).className = 'timepickerViewMinutes';	
										el.find('span').text(id.lang.get('minutes'));	
									}																										
									break;
									
								case 'timepickerViewMinutes':
									
									if (options.view == 'hourMinute') {
										// set new class after click on the header
										tblEl.get(0).className = 'timepickerViewHours';	
										el.find('span').text(id.lang.get('hours'));	
									}																									
									break;
							}
						}
						
					// CLICK ON CELL
					} else if (parentEl.is('td') && !parentEl.hasClass('timepickerDisabled')) {
						switch (tblEl.get(0).className) {
								
							case 'timepickerViewHours':
							
								options.current.setHours(el.find('span').text() * 1 );
								
								var modDate = options.current;	
								
								if (options.view == 'hourMinute') {	
									tblEl.get(0).className = 'timepickerViewMinutes';
								} else if (options.view == 'hour')	{
									closePicker(cal, options);
								}
								break;
								
							case 'timepickerViewMinutes':
							
								options.current.setMinutes(el.find('span').text() * 1);
															
								var modDate = options.current;				

								closePicker(cal, options);
								if (options.view == 'hourMinute') {
									setTimeout( function() { 
										tblEl.get(0).className = 'timepickerViewHours'; 
									}, 500 );	
								}					
								break;
								
						}
						fillIt = true;
						changed = true;
					}
					
					if (fillIt) {
						fill(this);
					}
					
					if (changed) {
						options.onChange.apply(this, prepareDate(options, modDate));				
					}
				}
				return false;
			},
			
			closePicker = function (cal, options) {
				var options = options;																													//
		 		cal.hide();
		 		if (options) options.onHide.apply(this); 																										//									
			},
			
			prepareDate = function (options, modTime) {
				return [formatDate(modTime, options.format), modTime, options.el];
			},
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},
			isChildOf = function(parentEl, el, container) {
				if (parentEl == el) {
					return true;
				}
				if (parentEl.contains) {
					return parentEl.contains(el);
				}
				if ( parentEl.compareDocumentPosition ) {
					return !!(parentEl.compareDocumentPosition(el) & 16);
				}
				var prEl = el.parentNode;
				while(prEl && prEl != container) {
					if (prEl == parentEl)
						return true;
					prEl = prEl.parentNode;
				}
				return false;
			},
			show = function (ev) {
				var cal = $('#' + $(this).data('timepickerId'));
				if (!cal.is(':visible')) {
					var calEl = cal.get(0);
					fill(calEl);
					var options = cal.data('timepicker');
					// true was formally options.unit
					options.onBeforeShow.apply(this, [true, cal.get(0)]);
					var pos = $(this).offset();
					var viewPort = getViewport();
					var top = pos.top;
					var left = pos.left;
					var oldDisplay = $.curCSS(calEl, 'display');
					cal.css({
						visibility: 'hidden',
						display: 'block'
					});
					
					$('body').trigger('click');
																		
					cal.show();		
					
					cal.bgiframe();
					//selfClose(cal); 
					
					layout(calEl);
					switch (options.position){
						case 'top':
							top -= calEl.offsetHeight;
							break;
						case 'left':
							left -= calEl.offsetWidth;
							break;
						case 'right':
							left += this.offsetWidth;
							break;
						case 'bottom':
							top += this.offsetHeight;
							break;
					}
					
					marginTop = '-10';
					marginLeft = '-26';	
					
					if (top + calEl.offsetHeight > viewPort.t + viewPort.h) {
						top = pos.top  - calEl.offsetHeight;
						marginTop = '26';
					}
					if (top < viewPort.t) {
						top = pos.top + this.offsetHeight + calEl.offsetHeight;
						marginTop = '26';
					}
					if (left + calEl.offsetWidth > viewPort.l + viewPort.w) {
						left = pos.left - calEl.offsetWidth;
						marginLeft = '26';
					}
					if (left < viewPort.l) {
						left = pos.left + this.offsetWidth
						marginLeft = '26';
					}
					cal.css({
						visibility: 'visible',
						display: 'block',
						top: top + 'px',
						left: left + 'px',
						marginTop: marginTop + 'px',
						marginLeft: marginLeft + 'px'
					});
					if (options.onShow.apply(this, [cal.get(0)]) != false) {
						if ($.browser.msie) {	
							if ($.browser.msie && $.browser.version.substr(0,1)<7) {
								sizeIECorr(cal);							
							}																	
						} 																			
						cal.show();
					}
										
					cal.unbind('clickoutside').bind('clickoutside', function(e){ 
						closePicker(cal);
						e.stopPropagation();
					});	
				}
				return false;
			},
			
			// mod fro 27.07.09
			sizeIECorr = function(calIE) {
		        var shadowWidth = calIE.children('.timepickerContainer').width();
		        var shadowHeight = calIE.children('.timepickerContainer').height();
		        
		        calIE.find('.shadowbox .shadow_l, .shadowbox .shadow_r').each(function(){
		       		$(this).height(shadowHeight - 2); 
				});
		        calIE.find('.shadowbox .shadow_t, .shadowbox .shadow_b').each(function(){
		       		$(this).width(shadowWidth);        
				});
		    },
		    
			hide = function (ev) {
				if (ev.target != ev.data.trigger && !isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('timepicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			};
		return {
			init: function(options){
				options = $.extend({}, defaults, options||{});
				//extendDate(options.locale);
				options.calendars = Math.max(1, parseInt(options.calendars,10)||1);
				options.mode = 'single';
				return this.each(function(){
					if (!$(this).data('timepicker')) {
						options.el = this;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
							//options.date.setHours(0,0,0,0);
						}
						options.date = options.date.valueOf();
						
						if (!options.current) {
							options.current = new Date();
						} else {
							options.current = parseDate(options.current, options.format);
						} 
						var id = 'timepicker_' + parseInt(Math.random() * 1000), cnt;
						options.id = id;
						$(this).data('timepickerId', options.id);
						var cal = $(tpl.wrapper).attr('id', id).bind('click', click).data('timepicker', options);
						if (options.className) {
							cal.addClass(options.className);
						}
						var html = '';
						for (var i = 0; i < options.calendars; i++) {
							cnt = options.starts;
							if (i > 0) {
								html += tpl.space;
							}
							html += tmpl(tpl.head.join(''), {
									prev: options.prev,
									next: options.next
								});
						}
						cal.find('tr:first').append(html).find('table').addClass(views[options.view]);
						fill(cal.get(0));
						cal.appendTo('#content');
						$(this).bind(options.eventName, show);
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('timepickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('timepickerId')) {
						if ($.browser.msie) {																													//mod fro 27.07.09
							ev.data.cal.children('.shadowbox').hide().end().children('.timepickerContainer').fadeOut(250, function(){ev.data.cal.hide();} );	//
						} else {																																//
						 	ev.data.cal.fadeOut(250);																											//
						}																																		//
					}
				});
			},
			setTime: function(date, shiftTo){
				return this.each(function(){
					if ($(this).data('timepickerId')) {
						var cal = $('#' + $(this).data('timepickerId'));
						var options = cal.data('timepicker');
						options.date = date;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0]))).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1]))).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (shiftTo) {
							options.current = new Date (options.mode != 'single' ? options.date[0] : options.date);
						}
						fill(cal.get(0));
					}
				});
			},
			getTime: function(formated) {
				if (this.size() > 0) {
					return prepareDate($('#' + $(this).data('timepickerId')).data('timepicker'))[formated ? 0 : 1];
				}
			},
			clear: function(){
				return this.each(function(){
					if ($(this).data('timepickerId')) {
						var cal = $('#' + $(this).data('timepickerId'));
						var options = cal.data('timepicker');
						if (options.mode != 'single') {
							options.date = [];
							fill(cal.get(0));
						}
					}
				});
			},
			fixLayout: function(){
				return this.each(function(){
					if ($(this).data('timepickerId')) {
						var cal = $('#' + $(this).data('timepickerId'));
						var options = cal.data('timepicker');
						if (options.flat) {
							layout(cal.get(0));
						}
					}
				});
			}
		};
	}();
	$.fn.extend({
		TimePicker: TimePicker.init,
		TimePickerHide: TimePicker.hidePicker,
		TimePickerShow: TimePicker.showPicker,
		TimePickerSetTime: TimePicker.setTime,
		TimePickerGetTime: TimePicker.getTime,
		TimePickerClear: TimePicker.clear,
		TimePickerLayout: TimePicker.fixLayout
	});
})(jQuery);

(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();