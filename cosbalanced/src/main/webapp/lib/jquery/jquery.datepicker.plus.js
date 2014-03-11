/**
 *
 * Date picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */
(function ($) {
	var DatePicker = function () {
		var	ids = {},
			views = {
				years: 'year',
				months: 'month',
				days: 'day',
				halfyears: 'halfyear',
				seasons: 'season',
				halfseasons: 'halfseason',
				quarters: 'quarter'
			},
			tpl = {
				wrapper: '<div class="datepicker"><div class="shadowbox"><div class="shadow_t" /><div class="shadow_b" /><div class="shadow_l" /><div class="shadow_r" /><div class="shadow_tl" /><div class="shadow_tr" /><div class="shadow_bl" /><div class="shadow_br" /></div><div class="datepickerContainer"><table class="container" cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div></div>',
				head: [
					'<td>',
					'<table cellspacing="0" cellpadding="0">',
						'<thead>',
							'<tr>',
								'<th class="datepickerGoPrev"><a href="#"><span><%=prev%></span></a></th>',
								'<th colspan="6" class="headline"><a href="#"><span></span></a></th>',
								'<th class="datepickerGoNext"><a href="#"><span><%=next%></span></a></th>',
							'</tr>',
							'<tr class="datepickerDoW">',
								'<th class="datepickerDoWView"><span>&nbsp;<span style="display:none;"><%=week%></span></span></th>',
								'<th><span><%=day1%></span></th>',
								'<th><span><%=day2%></span></th>',
								'<th><span><%=day3%></span></th>',
								'<th><span><%=day4%></span></th>',
								'<th><span><%=day5%></span></th>',
								'<th><span><%=day6%></span></th>',
								'<th><span><%=day7%></span></th>',
							'</tr>',
						'</thead>',
					'</table></td>'
				],
				space : '<td class="datepickerSpace"><div></div></td>',
				days: [
					'<tbody class="viewDays">',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[0].classname%>"><a href="#"><span><%=weeks[0].week%></span></a><span style="display:none;"><%=weeks[0].year[0].text%></span></th>',
							'<td class="<%=weeks[0].days[0].classname%>"><a href="#"><span><%=weeks[0].days[0].text%></span></a></td>',
							'<td class="<%=weeks[0].days[1].classname%>"><a href="#"><span><%=weeks[0].days[1].text%></span></a></td>',
							'<td class="<%=weeks[0].days[2].classname%>"><a href="#"><span><%=weeks[0].days[2].text%></span></a></td>',
							'<td class="<%=weeks[0].days[3].classname%>"><a href="#"><span><%=weeks[0].days[3].text%></span></a></td>',
							'<td class="<%=weeks[0].days[4].classname%>"><a href="#"><span><%=weeks[0].days[4].text%></span></a></td>',
							'<td class="<%=weeks[0].days[5].classname%>"><a href="#"><span><%=weeks[0].days[5].text%></span></a></td>',
							'<td class="<%=weeks[0].days[6].classname%>"><a href="#"><span><%=weeks[0].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[1].classname%>"><a href="#"><span><%=weeks[1].week%></span></a><span style="display:none;"><%=weeks[1].year[0].text%></span></th>',
							'<td class="<%=weeks[1].days[0].classname%>"><a href="#"><span><%=weeks[1].days[0].text%></span></a></td>',
							'<td class="<%=weeks[1].days[1].classname%>"><a href="#"><span><%=weeks[1].days[1].text%></span></a></td>',
							'<td class="<%=weeks[1].days[2].classname%>"><a href="#"><span><%=weeks[1].days[2].text%></span></a></td>',
							'<td class="<%=weeks[1].days[3].classname%>"><a href="#"><span><%=weeks[1].days[3].text%></span></a></td>',
							'<td class="<%=weeks[1].days[4].classname%>"><a href="#"><span><%=weeks[1].days[4].text%></span></a></td>',
							'<td class="<%=weeks[1].days[5].classname%>"><a href="#"><span><%=weeks[1].days[5].text%></span></a></td>',
							'<td class="<%=weeks[1].days[6].classname%>"><a href="#"><span><%=weeks[1].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[2].classname%>"><a href="#"><span><%=weeks[2].week%></span></a><span style="display:none;"><%=weeks[2].year[0].text%></span></th>',
							'<td class="<%=weeks[2].days[0].classname%>"><a href="#"><span><%=weeks[2].days[0].text%></span></a></td>',
							'<td class="<%=weeks[2].days[1].classname%>"><a href="#"><span><%=weeks[2].days[1].text%></span></a></td>',
							'<td class="<%=weeks[2].days[2].classname%>"><a href="#"><span><%=weeks[2].days[2].text%></span></a></td>',
							'<td class="<%=weeks[2].days[3].classname%>"><a href="#"><span><%=weeks[2].days[3].text%></span></a></td>',
							'<td class="<%=weeks[2].days[4].classname%>"><a href="#"><span><%=weeks[2].days[4].text%></span></a></td>',
							'<td class="<%=weeks[2].days[5].classname%>"><a href="#"><span><%=weeks[2].days[5].text%></span></a></td>',
							'<td class="<%=weeks[2].days[6].classname%>"><a href="#"><span><%=weeks[2].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[3].classname%>"><a href="#"><span><%=weeks[3].week%></span></a><span style="display:none;"><%=weeks[3].year[0].text%></span></th>',
							'<td class="<%=weeks[3].days[0].classname%>"><a href="#"><span><%=weeks[3].days[0].text%></span></a></td>',
							'<td class="<%=weeks[3].days[1].classname%>"><a href="#"><span><%=weeks[3].days[1].text%></span></a></td>',
							'<td class="<%=weeks[3].days[2].classname%>"><a href="#"><span><%=weeks[3].days[2].text%></span></a></td>',
							'<td class="<%=weeks[3].days[3].classname%>"><a href="#"><span><%=weeks[3].days[3].text%></span></a></td>',
							'<td class="<%=weeks[3].days[4].classname%>"><a href="#"><span><%=weeks[3].days[4].text%></span></a></td>',
							'<td class="<%=weeks[3].days[5].classname%>"><a href="#"><span><%=weeks[3].days[5].text%></span></a></td>',
							'<td class="<%=weeks[3].days[6].classname%>"><a href="#"><span><%=weeks[3].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[4].classname%>"><a href="#"><span><%=weeks[4].week%></span></a><span style="display:none;"><%=weeks[4].year[0].text%></span></th>',
							'<td class="<%=weeks[4].days[0].classname%>"><a href="#"><span><%=weeks[4].days[0].text%></span></a></td>',
							'<td class="<%=weeks[4].days[1].classname%>"><a href="#"><span><%=weeks[4].days[1].text%></span></a></td>',
							'<td class="<%=weeks[4].days[2].classname%>"><a href="#"><span><%=weeks[4].days[2].text%></span></a></td>',
							'<td class="<%=weeks[4].days[3].classname%>"><a href="#"><span><%=weeks[4].days[3].text%></span></a></td>',
							'<td class="<%=weeks[4].days[4].classname%>"><a href="#"><span><%=weeks[4].days[4].text%></span></a></td>',
							'<td class="<%=weeks[4].days[5].classname%>"><a href="#"><span><%=weeks[4].days[5].text%></span></a></td>',
							'<td class="<%=weeks[4].days[6].classname%>"><a href="#"><span><%=weeks[4].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<th class="datepickerWeek <%=weeks[5].classname%>"><a href="#"><span><%=weeks[5].week%></span></a><span style="display:none;"><%=weeks[5].year[0].text%></span></th>',
							'<td class="<%=weeks[5].days[0].classname%>"><a href="#"><span><%=weeks[5].days[0].text%></span></a></td>',
							'<td class="<%=weeks[5].days[1].classname%>"><a href="#"><span><%=weeks[5].days[1].text%></span></a></td>',
							'<td class="<%=weeks[5].days[2].classname%>"><a href="#"><span><%=weeks[5].days[2].text%></span></a></td>',
							'<td class="<%=weeks[5].days[3].classname%>"><a href="#"><span><%=weeks[5].days[3].text%></span></a></td>',
							'<td class="<%=weeks[5].days[4].classname%>"><a href="#"><span><%=weeks[5].days[4].text%></span></a></td>',
							'<td class="<%=weeks[5].days[5].classname%>"><a href="#"><span><%=weeks[5].days[5].text%></span></a></td>',
							'<td class="<%=weeks[5].days[6].classname%>"><a href="#"><span><%=weeks[5].days[6].text%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				months: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="2" class="<%=months[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td colspan="2" class="<%=months[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
							'<td colspan="2" class="<%=months[2].classname%>"><a href="#"><span><%=data[2]%></span></a></td>',
							'<td colspan="2" class="<%=months[3].classname%>"><a href="#"><span><%=data[3]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td colspan="2" class="<%=months[4].classname%>"><a href="#"><span><%=data[4]%></span></a></td>',
							'<td colspan="2" class="<%=months[5].classname%>"><a href="#"><span><%=data[5]%></span></a></td>',
							'<td colspan="2" class="<%=months[6].classname%>"><a href="#"><span><%=data[6]%></span></a></td>',
							'<td colspan="2" class="<%=months[7].classname%>"><a href="#"><span><%=data[7]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td colspan="2" class="<%=months[8].classname%>"><a href="#"><span><%=data[8]%></span></a></td>',
							'<td colspan="2" class="<%=months[9].classname%>"><a href="#"><span><%=data[9]%></span></a></td>',
							'<td colspan="2" class="<%=months[10].classname%>"><a href="#"><span><%=data[10]%></span></a></td>',
							'<td colspan="2" class="<%=months[11].classname%>"><a href="#"><span><%=data[11]%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				halfyears: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="4" class="<%=halfyears[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td colspan="4" class="<%=halfyears[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				seasons: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="4" class="<%=seasons[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td colspan="4" class="<%=seasons[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				halfseasons: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="4" class="<%=halfseasons[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td colspan="4" class="<%=halfseasons[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td colspan="4" class="<%=halfseasons[2].classname%>"><a href="#"><span><%=data[2]%></span></a></td>',
							'<td colspan="4" class="<%=halfseasons[3].classname%>"><a href="#"><span><%=data[3]%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				quarters: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="4" class="<%=quarters[0].classname%>"><a href="#"><span><%=data[0]%></span></a></td>',
							'<td colspan="4" class="<%=quarters[1].classname%>"><a href="#"><span><%=data[1]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td colspan="4" class="<%=quarters[2].classname%>"><a href="#"><span><%=data[2]%></span></a></td>',
							'<td colspan="4" class="<%=quarters[3].classname%>"><a href="#"><span><%=data[3]%></span></a></td>',
						'</tr>',
					'</tbody>'
				]
			},
			defaults = {
				flat: false,
				starts: 0,
				prev: '&nbsp;',
				next: '&nbsp;',
				lastSel: false,
				mode: 'single',
				view: 'days',
				calendars: 1,
				lang: 'en',
				format: 'Y-m-d',
				formatId: 'day',
				formats: false,
				fromUnit: false,
				position: 'right',
				eventName: 'click',
				onRender: function(){return {};},
				onChange: function(){return true;},
				onShow: function(){return true;},
				onBeforeShow: function(){return true;},
				onHide: function(){return true;},
				locale: {
					days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
					daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
					daysMin: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
					months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
					monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
					weekMin: 'wk',
					
					halfyearsShort: ["H1", "H2"],
					seasonsShort: ["SS", "SW"],
					halfseasonsShort: ["SS H1", "SS H2", "SW H1", "SW H2"],
					quartersShort: ["Q1", "Q2", "Q3", "Q4"]
				}
			},
			
			setDropDown = function (options) {
				var formats = options.formats;
				var formatId = options.newFormat || options.formatId;
				var lang = options.lang;
				var $dropList = $('<div class="dropList"></div>');
				var $shadowbox = $('<div class="shadowbox"><div class="shadow_b"></div><div class="shadow_l"></div><div class="shadow_bl"></div></div>');
				var $scrollBox = $('<div class="scrollBox"></div>');
				var $ul = $('<ul></ul>');
				var $item;
				var day, week;
				
				$.each(formats, function() 
				{ 
					if ( this.id == "day")
						day = this.label[lang];
					
					if ( this.id == "week")
						week = this.label[lang];
					
					if (day && week) {
						options.dayWeek = true;
						options.dayFlag = true;
						options.weekFlag = true;
					}
				});
				
				$.each(formats, function() 
				{ 
					if ((options.dayWeek && this.id == 'day') || (options.dayWeek && this.id == 'week')) {
						if (options.dayFlag || options.weekFlag) {
							$item = $(htmlOfDayWeek(this, lang, formatId));
							$ul.append($item);
							options.weekFlag = false;
							options.dayFlag = false;
						}
					} else {
						$item = $(htmlOf(this, lang, formatId));
						$ul.append($item);
					}
				});
					
				$dropList.append($shadowbox);
				$scrollBox.append($ul);
				$dropList.append($scrollBox);
							
				return $dropList;
				
				function htmlOfDayWeek(format, lang, formatId)
				{
					var cache = '';
					
					cache += '<li format="dayWeek"><a>'+ day +'/'+ week +'</a></li>';

					return cache;
				};	
				
				function htmlOf(format, lang, formatId)
				{
					var cache = '';
					
					cache += '<li format="'+format.id+'" '+(format.id == formatId ? 'class="selected"'  : '' )+'>';
					cache += '<a>'+ format.label[lang] +'</a>';
					cache += '</li>';
					
					return cache;
				};
			},
			
			fill = function(el) {
				var options = $(el).data('datepicker');
				var cal = $(el);
				var currentDate = new Date(); currentDate.setHours(0,0,0,0);
				
				if (options.newFormat) { 
					if ((options.dayWeek && options.newFormat == 'day') || (options.dayWeek && options.newFormat == 'week')) {
						cal.find('table').eq(1).removeAttr('class').addClass('dayWeek');
					} else {
						cal.find('table').eq(1).removeAttr('class').addClass(options.newFormat);
					}
				} else { 
					if ((options.dayWeek && options.formatId == 'day') || (options.dayWeek && options.formatId == 'week')) {
						cal.find('table').eq(1).removeAttr('class').addClass('dayWeek');
					} else {
						cal.find('table').eq(1).removeAttr('class').addClass(options.formatId);
					}
				}
				
				var currentCal = Math.floor(options.calendars/2), date, data, dow, month, cnt = 0, week, days, indic, indic2, html, tblCal;
				cal.find('td table tbody').remove();
				for (var i = 0; i < options.calendars; i++) {
					date = new Date(options.current);
					date.addMonths(-currentCal + i);
					tblCal = cal.find('table').eq(i+1);
					switch (tblCal[0].className) {
						case 'day':
							dow = formatDate(date, 'B, Y');
							break;
						case 'week':
							dow = formatDate(date, 'B, Y');
							break;
						case 'dayWeek':
							dow = formatDate(date, 'B, Y');
							break;
						case 'month':
							dow = formatDate(date, 'Y');
							break;
						case 'year':
							dow = (date.getFullYear()-6) + ' - ' + (date.getFullYear()+5);
							break;
						case 'halfyear':
							dow = formatDate(date, 'Y');
							break;
						case 'season':
							dow = formatDate(date, 'Y');
							break;
						case 'halfseason':
							dow = formatDate(date, 'Y');
							break;
						case 'quarter':
							dow = formatDate(date, 'Y');
							break;
					} 
					
					tblCal.find('thead tr:first th:eq(1) a span').text(dow);	
					
					
					// ######### //
					// # YEARS # //
					// ######### //
    					date = new Date(options.current);
    					date.addMonths(-currentCal + i);
    
    					dow = date.getFullYear()-6;
    
    					date.setDate( 1 );
    					date.setMonth( 0 );
    					date.setFullYear( date.getFullYear() - 6 );
    
    					var dateEnd = new Date( options.current );
    					dateEnd.addMonths(-currentCal + i);
    					dateEnd.setDate( 1 );
    					dateEnd.setMonth( 0 );
    					dateEnd.setFullYear( dateEnd.getFullYear() - 5 );
    
    					data = {
    						data: [],
    						className: 'viewYears',
    						months: []
    					}
    					for ( var j = 0; j < 12; j++) {
    						data.data.push(dow + j);
    						data.months[ j ] = { 'classname': [] };
    
    						var fromUser = options.onRender(date);
    						var val1 = date.valueOf();
    						var val2 = dateEnd.valueOf();
    						
    						if (fromUser.selected || ( options.date >= val1 && options.date < val2)) {
    							data.months[ j ].classname.push( 'datepickerSelected' );
    						}
    						
    						if (currentDate.valueOf() >= val1 && currentDate.valueOf() < val2) {
    							data.months[ j ].classname.push( 'datepickerCurrent' );
    						}
    						
    						if (fromUser.disabled) {
    							data.months[ j ].classname.push('datepickerDisabled');
    						}
    
    						data.months[ j ].classname = data.months[ j ].classname.join( ' ' );
    						
    						date.setFullYear( date.getFullYear() + 1 );
    						dateEnd.setFullYear( dateEnd.getFullYear() + 1 );
    					}
    					html = tmpl(tpl.months.join(''), data);
				    
					
					// ######## //
					// # DAYS # //
					// ######## //
					date = new Date(options.current);
					date.addMonths(-currentCal + i);
					date.setDate(1);
					data = {weeks:[], test: 10};
					month = date.getMonth();
					var dow = (date.getDay() - options.starts) % 7;
					date.addDays(-(dow + (dow < 0 ? 7 : -1)));			//mod fro 30.07.09: set begin of week to monday  
					week = -1;
					cnt = 0;
					while (cnt < 42) {
						indic = parseInt(cnt/7,10);
						indic2 = cnt%7;
						if (!data.weeks[indic]) {
							week = date.getWeekNumber();
							data.weeks[indic] = {
								week: week,
								classname: [],
								days: [],
								year: []
							};
						}
						data.weeks[indic].days[indic2] = {
							text: date.getDate(),
							classname: []
						};
						data.weeks[indic].year[indic2] = {
							text: date.getFullYear(),
							classname: []
						};
						if (month != date.getMonth()) {
							data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
						}
						if (date.getDay() == 0) {
							data.weeks[indic].days[indic2].classname.push('datepickerSunday');
						}
						if (date.getDay() == 6) {
							data.weeks[indic].days[indic2].classname.push('datepickerSaturday');
						}
						var fromUser = options.onRender(date);
						var val = date.valueOf();
						if (fromUser.selected || options.date == val || $.inArray(val, options.date) > -1 || (options.mode == 'range' && val >= options.date[0] && val <= options.date[1])) {
							if ((options.newFormat || options.formatId) == 'week') { 
								data.weeks[indic].classname.push('datepickerSelected'); 
							} else if (options.newFormat == 'month') { 
								// do nothing
							} else {
								data.weeks[indic].days[indic2].classname.push('datepickerSelected'); 
							}
						}

						if (currentDate.valueOf() == val) {
							data.weeks[indic].days[indic2].classname.push('datepickerCurrent'); 
						}
						
						if (fromUser.disabled) {
							data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
						}
						if (fromUser.className) {
							data.weeks[indic].days[indic2].classname.push(fromUser.className);
						}
						data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' ');
						cnt++;
						date.addDays(1);
					}
					
					html = tmpl(tpl.days.join(''), data) + html;
					
					
					
					
					// ########## //
					// # MONTHS # //
					// ########## //
					data = {
						data: options.locale.monthsShort,
						className: 'viewMonths',
						months: []
					};

					date = new Date(options.current);
					date.addMonths(-currentCal + i);
					date.setDate( 1 );
					date.setMonth( 0 );

					var dateEnd = new Date( options.current );
					dateEnd.addMonths(-currentCal + i);
					dateEnd.setDate( 1 );
					dateEnd.setMonth( 1 );
					
					for ( var monthIndex = 0; monthIndex < data.data.length; monthIndex++ )
					{
						data.months[ monthIndex ] = { 'classname': [] };
						
						var fromUser = options.onRender(date);
						
						if (fromUser.selected || ( options.date > date.valueOf() && options.date <= dateEnd.valueOf())) {
							data.months[ monthIndex ].classname.push( 'datepickerSelected' );
						}
						
						if (currentDate.valueOf() > date.valueOf() && currentDate.valueOf() <= dateEnd.valueOf()) {
							data.months[ monthIndex ].classname.push( 'datepickerCurrent' );
						}
						
						if (fromUser.disabled) {
							data.months[ monthIndex ].classname.push('datepickerDisabled');
						}

						data.months[ monthIndex ].classname = data.months[ monthIndex ].classname.join( ' ' );
						
						date.setMonth( date.getMonth() + 1 );
						dateEnd.setMonth( dateEnd.getMonth() + 1 );						
					}
					
					html = tmpl(tpl.months.join(''), data) + html;
					
					
					
					// ############ //
					// # HALFYEAR # //
					// ############ //
					//var halfyearDow = tblCal.find('thead tr:first th:eq(1) a span').text();
					//date = new Date(options.current);
					//date.addMonths(-currentCal + i);
					//date.setDate( 1 );
					//date.setFullYear(halfyearDow);
					//var current = date.valueOf();
					//var halfyear = new Date(); halfyear.setDate( 1 ); halfyear.setHours( 0,0,0,0 ); //halfyear.setFullYear( halfyearDow ); 

					data = {
						data: options.locale.halfyearsShort,
						className: 'viewHalfyears',
						halfyears: []
					}
					
					var H1Start = new Date(options.current);
					H1Start.setMonth( 0 ); H1Start.setDate( 1 ); H1Start.setHours( 0,0,0,0 );
					
					var H2Start = new Date(options.current);
					H2Start.setMonth( 6 ); H2Start.setDate( 1 ); H2Start.setHours( 0,0,0,0 );

					var H2End = new Date( options.current );
                    H2End.setMonth( 11 + 1  ); H2End.setDate( 1 ); H2End.setHours( 0,0,0,0 );
					
					for ( var halfyearIndex = 0; halfyearIndex < data.data.length; halfyearIndex++ )
					{
						data.halfyears[ halfyearIndex ] = { 'classname': [] };

						var fromUser = options.onRender(date);
						var match = false;
						var current = false;
						
						if (halfyearIndex == 0) {
						    if (options.date >= H1Start.valueOf() && options.date < H2Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= H1Start.valueOf() && currentDate.valueOf() < H2Start.valueOf() ) { current = true; }
						}
						else if (halfyearIndex == 1) {
						    if (options.date >= H2Start.valueOf() && options.date < H2End.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= H2Start.valueOf() && currentDate.valueOf() < H2End.valueOf() ) { current = true; }
						}
												
						if (fromUser.selected || ( match )) {
							data.halfyears[ halfyearIndex ].classname.push( 'datepickerSelected' );
						}
						
						if (current) {
							data.halfyears[ halfyearIndex ].classname.push( 'datepickerCurrent' );
						}
						
						if (fromUser.disabled) {
							data.halfyears[ halfyearIndex ].classname.push('datepickerDisabled');
						}

						data.halfyears[ halfyearIndex ].classname = data.halfyears[ halfyearIndex ].classname.join( ' ' );
						
					}
					
					html = tmpl(tpl.halfyears.join(''), data) + html;
					
					
					
					// ########### //
					// # SEASONS # //
					// ########### //
					//var seasonDow = tblCal.find('thead tr:first th:eq(1) a span').text();
					//date = new Date(options.current);
					//date.addMonths(-currentCal + i);
					//date.setDate( 1 );
					//date.setFullYear(seasonDow);
					//var current = date.valueOf();				

					data = {
						data: options.locale.seasonsShort,
						className: 'viewSeasons',
						seasons: []
					}
					
					var SSStart = new Date( options.current );
					SSStart.setMonth( 0 ); SSStart.setDate( 1 ); SSStart.setHours( 0,0,0,0 ); // should be SSSTART Months 3 - 6 

					var SWStart = new Date( options.current );
					SWStart.setMonth( 10 ); SWStart.setDate( 1 ); SWStart.setHours( 0,0,0,0 );

					var SWEnd = new Date( options.current );
                    SWEnd.setMonth( 11 + 1  ); SWEnd.setDate( 1 ); SWEnd.setHours( 0,0,0,0 ); // should be SWStart Months 10 - 6
					
					for ( var seasonIndex = 0; seasonIndex < data.data.length; seasonIndex++ )
					{
						data.seasons[ seasonIndex ] = { 'classname': [] };

						var fromUser = options.onRender(date);
						var match = false;
						var current = false;
												
						if (seasonIndex == 0) {
						    if (options.date >= SSStart.valueOf() && options.date < SWStart.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SSStart.valueOf() && currentDate.valueOf() < SWStart.valueOf() ) { current = true; }
						}
						else if (seasonIndex == 1) {
						    if (options.date >= SWStart.valueOf() && options.date < SWEnd.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SWStart.valueOf() && currentDate.valueOf() < SWEnd.valueOf() ) { current = true; }
						}
																		
						if (fromUser.selected || ( match )) {
							data.seasons[ seasonIndex ].classname.push( 'datepickerSelected' );
						}
						
						if (current) {
							data.seasons[ seasonIndex ].classname.push( 'datepickerCurrent' );
						}
						
						if (fromUser.disabled) {
							data.seasons[ seasonIndex ].classname.push('datepickerDisabled');
						}

						data.seasons[ seasonIndex ].classname = data.seasons[ seasonIndex ].classname.join( ' ' );
						
					}
					
					html = tmpl(tpl.seasons.join(''), data) + html;
					
					
					// ############### //
					// # HALFSEASONS # //
					// ############## //

					data = {
						data: options.locale.halfseasonsShort,
						className: 'viewHalfSeasons',
						halfseasons: []
					}
					
                    var SSH1Start = new Date(options.current);
					SSH1Start.setMonth( 0 ); SSH1Start.setDate( 1 ); SSH1Start.setHours( 0,0,0,0 );
					
					var SSH2Start = new Date(options.current);
					SSH2Start.setMonth( 3 ); SSH2Start.setDate( 1 ); SSH2Start.setHours( 0,0,0,0 );
                    
                    var SWH1Start = new Date(options.current);
					SWH1Start.setMonth( 6 ); SWH1Start.setDate( 1 ); SWH1Start.setHours( 0,0,0,0 );
					
					var SWH2Start = new Date(options.current);
					SWH2Start.setMonth( 9 ); SWH2Start.setDate( 1 ); SWH2Start.setHours( 0,0,0,0 );

					var SWH2End = new Date( options.current );
                    SWH2End.setMonth( 11 + 1 ); SWH2End.setDate( 1 ); SWH2End.setHours( 0,0,0,0 );
					
					for ( var halfseasonIndex = 0; halfseasonIndex < data.data.length; halfseasonIndex++ )
					{
						data.halfseasons[ halfseasonIndex ] = { 'classname': [] };

						var fromUser = options.onRender(date);
						var match = false;
						var current = false;
						
						if (halfseasonIndex == 0) {
						    if (options.date >= SSH1Start.valueOf() && options.date < SSH2Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SSH1Start.valueOf() && currentDate.valueOf() < SSH2Start.valueOf() ) { current = true; }
						}
						else if (halfseasonIndex == 1) {
						    if (options.date >= SSH2Start.valueOf() && options.date < SWH1Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SSH2Start.valueOf() && currentDate.valueOf() < SWH1Start.valueOf() ) { current = true; }
						}
						else if (halfseasonIndex == 2) {
						    if (options.date >= SWH1Start.valueOf() && options.date < SWH2Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SWH1Start.valueOf() && currentDate.valueOf() < SWH2Start.valueOf() ) { current = true; }
						}
						else if (halfseasonIndex == 3) {
						    if (options.date >= SWH2Start.valueOf() && options.date < SWH2End.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= SWH2Start.valueOf() && currentDate.valueOf() < SWH2End.valueOf() ) { current = true; }
						}
						
						if (fromUser.selected || ( match ) ) {
							data.halfseasons[ halfseasonIndex ].classname.push( 'datepickerSelected' );
						}
						
						if (current) {
							data.halfseasons[ halfseasonIndex ].classname.push( 'datepickerCurrent' );
						}
						
						if (fromUser.disabled) {
							data.halfseasons[ halfseasonIndex ].classname.push('datepickerDisabled');
						}

						data.halfseasons[ halfseasonIndex ].classname = data.halfseasons[ halfseasonIndex ].classname.join( ' ' );
					}
					
					html = tmpl(tpl.halfseasons.join(''), data) + html;
					
					
					
					// ############ //
					// # QUARTALS # //
					// ############ //
					//var quarterDow = tblCal.find('thead tr:first th:eq(1) a span').text();
					//date = new Date(options.current);
					//date.addMonths(-currentCal + i);
					//date.setDate( 1 );
					//date.setFullYear(quarterDow);
					//var current = date.valueOf();
					//var quarter = new Date(); quarter.setDate( 1 ); quarter.setHours( 0,0,0,0 ); quarter.setFullYear( quarterDow );

					data = {
						data: options.locale.quartersShort,
						className: 'viewQuarters',
						quarters: []
					}
					
                    var Q1Start = new Date(options.current);
					Q1Start.setMonth( 0 ); Q1Start.setDate( 1 ); Q1Start.setHours( 0,0,0,0 );
					
					var Q2Start = new Date(options.current);
					Q2Start.setMonth( 3 ); Q2Start.setDate( 1 ); Q2Start.setHours( 0,0,0,0 );
                    
                    var Q3Start = new Date(options.current);
					Q3Start.setMonth( 6 ); Q3Start.setDate( 1 ); Q3Start.setHours( 0,0,0,0 );
					
					var Q4Start = new Date(options.current);
					Q4Start.setMonth( 9 ); Q4Start.setDate( 1 ); Q4Start.setHours( 0,0,0,0 );

					var Q4End = new Date( options.current );
                    Q4End.setMonth( 11 + 1 ); Q4End.setDate( 1 ); Q4End.setHours( 0,0,0,0 );
					
					for ( var quarterIndex = 0; quarterIndex < data.data.length; quarterIndex++ )
					{
						data.quarters[ quarterIndex ] = { 'classname': [] };

						var fromUser = options.onRender(date);
						var match = false;
						var current = false;
						
						if (quarterIndex == 0) {
						    if (options.date >= Q1Start.valueOf() && options.date < Q2Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= Q1Start.valueOf() && currentDate.valueOf() < Q2Start.valueOf() ) { current = true; }
						}
						else if (quarterIndex == 1) {
						    if (options.date >= Q2Start.valueOf() && options.date < Q3Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= Q2Start.valueOf() && currentDate.valueOf() < Q3Start.valueOf() ) { current = true; }
						}
						else if (quarterIndex == 2) {
						    if (options.date >= Q3Start.valueOf() && options.date < Q4Start.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= Q3Start.valueOf() && currentDate.valueOf() < Q4Start.valueOf() ) { current = true; }
						}
						else if (quarterIndex == 3) {
						    if (options.date >= Q4Start.valueOf() && options.date < Q4End.valueOf() ) { match = true; }
						    if (currentDate.valueOf() >= Q4Start.valueOf() && currentDate.valueOf() < Q4End.valueOf() ) { current = true; }
						}
						
						if (fromUser.selected || ( match ) ) {
							data.quarters[ quarterIndex ].classname.push( 'datepickerSelected' );
						}
						
						if (current) {
							data.quarters[ quarterIndex ].classname.push( 'datepickerCurrent' );
						}
						
						if (fromUser.disabled) {
							data.quarters[ quarterIndex ].classname.push('datepickerDisabled');
						}

						data.quarters[ quarterIndex ].classname = data.quarters[ quarterIndex ].classname.join( ' ' );
					}
					
					html = tmpl(tpl.quarters.join(''), data) + html;

					
					tblCal.append(html);
					
				    
				}
			},
			
			parseDate = function (date, format, options) {
				var season;
			
				function monthNameToIndex( monthName )
				{
					var months = defaults.locale.monthsShort;
				
					var index;
					for ( index = 0; index < months.length; index++ )
					{
						if ( monthName == months[ index ] ) return index;
					}
				}
				
				if (date.constructor == Date) {
					return new Date(date);
				}

				var parts = date.split(/\W+/);
				var against = format.split(/\W+/), d, m, y, h, min, w, now = new Date();
				for (var i = 0; i < parts.length; i++) {
					switch (against[i]) {
						case 'b':
							m = monthNameToIndex( parts[i]);
							break;
						case 'd':
						case 'e':
							d = parseInt(parts[i],10);
							break;
						case 'm':								
						case 'n':
							m = parseInt(parts[i], 10) - 1;
							break;
						case 'Y':
						case 'y':
							y = parseInt(parts[i], 10);
							y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
							break;
						case 'h': if (parts[i] == 'H1') { 
							if (season == 'SS') {
								m = 0;
							} else if(season == 'SW') {
								m = 6;
							} else {
								m = 0;
							}
						} else if (parts[i] == 'H2') { 
							if (season == 'SS') {
								m = 3;
							} else if(season == 'SW') {
								m = 9;
							} else {
								m = 6;
							}
						} break;
						case 'H':
						case 'I':
						case 'k':
						case 'l':
							h = parseInt(parts[i], 10);
							break;
						case 'P':
						case 'p':
							if (/pm/i.test(parts[i]) && h < 12) {
								h += 12;
							} else if (/am/i.test(parts[i]) && h >= 12) {
								h -= 12;
							}
							break;
						case 'w': w = parseInt(parts[i], 10); 
							break;
						case 't': if (parts[i] == 'SS') { m = 3; season = 'SS' } else if (parts[i] == 'SW') { m = 10; season = 'SW' } break;
						case 'q': if (parts[i] == 'Q1') { m = 0 } else if (parts[i] == 'Q2') { m = 3 } else if (parts[i] == 'Q3') { m = 6 } else if (parts[i] == 'Q4') { m = 9 } break;
						case 'M':
							min = parseInt(parts[i], 10);
							break;
					}
				}
				
				if ((options.newFormat || options.formatId) == 'week') {
					date = YearWeekDay2Date([(y === undefined ? now.getFullYear() : y),(w === undefined ? now.getWeekNumber() : w), 1 ]);
					return date;
				} else {
					return new Date(
						y === undefined ? now.getFullYear() : y,
						m === undefined ? now.getMonth() : m,
						d === undefined ? now.getDate() : d,
						h === undefined ? now.getHours() : h,
						min === undefined ? now.getMinutes() : min,
						0
					);
				}
			},
			formatDate = function(date, format, newFormat) {
				var m = date.getMonth();
				var d = date.getDate();
				var y = date.getFullYear();
				var wn = date.getWeekNumber();
				var w = date.getDay();
				var s = {};
				var hr = date.getHours();
				var pm = (hr >= 12);
				var ir = (pm) ? (hr - 12) : hr;
				var dy = date.getDayOfYear();
				var halfyear = date.getMonth() >= 0 && date.getMonth() < 6 ? '1' : '2';
				
				var season = date.getMonth() >= 3 && date.getMonth() < 10 ? 'S' : 'W';
				var halfseasonFromSeason = date.getMonth() >= 0 && date.getMonth() < 6 ? ( date.getMonth() >= 0 && date.getMonth() < 3 ? 'S' : 'S' ) : ( date.getMonth() >= 6 && date.getMonth() < 9 ? 'W' : 'W' );
				var halfseasonFromHalfyear = date.getMonth() >= 0 && date.getMonth() < 6 ? ( date.getMonth() >= 0 && date.getMonth() < 3 ? '1' : '2' ) : ( date.getMonth() >= 6 && date.getMonth() < 9 ? '1' : '2' );
				var quarter = date.getMonth() >= 0 && date.getMonth() < 6 ? ( date.getMonth() >= 0 && date.getMonth() < 3 ? '1' : '2' ) : ( date.getMonth() >= 6 && date.getMonth() < 9 ? '3' : '4' );
				if (ir == 0) {
					ir = 12;
				}
				var min = date.getMinutes();
				var sec = date.getSeconds();
				var parts = format.split(''), part;
				for ( var i = 0; i < parts.length; i++ ) {
					part = parts[i];
					switch (parts[i]) {
						case 'a':
							part = date.getDayName();
							break;
						case 'A':
							part = date.getDayName(true);
							break;
						case 'b':
							part = date.getMonthName();
							break;
						case 'B':
							part = date.getMonthName(true);
							break;
						case 'C':
							part = 1 + Math.floor(y / 100);
							break;
						case 'd':
							part = (d < 10) ? ("0" + d) : d;
							break;
						case 'e':
							part = d;
							break;
						case 'H':
							part = (hr < 10) ? ("0" + hr) : hr;
							break;
						case 'I':
							part = (ir < 10) ? ("0" + ir) : ir;
							break;
						case 'j':
							part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
							break;
						case 'k':
							part = hr;
							break;
						case 'l':
							part = ir;
							break;
						case 'm':
							part = (m < 9) ? ("0" + (1+m)) : (1+m);
							break;
						case 'M':
							part = (min < 10) ? ("0" + min) : min;
							break;
						case 'n':	
							part = (1+m);
							break; 
						case 'p':
						case 'P':
							part = pm ? "PM" : "AM";
							break;
						case 'q': part = "Q" + quarter;
							break;
						case 't': part = "S" + (newFormat && newFormat == 'halfseason' ? halfseasonFromSeason : season);
							break;
						case 'h': part = "H" + (newFormat && newFormat == 'halfseason' ? halfseasonFromHalfyear : halfyear);
							break;
						case 's':
							part = Math.floor(date.getTime() / 1000);
							break;
						case 'S':
							part = (sec < 10) ? ("0" + sec) : sec;
							break;
						case 'u':
							part = w + 1;
							break;
						case 'w':
							part = w;
							break;
						case 'y':
							part = ('' + y).substr(2, 2);
							break;
						case 'Y':
							part = y;
							break;
					}
					parts[i] = part;
				}
				return parts.join('');
			},
			extendDate = function(options) {
				if (Date.prototype.tempDate) {
					return;
				}
				Date.prototype.tempDate = null;
				Date.prototype.months = options.months;
				Date.prototype.monthsShort = options.monthsShort;
				Date.prototype.days = options.days;
				Date.prototype.daysShort = options.daysShort;
				Date.prototype.getMonthName = function(fullName) {
					return this[fullName ? 'months' : 'monthsShort'][this.getMonth()];
				};
				Date.prototype.getDayName = function(fullName) {
					return this[fullName ? 'days' : 'daysShort'][this.getDay()];
				};
				Date.prototype.addDays = function (n) {
					this.setDate(this.getDate() + n);
					this.tempDate = this.getDate();
				};
				Date.prototype.addMonths = function (n) {
					if (this.tempDate == null) {
						this.tempDate = this.getDate();
					}
					this.setDate(1);
					this.setMonth(this.getMonth() + n);
					this.setDate(Math.min(this.tempDate, this.getMaxDays()));
				};
				Date.prototype.addYears = function (n) {
					if (this.tempDate == null) {
						this.tempDate = this.getDate();
					}
					this.setDate(1);
					this.setFullYear(this.getFullYear() + n);
					this.setDate(Math.min(this.tempDate, this.getMaxDays()));
				};
				Date.prototype.getMaxDays = function() {
					var tmpDate = new Date(Date.parse(this)),
						d = 28, m;
					m = tmpDate.getMonth();
					d = 28;
					while (tmpDate.getMonth() == m) {
						d ++;
						tmpDate.setDate(d);
					}
					return d - 1;
				};
			},
			YearWeekDay2Date = function (AYWD) { // Arg : ISO 8601 : [Y, W, D]
				 var DOb = new Date(+AYWD[0], 0, 3)  // Jan 3
				 if (isNaN(DOb)) return false
				 DOb.setDate( 3 - DOb.getDay() + (AYWD[1]-1)*7 + +AYWD[2] )
				 return DOb; 
			},
			layout = function (el) {
				var options = $(el).data('datepicker');
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
				
				if (el.hasClass('dropDown closed')) {
					el.removeClass('closed').addClass('opened');
				} else if (el.hasClass('dropDown opened')) {
					el.removeClass('opened').addClass('closed');
				}
				
				if (el.is('a')) {
					ev.target.blur();
					if (el.hasClass('datepickerDisabled')) {
						return false;
					}
					var options = $(this).data('datepicker');
					var parentEl = el.parent();
					var cal = $('#' + options.id);
					var tblEl = parentEl.parent().parent().parent();
					var tblIndex = $('table', this).index(tblEl.get(0)) - 1;
					var tmp = new Date(options.current);
					var changed = false;
					var fillIt = false;
					if (parentEl.is('th') && !parentEl.hasClass('headline')) {
					
						if ((options.view == 'days' && tblEl.hasClass('week')) && !parentEl.hasClass('datepickerGoPrev') && !parentEl.hasClass('headline') && !parentEl.hasClass('datepickerGoNext')) 	{
							var wk = tblEl.find('thead tr.datepickerDoW th.datepickerDoWView span span').text();
							var year = el.next('span').text();
							var modDate = wk +' '+ el.text() +' '+ year;
							options.newFormat = 'week';
							options.dayWeek = false;
							options.onChange.apply(this, [modDate, false, options.newFormat, options.el]);
							closePicker(cal, options);
						} else if ((options.view == 'days' && tblEl.hasClass('dayWeek')) && !parentEl.hasClass('datepickerGoPrev') && !parentEl.hasClass('headline') && !parentEl.hasClass('datepickerGoNext')) {
							var wk = tblEl.find('thead tr.datepickerDoW th.datepickerDoWView span span').text();
							var year = el.next('span').text();
							var modDate = wk +' '+ el.text() +' '+ year;
							options.newFormat = 'week';
							options.dayWeek = true;
							options.onChange.apply(this, [modDate, false, options.newFormat, options.el]);
							closePicker(cal, options);
						}
						
						if (parentEl.parent().parent().is('thead')) {
						
							switch (tblEl.get(0).className) {
								case 'day':
									options.current.addMonths(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'day';
									options.dayWeek = false;
									break;
								case 'week':
									options.current.addMonths(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'week';
									options.dayWeek = false;
									break;
								case 'dayWeek':
									options.current.addMonths(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'week';
									options.dayWeek = true;
									break;
								case 'month':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'month';
									options.dayWeek = false;
									break;
								case 'year':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -12 : 12);
									options.newFormat = 'year';
									options.dayWeek = false;
									break;
								case 'halfyear':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'halfyear';
									options.dayWeek = false;
									break;
								case 'season':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'season';
									options.dayWeek = false;
									break;
								case 'halfseason':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'halfseason';
									options.dayWeek = false;
									break;
								case 'quarter':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									options.newFormat = 'quarter';
									options.dayWeek = false;
									break;
							}
							
							fillIt = true;
						}
							
					} else if (parentEl.hasClass('headline') && options.formats == false) {
						tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
						
						switch (tblEl.get(0).className) {
						
							case 'day':
								tblEl.get(0).className = 'month';
								el.find('span').text(tmp.getFullYear());
								break;
								
							case 'month':
								if (options.view == 'days' || options.view == 'months') 
								{		
									tblEl.get(0).className = 'year';
									el.find('span').text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
								}							
								break;
								
							case 'year':
								if (options.view == 'days' || ( options.view == 'months' && (tblEl.get(0).className == 'month' ))) 
								{
									tblEl.get(0).className = 'day';
									el.find('span').text(formatDate(tmp, 'B, Y'));
								} 
								else if (options.view == 'months' && (tblEl.get(0).className == 'year')) 
								{
									tblEl.get(0).className = 'month';
									el.find('span').text(formatDate(tmp, 'Y'));					
								}																										
								break;
								
							case 'halfyear':
								if (options.view == 'halfyear') 
								{											

								}																											
								break;
								
							case 'season':
								if (options.view == 'seasons') 
								{											

								}																											
								break;
								
							case 'halfseason':
								if (options.view == 'halfseasons') 
								{											

								}																											
								break;
								
							case 'quarter':
								if (options.view == 'quartals') 
								{											

								}																											
								break;
							}
				
					} else if (parentEl.is('li')) {
					
						var tblCal = cal.find('.container table');
						var dropDown = parentEl.parent().parent().parent().parent();
						var list = parentEl.parent().children('li');
						var tblspan = tblCal.find('thead tr:first th:eq(1) a span');
						var format = parentEl.attr('format');
						
						switch (format) {
							case 'day':									
								tblCal.attr('class', '').addClass('day');
								dropDown.removeClass('opened').addClass('closed');	
								resetList(list);	
								parentEl.addClass('selected');	
								tblspan.text(formatDate(tmp, 'B, Y'));
								options.view = 'days';	
								break;
							case 'week':									
								tblCal.attr('class', '').addClass('week');
								dropDown.removeClass('opened').addClass('closed');	
								resetList(list);	
								parentEl.addClass('selected');	
								tblspan.text(formatDate(tmp, 'B, Y'));
								options.view = 'days';	
								break;
							case 'dayWeek':									
								tblCal.attr('class', '').addClass('dayWeek');
								dropDown.removeClass('opened').addClass('closed');	
								resetList(list);	
								parentEl.addClass('selected');	
								tblspan.text(formatDate(tmp, 'B, Y'));
								options.view = 'days';	
								break;
							case 'month':									
								tblCal.attr('class', '').addClass('month');
								dropDown.removeClass('opened').addClass('closed');	
								resetList(list);	
								parentEl.addClass('selected');	
								tblspan.text(tmp.getFullYear());
								options.view = 'months';	
								break;
							case 'year':									
								tblCal.attr('class', '').addClass('year');
								dropDown.removeClass('opened').addClass('closed');
								resetList(list);	
								parentEl.addClass('selected');
								tblspan.text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
								options.view = 'years';	
								break;
							case 'halfyear':									
								tblCal.attr('class', '').addClass('halfyear');
								dropDown.removeClass('opened').addClass('closed');
								resetList(list);	
								parentEl.addClass('selected');
								tblspan.text(tmp.getFullYear());
								options.view = 'halfyears';
								break;
							case 'season':									
								tblCal.attr('class', '').addClass('season');
								dropDown.removeClass('opened').addClass('closed');
								resetList(list);	
								parentEl.addClass('selected');
								tblspan.text(tmp.getFullYear());
								options.view = 'seasons';
								break;
							case 'halfseason':									
								tblCal.attr('class', '').addClass('halfseason');
								dropDown.removeClass('opened').addClass('closed');
								resetList(list);	
								parentEl.addClass('selected');
								tblspan.text(tmp.getFullYear());
								options.view = 'halfseasons';
								break;
							case 'quarter':									
								tblCal.attr('class', '').addClass('quarter');
								dropDown.removeClass('opened').addClass('closed');
								resetList(list);	
								parentEl.addClass('selected');
								tblspan.text(tmp.getFullYear());
								options.view = 'quarters';
						}
					
					} else if (parentEl.is('td') && !parentEl.hasClass('datepickerDisabled')) {
					
						switch (tblEl.get(0).className) {
						
						    case 'week':										
						    	break;
						
							case 'month':								
								options.current.setMonth(tblEl.find('tbody.viewMonths td').index(parentEl));
								options.current.setFullYear(parseInt(tblEl.find('thead th.headline span').text(), 10));
								options.current.addMonths(Math.floor(options.calendars/2) - tblIndex);
																
								var modDate = options.current; 	
								options.dayWeek = false;
																			
								if (options.view == 'months') 
								{
									options.newFormat = 'month';
									options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
									closePicker(cal, options);
								}								
								else if (options.view == 'days') 
								{		
									options.newFormat = 'day';	
									tblEl.get(0).className = 'day';			
								}	
								
								if (options.formats) {
									options.format = options.settings["month"].format;	
								}
																					
								break;
								
							case 'year':
								options.current.setFullYear(parseInt(el.text(), 10));
								
								var modDate = options.current; 	
								options.dayWeek = false;
																		
								if (options.view == 'years') 
								{
									options.newFormat = 'year';		
									options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));				
									closePicker(cal, options);									
								}														
								else if (options.view == 'months' || options.view == 'days') 
								{	
									options.newFormat = 'month';	
									tblEl.get(0).className = 'month';
								}	
								
								if (options.formats) {
									options.format = options.settings["year"].format;
								}	

								break;
							
							case 'halfyear':
								if (el.text() == 'H1') {
									options.current.setMonth(0);
								} else {
									options.current.setMonth(6);
								}
								options.current.setDate(1);
								options.current.setFullYear(parseInt(tblEl.find('thead th.headline span').text(), 10));
								
								options.newFormat = 'halfyear';	
								options.dayWeek = false;	
							
								var modDate = options.current; 	
								
								if (options.formats) {
									options.format = options.settings["halfyear"].format;	
								}
								
								options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
								closePicker(cal, options);

								break;
								
							case 'season':
								if (el.text() == 'SS') {
									options.current.setMonth(3);
								} else {
									options.current.setMonth(10);
								}
								options.current.setDate(1);
								options.current.setFullYear(parseInt(tblEl.find('thead th.headline span').text(), 10));
								
								options.newFormat = 'season';	
								options.dayWeek = false;	
							
								var modDate = options.current; 	
								
								if (options.formats) {
									options.format = options.settings["season"].format;	
								}
								
								options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
								closePicker(cal, options);

								break;
								
							case 'halfseason':
								if (el.text() == 'SS H1') {
									options.current.setMonth(0);
								} 
								else if (el.text() == 'SS H2') {
									options.current.setMonth(3);
								}
								else if (el.text() == 'SW H1') {
									options.current.setMonth(6);
								}
								else if (el.text() == 'SW H2') {
									options.current.setMonth(9);
								}
								options.current.setDate(1);
								options.current.setFullYear(parseInt(tblEl.find('thead th.headline span').text(), 10));	
								
								var modDate = options.current; 	
								options.newFormat = 'halfseason';	
								options.dayWeek = false;				
								
								if (options.formats) {
									options.format = options.settings["halfseason"].format;	
								}
								
								options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
								closePicker(cal, options);

								break;
								
							case 'quarter':
								if (el.text() == 'Q1') {
									options.current.setMonth(0);
								} 
								else if (el.text() == 'Q2') {
									options.current.setMonth(3);
								}
								else if (el.text() == 'Q3') {
									options.current.setMonth(6);
								}
								else if (el.text() == 'Q4') {
									options.current.setMonth(9);
								}
								options.current.setDate(1);
								options.current.setFullYear(parseInt(tblEl.find('thead th.headline span').text(), 10));	
								
								var modDate = options.current; 	
								options.newFormat = 'quarter';	
								options.dayWeek = false;				
								
								if (options.formats) {
									options.format = options.settings["quarter"].format;	
								}
								
								options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
								closePicker(cal, options);

								break;

							default:
									
								var val = parseInt(el.text(), 10);
								tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
								
								if (parentEl.hasClass('datepickerNotInMonth')) {
									tmp.addMonths(val > 15 ? -1 : 1);
								}
								
								tmp.setDate(val);
								
								options.current.setDate(val);	
								var modDate = tmp;	
								
								if(options.formats) {
									options.format = options.settings["day"].format;
								}	
								options.newFormat = 'day';	
								
								if (tblEl.get(0).className == 'dayWeek') {
									options.dayWeek = true;
								} else {
									options.dayWeek = false;
								}
								
								options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));
								closePicker(cal, options);
												
								switch (options.mode) {
									case 'multiple':
										val = (tmp.setHours(0,0,0,0)).valueOf();
										if ($.inArray(val, options.date) > -1) {
											$.each(options.date, function(nr, dat){
												if (dat == val) {
													options.date.splice(nr,1);
													return false;
												}
											});
										} else {
											options.date.push(val);
										}
										break;
									case 'range':
										if (!options.lastSel) {
											options.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
										}
										val = (tmp.setHours(23,59,59,0)).valueOf();
										if (val < options.date[0]) {
											options.date[1] = options.date[0] + 86399000;
											options.date[0] = val - 86399000;
										} else {
											options.date[1] = val;
										}
										options.lastSel = !options.lastSel;
										break;
									default:
										options.date = tmp.valueOf();
										break;
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
						//options.onChange.apply(this, prepareDate(options, modDate, false,  options.newFormat));			
					}
				}
				return false;
			},
			
			resetList = function (list) {
				$.each(list, function() { $(this).removeClass('selected') } );
			},
			
			closePicker = function (cal, options) {
				var options = options;																													//
		 		cal.hide();
		 		if (options) options.onHide.apply(this); 																										//									
			},
			
			prepareDate = function (options, modDate, fromUnit, newFormat) {
				var tmp;
				var tmpFormat;
				if (options.mode == 'single') {
					tmp = modDate;	

						if (options.newFormat == 'month') { 
							tmpFormat = 'n.Y';
						} else if (options.newFormat == 'year') {
							tmpFormat = 'Y';
						} else  {
							tmpFormat = options.format;
						}
						
					return [formatDate(tmp, tmpFormat, newFormat), tmp, newFormat, options.el];
					
				} else {
					tmp = [[],[], options.el];
					$.each(options.date, function(nr, val){
						var date = new Date(val);
						tmp[0].push(formatDate(date, options.format));
						tmp[1].push(date);
					});
					return tmp;
				}
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
				var cal = $('#' + $(this).data('datepickerId'));
				if (!cal.is(':visible')) {
					
					var calEl = cal.get(0);
					var $calView = cal.find('table').eq(0);
					$calView.removeClass('multiple').removeClass('year');

					var options = cal.data('datepicker');
					
					fill(calEl);

					if (options.formats) {
						var $dropdown = $('<div class="dropDown closed"></div>')
						cal.find('th.headline').find('.dropDown').remove().end().append($dropdown);
						$dropdown.empty().append(setDropDown(options));
						$calView.addClass('multiple');
					}
					
					//if(options.formatId == 'year') {
					//	$calView.addClass('year');
					//}
					
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
			
			sizeIECorr = function(calIE) {
		        var shadowWidth = calIE.children('.datepickerContainer').width();
		        var shadowHeight = calIE.children('.datepickerContainer').height();
		        
		        calIE.find('.shadowbox .shadow_l, .shadowbox .shadow_r').each(function(){
		       		$(this).height(shadowHeight - 2); 
				});
		        calIE.find('.shadowbox .shadow_t, .shadowbox .shadow_b').each(function(){
		       		$(this).width(shadowWidth);        
				});
		    };
		    
		return {
			init: function(options){
				options = $.extend({}, defaults, options||{});
				extendDate(options.locale);
				options.calendars = Math.max(1, parseInt(options.calendars,10)||1);
				options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
				return this.each(function(){
					if (!$(this).data('datepicker')) {
						options.el = this;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format, options);
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format, options).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (!options.current) {
							options.current = new Date();
						} else {
							options.current = parseDate(options.current, options.format, options);
						} 
						options.current.setDate(1);
						options.current.setHours(0,0,0,0);
						var id = 'datepicker_' + parseInt(Math.random() * 1000), cnt;
						options.id = id;
						$(this).data('datepickerId', options.id);
						var cal = $(tpl.wrapper).attr('id', id).bind('click', click).data('datepicker', options);
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
									week: options.locale.weekMin,
									prev: options.prev,
									next: options.next,
									day1: options.locale.daysMin[(cnt++)%7],
									day2: options.locale.daysMin[(cnt++)%7],
									day3: options.locale.daysMin[(cnt++)%7],
									day4: options.locale.daysMin[(cnt++)%7],
									day5: options.locale.daysMin[(cnt++)%7],
									day6: options.locale.daysMin[(cnt++)%7],
									day7: options.locale.daysMin[(cnt++)%7]
								});
						}
						cal
							.find('tr:first').append(html)
								.find('table').addClass(views[options.view]);
						fill(cal.get(0));
						if (options.flat) {
							cal.appendTo(this).show().css('position', 'relative');
							layout(cal.get(0));
						} else {
							cal.appendTo('#content');
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('datepickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('datepickerId')) {
						if ($.browser.msie) {																						
							ev.data.cal.children('.shadowbox').hide().end().children('.datepickerContainer').fadeOut(250, function(){ev.data.cal.hide();} );
						} else {																															
						 	ev.data.cal.fadeOut(250);																										
						}																																
					}
				});
			},
			setDate: function(date, shiftTo){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
						options.date = date;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, (options.newFormat ? options.settings[options.newFormat].format : options.format), options);
							//options.date.setDate(1)[
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format, options).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (shiftTo) {
							options.current = new Date (options.date);
						}
						fill(cal.get(0));
					}
				});
			},
			getDate: function(formated) {
				if (this.size() > 0) {
					return prepareDate($('#' + $(this).data('datepickerId')).data('datepicker'))[formated ? 0 : 1];
				}
			},
			clear: function(){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
						if (options.mode != 'single') {
							options.date = [];
							fill(cal.get(0));
						}
					}
				});
			},
			fixLayout: function(){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
						if (options.flat) {
							layout(cal.get(0));
						}
					}
				});
			}
		};
	}();
	$.fn.extend({
		DatePicker: DatePicker.init,
		DatePickerHide: DatePicker.hidePicker,
		DatePickerShow: DatePicker.showPicker,
		DatePickerSetDate: DatePicker.setDate,
		DatePickerGetDate: DatePicker.getDate,
		DatePickerClear: DatePicker.clear,
		DatePickerLayout: DatePicker.fixLayout
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