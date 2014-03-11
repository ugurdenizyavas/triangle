/*
	File: format.js
	Purpose: Client sided checks for inputs.
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.format =
	{
		id: 'format',
	
		
		check: check,
		filterNumber: filterNumber,
		checkNumber: checkNumber,
		checkTime: checkTime,
		toDate: toDate,
		
		toNewTimeFormat: toNewTimeFormat,
		toTimeConversion: toTimeConversion,
		fromTimeConversion: fromTimeConversion,
	
		// Todo
	
		checkURL:   function() { return notImplemented('checkURL'); }, 
		checkURI:   function() { return notImplemented('checkURI'); }, 
		checkMail:  function() { return notImplemented('checkMail'); }, 
		checkPhone: function() { return notImplemented('checkPhone'); }, 
		checkPath:  function() { return notImplemented('checkPath'); }
	}

	function notImplemented(f) { id.error(me+f+' isn\'t implemented yet.', { type: id.format.id }); }
	
	// ---------------------------------------------------------------------------------------------- //
	// Formats
	// ---------------------------------------------------------------------------------------------- //

	var cos = { day: 'day', week: 'week', year: 'year', month: 'month', hourMinute: 'hourMinute', hour: 'hour', minute: 'minute', halfyear: 'halfyear', season: 'season', halfseason: 'halfseason', quarter: 'quarter' };

	var formats = 
	{ 
		number: /\d/, 										                           
		
		day: 
		{ 	
			// Standard Date Format (COS): [d]d.[m]m.yyyy
			
			standard:            { form: /^([0-3]?\d)\.([01]?\d)\.(\d{4})$/ },	   
			
			// Valid formats ..
			
			'[d]d.[m]m.[yyy]y':  { form: /^([0-3]?\d)[\.\-]([01]?\d)[\.\-](\d{1,4})$/ },	
			'[d]d.[m]m[.]':      { form: /^([0-3]?\d)[\.\-]([01]?\d)[\.\-]?$/, year: -1 },	
			'[d]d[.]':           { form: /^([0-3]?\d)[\.\-]?$/, month: -1, year: -1 },	
			
			'[d]dmon[yyy]y':     { form: /^([0-3]?\d)([A-Za-z]{3})(\d{1,4})$/ },
			'[d]dmon':           { form: /^([0-3]?\d)([A-Za-z]{3})$/, year: -1 },
			
			'[m]m/[d]d/[yyy]y':  { form: /^([01]?\d)\/([0-3]?\d)\/(\d{1,4})$/, day: 2, month: 1 }, 
			'[m]m/[d]d':         { form: /^([01]?\d)\/([0-3]?\d)$/, day: 2, month: 1, year: -1 }
		},

		week: 
		{ 	
			// Standard Date Format (COS): CW[w]w yyyy
			
			standard:	         { form: /^([cCkK][wW]?)\ ([0-5]?\d)\ (\d{4})$/ },
			
			// Valid formats ..
			
			'[CW][ ][w]w.[yyy]y':     { form: /^([cCkK]?[wW]?)[\ \-]?([0-5]?\d)[\.\-](\d{1,4})$/ },
			'[CW][ ][w]w[ ][yyy]y':   { form: /^([cCkK]?[wW]?)[\ \-]?([0-5]?\d)[\ \-](\d{1,4})$/ },
			'[CW][ ][w]w[.]':         { form: /^([cCkK]?[wW]?)[\ \-]?([0-5]?\d)[\.\-]?$/, year: -1 },
			'[CW][ ][w]w':		      { form: /^([cCkK]?[wW]?)[\ \-]?([0-5]?\d)$/,  year: -1 }
		},
		
		month: 
		{ 	
			// Standard Date Format (COS): [m]m.yyyy
			
			standard:	         { form: /^([01]?\d)\.(\d{4})$/ },
			
			// Valid formats ..
			
			'[m]m.[yyy]y':       { form: /^([0-3]?\d)[\.\-](\d{1,4})$/ },
			'[m]m[ ][yyy]y':     { form: /^([0-3]?\d)[\ \-](\d{1,4})$/ },
			'[m]m[.]':           { form: /^([0-3]?\d)[\.\-]?$/, year: -1 },
			'[m]m':		         { form: /^([0-3]?\d)$/, year: -1 },
			
			'mon[ ][yyy]y':      { form: /^([A-Za-z]{3})[\ \-]?(\d{1,4})$/ },
			'mon':		         { form: /^([A-Za-z]{3})$/, year: -1 }
		},

		year: 
		{ 	
			// Standard Date Format (COS): yyyy
			
			standard:	 { form: /^(\d{4})$/ },
			
			// Valid formats ..
			
			'[yyy]y': { form: /^(\d{1,4})$/ }
	
		},
		
		halfyear: 
		{ 	
			// Standard Date Format (COS): qq yyyy
			
			standard:	         { form: /^([hH]?)([1-2])[\ \-](\d{4})$/ },

			// Valid formats ..

			'[H]h[ ][yyy]y':   { form: /^([hH]?)([1-2])[\ \-](\d{1,4})$/ },
			'[H]h':		      { form: /^([hH]?)([1-2])$/, year: -1, halfyear: -1 }
	
		},
		
		season: 
		{ 	
			// Standard Date Format (COS): ss yyyy
			
			standard:	         { form: /^([sS]?)([sSwW]{1})[\ \-](\d{4})$/ },
			
			// Valid formats ..
			
			'[S]s[ ][yyy]y':   { form: /^([sS]?)([sSwW]{1})[\ \-](\d{1,4})$/ },
			'[S]s':		      { form: /^([sS]?)([sSwW]{1})$/, year: -1 }
	
		},
		
		halfseason: 
		{ 	
			// Standard Date Format (COS): ss yyyy hh
			
			standard:	         { form: /^([sS]?)([sSwW]{1})[\ \-](\d{4})[\/\-]([hH]?)([1-2])$/ },
			
			// Valid formats ..
			
			'[S]s[ ][yyy]y':   { form: /^([sS]?)([sSwW]{1})[\ \-](\d{1,4})[\/\-]([hH]?)([1-2])$/ },
			'[S]s':		      { form: /^([sS]?)([sSwW]{1})$/, year: -1, halfyear: -1 }
	
		},
			
		quarter: 
		{ 	
			// Standard Date Format (COS): qq yyyy
			
			standard:	         { form: /^([qQ]?)([1-4])[\ \-](\d{4})$/ },

			// Valid formats ..

			'[Q]q[ ][yyy]y':   { form: /^([qQ]?)([1-4])[\ \-](\d{1,4})$/ },
			'[Q]q':		      { form: /^([qQ]?)([1-4])$/, year: -1 }
	
		},
		
		hourMinute: 
		{ 	
			// Standard Date Format (COS): hh:mm
					
			standard:	   		{ form: /^(\d{1,2})\:(\d{2})$/ },
					
			// Valid formats ..
					
			'[h]h:[m]m':    	{ form: /^(\d{1,2})[\:\-](\d{1,2})$/ },
			'[h]h[ ][m]m':  	{ form: /^(\d{1,2})[\ \-](\d{1,2})$/ },
			'[h]h[:]':    		{ form: /^(\d{1,2})[\:\-]?$/, minute: -1 },
			'[h]h':				{ form: /^(\d{1,2})$/, minute: -1 }
		},
		
		hour: 
		{ 	
			// Standard Date Format (COS): hh
					
			standard:	         { form: /^(\d{2})$/ },
					
			// Valid formats ..
					
			'[h]h': { form: /^(\d{1,2})$/ }
			
		},
		
		minute: 
		{ 	
			// Standard Date Format (COS): mm
					
			standard:	         { form: /^(\d{2})$/ },
					
			// Valid formats ..
					
			'[m]m': { form: /^(\d{1,2})$/ }
			
		}
	};
		
	var months = 0;
	var me = id.meOf(id.format);

	// ---------------------------------------------------------------------------------------------- //
	// Check
	// ---------------------------------------------------------------------------------------------- //

	function  check(obj)
	{
		switch (obj.type)
		{
			case cos.number: return checkNumber(obj.getPlace());
			case cos.time:   return checkTime(obj.getPlace());
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Number
	// ---------------------------------------------------------------------------------------------- //

	function checkNumber(that, options)
	{
		var pattern = formats.number;
		var value = $(that).val();

		if (value == '') return true;

		if (options) 
		{
			if (!options.leadingZero) value = Number(value);
			// ...
		}

		if (!pattern.test(value)) return false; 
		
		$(that).val(value);
		return true;
	}
	
	function filterNumber(e)
	{
		return id.key.isNumber(e.which) || id.key.isNavigation(e.which, { input: true });  
	}

	// ---------------------------------------------------------------------------------------------- //
	// Time Formats
	// ---------------------------------------------------------------------------------------------- //

	function checkTime(that, options) 
	{
		var format = options && options.format ? options.format : cos.day;
	
		switch (format)
		{	
			case cos.day:      	return checkDate(that, options);
			case cos.week:  	return checkWeekYear(that, options);
			case cos.month: 	return checkMonthYear(that, options);
			case cos.year:      return checkYear(that, options);
			
			case cos.halfyear:    return checkHalfyearYear(that, options);
			case cos.season:        return checkSeasonYear(that, options);
			case cos.halfseason:    return checkHalfSeasonYear(that, options);
			case cos.quarter:       return checkQuarterYear(that, options);
			
			case cos.hourMinute:	return checkHourMinute(that, options);
			case cos.hour:			return checkHour(that, options);
			case cos.minute:		return checkMinute(that, options);
		}
	}
	
	function toDate(that, options)
	{
		var format = options && options.format ? options.format : cos.day;
		var pattern = formats[format].standard.form;
		var parts, month = 0 /* January */, week, day = 1 /* first */;
	
		switch (format)
		{
			case	cos.day:
					parts = that.match(pattern);
					dp = new Date(yearOf(parts[3]), monthOf(parts[2])-1 /* starts with 0 ... */, dayOf(parts[1]));
					break;

			case	cos.week:
					parts = that.match(pattern);
					year = yearOf(parts[3]);
					week = weekOf(parts[2]);
					dp = dateOfWeekYear(week, year);
					break;

			case	cos.month:
					parts = that.match(pattern);
					dp = new Date(yearOf(parts[2]), monthOf(parts[1])-1 /* starts with 0 ... */, day);
					break;

			case	cos.year: 
					dp = new Date(yearOf(that), month, day);
					break;
			
			case	cos.halfyear:
					dp = new Date(yearOf(that), month, day);
					break;
					
			case	cos.season: 
					parts = that.match(pattern);
					year = yearOf(parts[2]);
					season = seasonOf(parts[1]);
					dp = season.substring(1, 2) +' '+ year;
					break;
					
			case	cos.halfseason: 
					parts = that.match(pattern);
					year = yearOf(parts[2]);
					season = seasonOf(parts[1]);
					dp = season.substring(1, 2) +' '+ year + 'H1' ;
					break;
					
			case	cos.quarter:
					dp = new Date(yearOf(that), month, day);
					break;
					
			case	cos.hourMinute: 
					parts = that.match(pattern);
					dp = hourOf(parts[1]) + ':' + minuteOf(parts[2]);
					break;
					
			case	cos.hour: 
					parts = that.match(pattern);
					dp = hourOf(parts[1]);
					break;
					
			case	cos.minute: 
					parts = that.match(pattern);
					dp = minuteOf(parts[2]);
					break;
		}
		
		return dp;
	}
	
	Date.prototype.toCOSDate = function(format)
	{
		switch (format)
		{
			case	cos.date:		return toDateStandard(this.getDate(), this.getMonth()+1, this.getFullYear());
			case	cos.week:		return toWeekYearStandard(this.getISOWeek(), this.getFullYear());
			case	cos.month:		return toDateStandard(this.getMonth()+1, this.getFullYear());
			case	cos.year:		return toDateStandard(this.getFullYear());
			
			case	cos.halfyear:	return toHalfyearYearStandard('H1', this.getFullYear());
			case	cos.season:		return toSeasonYearStandard('S', this.getFullYear());
			case	cos.halfseason:		return toHalfSeasonYearStandard('S', this.getFullYear());
			case	cos.quarter:	return toQuarterYearStandard('Q1', this.getFullYear());
			
			case	cos.hourMinute:	return toTimeStandard(this.getHours(), this.getMinutes());
			case	cos.hour:		return toHourStandard(this.getHours());
			case	cos.minute:		return toMinuteStandard(this.getMinutes());
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Date
	// ---------------------------------------------------------------------------------------------- //

	function checkDate(that, options)
	{
		var pattern = formats.day;
		var parts, day, month, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming date: '+i, { type: 'format' });

					day   = pattern[i].day   ? parts[pattern[i].day] : parts[1];
					month = pattern[i].month ? (pattern[i].month == -1 ? fillMonth() : parts[pattern[i].month]) : parts[2];
					year  = pattern[i].year  ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];

					if (!(value = toDateStandard(day, month, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2], parts[3])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;
		
		function isValid(day, month, year)
		{
			var days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			
			day = Number(day); month = Number(month);	year = Number(year);
			
			if (day < 1 || (day > (days[month] + (month == 2 && isLeapYear(year) ? 1 : 0)))) return false;
			if (month < 1 || month > 12) return false;
			
			return true;

			function isLeapYear(y) { return (y % 4 != 0 ? false : ( y % 100 != 0 ? true: ( y % 1000 != 0 ? false : true))); }
		}
	}
	
	function toDateStandard(day, month, year) 
	{ 
		return dayOf(day)+'.'+monthOf(month)+'.'+yearOf(year); 
	}


	// ---------------------------------------------------------------------------------------------- //
	// Week of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkWeekYear(that, options)
	{
		var pattern = formats.week;
		var parts, prefix, week, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming week of year: '+i, {type: 'format' });

					week = parts[2];
					year  = (pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3]);
					
					if (!(value = toWeekYearStandard(week, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(prefix, week, year)	{ return (prefix != weekPrefixOf() || week < 1 || week > 53) ? false : true; }
	}

	function toWeekYearStandard(week, year) 
	{ 
		return weekPrefixOf()+' '+weekOf(week)+' '+yearOf(year); 
	}

	// ---------------------------------------------------------------------------------------------- //
	// Month of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkMonthYear(that, options)
	{
		var pattern = formats.month;
		var parts, month, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming month of year: '+i, {type: 'format' });

					month = parts[1];
					year  = pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];

					if (!(value = toMonthYearStandard(month, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(month, year)	{ return (month < 1 || month > 12) ? false : true; }
	}
	

	function toMonthYearStandard(month, year) 
	{ 
		return monthOf(month)+'.'+yearOf(year); 
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Halfyear of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkHalfyearYear(that, options)
	{
		var pattern = formats.halfyear;
		var parts, prefix, halfyear, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming halfyear of year: '+i, { type: 'format' });

					halfyear = parseInt(parts[2]);
					year  = pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];

					if (!(value = toHalfyearYearStandard(halfyear, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2], parts[3])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(prefix, halfyear, year)	{ return (prefix.toUpperCase() != halfyearPrefixOf() || halfyear < 1 || halfyear > 2 ) ? false : true; }
	}

	function toHalfyearYearStandard(halfyear, year) 
	{ 
		return halfyearPrefixOf() + halfyearOf(halfyear)+' '+yearOf(year); 
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Season of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkSeasonYear(that, options)
	{
		var pattern = formats.season;
		var parts, prefix, season, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming season of year: '+i, { type: 'format' });

					season = parts[2];
					year  = pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];

					if (!(value = toSeasonYearStandard(season, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(prefix, season, year)	{ return (prefix.toUpperCase() != seasonPrefixOf() || (season.toUpperCase() != 'S' && season.toUpperCase() != 'W')) ? false : true; }
	}

	function toSeasonYearStandard(season, year) 
	{ 
		return seasonPrefixOf() + seasonOf(season) +' '+ yearOf(year); 
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Halfseason of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkHalfSeasonYear(that, options)
	{
		var pattern = formats.halfseason;
		var parts, prefix, season, year, halfyear;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming halfseason of year: '+i, { type: 'format' });

					season = parts[2];
					year  = pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];
					halfyear = pattern[i].halfyear ? (pattern[i].halfyear == -1 ? parseInt(fillHalfyear()) : parts[pattern[i].halfyear]) : parts[3];

					if (!(value = toHalfSeasonYearStandard(season, year, halfyear))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(prefix, season, year)	{ 
			return (prefix.toUpperCase() != seasonPrefixOf() || (season.toUpperCase() != 'S' && season.toUpperCase() != 'W')) ? false : true; 
		}
	}

	function toHalfSeasonYearStandard(season, year, halfyear) 
	{ 
		return seasonPrefixOf() + seasonOf(season) +' '+ yearOf(year) +'/'+ halfyearPrefixOf() + halfyearOf(halfyear); 
	}

	// ---------------------------------------------------------------------------------------------- //
	// Quarter of Year
	// ---------------------------------------------------------------------------------------------- //

	function checkQuarterYear(that, options)
	{
		var pattern = formats.quarter;
		var parts, prefix, quarter, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming quarter of year: '+i, { type: 'format' });

					quarter = parseInt(parts[2]);
					year  = pattern[i].year ? (pattern[i].year == -1 ? fillYear() : parts[pattern[i].year]) : parts[3];

					if (!(value = toQuarterYearStandard(quarter, year))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2], parts[3])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(prefix, quarter, year)	{ return (prefix.toUpperCase() != quarterPrefixOf() || quarter < 1 || quarter > 4 ) ? false : true; }
	}

	function toQuarterYearStandard(quarter, year) 
	{ 
		return quarterPrefixOf() + quarterOf(quarter)+' '+yearOf(year); 
	}
	
	
	// ---------------------------------------------------------------------------------------------- //
	// Year
	// ---------------------------------------------------------------------------------------------- //

	function checkYear(that, options)
	{
		var pattern = formats.year;
		var parts, year;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			// Transform valid dates ..
			// .. into standard date.

			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming year: '+i, {type: 'format' });

					year = parts[1];

					if (!(value = toYearStandard(year))) return false;
				}
				
				$(that).val(value);
				return true;
			}
		}

		return false;		
	}

		
	function toYearStandard(year) 
	{ 
		return yearOf(year); 
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Time : Hours and Minutes
	// ---------------------------------------------------------------------------------------------- //
	
	function checkHourMinute(that, options)
	{
		var pattern = formats.hourMinute;
		var parts, hour, minute;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming time: '+i, { type: 'format' });

					hour   = pattern[i].hour   ? parts[pattern[i].hour] : parts[1];
					minute = pattern[i].minute ? (pattern[i].minute == -1 ? fillMinute() : parts[pattern[i].minute]) : parts[2];
					
					if (!(value = toTimeStandard(hour, minute))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1], parts[2])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(hour, minute)	{ 
			if (hour < 0 || hour > 23) return false;
			if (minute < 0 || minute > 60) return false;
			return true;
		}
	}
	
	function toTimeStandard(hour, minute) 
	{ 
		return hourOf(hour)+':'+minuteOf(minute);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Time : Hours
	// ---------------------------------------------------------------------------------------------- //
	
	function checkHour(that, options)
	{
		var pattern = formats.hour;
		var parts, hour;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming hours: '+i, { type: 'format' });

					hour   = pattern[i].hour   ? parts[pattern[i].hour] : parts[1];
					
					if (!(value = toHourStandard(hour))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(hour)	{ 
			if (hour < 0 || hour > 23) return false;
			return true;
		}
	}
	
	function toHourStandard(hour) 
	{ 
		return hourOf(hour);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Time : Minutes
	// ---------------------------------------------------------------------------------------------- //
	
	function checkMinute(that, options)
	{
		var pattern = formats.minute;
		var parts, minute;
		var value = $(that).val();
		
		if (value == '') return true;
		
		for (var i in pattern)
		{
			if (pattern[i].form.test(value))
			{
				parts = value.match(pattern[i].form);
				
				if (i != 'standard')
				{
					id.debug(me+'Assuming minutes: '+i, { type: 'format' });

					minute = pattern[i].minute ? (pattern[i].minute == -1 ? fillMinute() : parts[pattern[i].minute]) : parts[2];
					
					if (!(value = toMinuteStandard(minute))) return false;
					if (!(parts = value.match(pattern.standard.form))) return false;
				}
				
				if (!isValid(parts[1])) return false;

				$(that).val(value);
				return true;
			}
		}

		return false;		
		
		function isValid(minute)	{ 
			if (minute < 0 || minute > 60) return false;
			return true;
		}
	}
	
	function toMinuteStandard(minute) 
	{ 
		return minuteOf(minute);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function dayOf(day)
	{
		return Number(day);
	}

	function weekOf(week)
	{
		return Number(week);
	}
	
	function weekPrefixOf()
	{
		return id.lang.isGerman() ? 'KW' : 'CW';
	}
	
	function halfyearPrefixOf()
	{
		return 'H';
	}
	
	function seasonPrefixOf()
	{
		return 'S';
	}
	
	function quarterPrefixOf()
	{
		return 'Q';
	}

	function monthOf(month)
	{
		if (Number(month)) 
			return Number(month);

		if (!months) 
		{
			// Allow the native language, and if this is different to English,
			// then try also the English language.
		
			months = [];
			
			months[0] = id.lang.getMonths('medium');
			for (var i = 0; i < months[0].length; i++) months[0][i] = months[0][i].toLowerCase();

			if (id.lang.getLang() != 'en')
			{
				months[1] = id.lang.getMonths('medium', 'en');
				for (var i = 0; i < months[1].length; i++) months[1][i] = months[1][i].toLowerCase();
			}
		}

		month = month.toLowerCase();
		
		for (var lang = 0; lang < months.length; lang++)
			for (var i = 0; i < months[lang].length; i++) 
				if (months[lang][i] == month) 
					return i+1;
						
		return 0;
	}
	
	function yearOf(year)
	{
		year = Number(year);
		return year < 1000 ? year+2000 : year;
	}
	
	function dateOfWeekYear(week, year)
	{
		var date = new Date(year, 0 /* = January */, 1);
		
		var firstWeekDay = date.getDay() - 1;
		var firstWeek = firstWeekDay < 4 /* ISO NORM: Thursday */ ? 1 : 0;
		var days = ((week-firstWeek) * 7) - firstWeekDay;
	
		date.setDate(date.getDate()+days);
		return date;
	}
	
	function halfyearOf(halfyear)
	{
		return Number(halfyear);
	}
	
	function seasonOf(season)
	{
		return season.toUpperCase();
	}
	
	function quarterOf(quarter)
	{
		return Number(quarter);
	}
	
	function hourOf(hour)
	{
		return Number(hour);
	}
	
	function minuteOf(minute)
	{
		var minute = Number(minute);
		if (minute < 10) minute = '0'+ minute;
		return minute;
	}
	
	function fillYear()  { var date = new Date(); var year = date.getFullYear(); delete date;	return year; }
	function fillMonth() { var date = new Date(); var month = date.getMonth()+1; delete date;	return month; }
	function fillHalfyear()  { var date = new Date(); var halfyear = ((date.getMonth() >= 0) && (date.getMonth() < 6) ? (date.getMonth() >= 0) && (date.getMonth() < 3) ? '1' : '2' : (now.getMonth() >= 6) && (now.getMonth() < 11) ? '1' : '2'); delete date; return halfyear; }
	
	function fillMinute() { return 0; }
	
	
	// ---------------------------------------------------------------------------------------------- //
	// DEPRECIATE TIME FORMAT CONVERSION
	// ---------------------------------------------------------------------------------------------- //
	
	function toNewTimeFormat(format) {
		var cos = { date: 'date', weekYear: 'weekYear', monthYear: 'monthYear', day: 'day', week: 'week', month: 'month', year: 'year', halfyear: 'halfyear', season: 'season', halfyear: 'halfyear', quarter: 'quarter' }
		switch (format) {
			case cos.date:
				return cos.day;
				break;
			case cos.weekYear:
				return cos.week;
				break;
			case cos.monthYear:
				return cos.month;
				break;
			default: 
				return format;
		} 
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// TIME CONVERSION TO GUI
	// ---------------------------------------------------------------------------------------------- //
	
	function toTimeConversion(value, format) {
		if (value.value !== undefined){
			value = value.value;
		}

		if (value === null || value == '' || value.indexOf('-') == -1) {
			return value;
		}

		var part = value.split("-");
        
        if (format === undefined) {
			format = cos.day;
		}
		
		switch (format) {
			case cos.day:
				return cutLeadingZeros(part[2])+'.'+cutLeadingZeros(part[1])+'.'+cutLeadingZeros(part[0]);
				break;
			case cos.week:
				return id.lang.get('cw')+' '+part[1].slice(1)+' '+part[0];
				break;
			case cos.month:
				return part[1]+'.'+part[0];
				break;
			case cos.year:
				return value;
				break;
			case cos.halfyear:
				return part[1]+' '+part[0];
				break;
			case cos.season:
				return part[1]+' '+part[0];
				break;
			case cos.halfseason:
				return part[1]+' '+part[0]+'/'+part[2];
				break;
			case cos.quarter:
				return part[1]+' '+part[0];
				break;
			default: 
				return value;
		}

		function cutLeadingZeros(value) {
			return  isNaN(parseInt(value, 10)) ? value : parseInt(value, 10);
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// TIME CONVERSION TO BACKEND
	// ---------------------------------------------------------------------------------------------- //
	
	function fromTimeConversion(value, format) {
		var part, part2;
		
		if (value == '') {
			return value;
		}
        
        if (format === undefined) {
			format = cos.day;
		}
		
		switch (format) {
			case cos.day:

				if (!value.match(/[0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]([0-9][0-9])?/)){
					return value;
				}
				var day, month, year;

				part = value.split(".");
				day = twoDigits(part[0]) ? twoDigits(part[0]) : '';
				month = twoDigits(part[1]) ? twoDigits(part[1]) : '';
				year = part[2] ? part[2] : '';

				return year+'-'+month+'-'+day;
				break;
			case cos.week:
				part = value.split(" ");
				return part[2]+'-W'+part[1];
				break;
			case cos.month:
				part = value.split(".");
				return part[1]+'-'+part[0];
				break;
			case cos.year:
				return value;
				break;
			case cos.halfyear:
				part = value.split(" ");
				return part[1]+'-'+part[0];
				break;
			case cos.season:
				part = value.split(" ");
				return part[1]+'-'+part[0];
				break;
			case cos.halfseason:
				part = value.split(" ");
				part2 = part[1].split("/");
				return part2[0]+'-'+part[0]+'-'+part2[1];
				break;
			case cos.quarter:
				part = value.split(" ");
				return part[1]+'-'+part[0];
				break;
			default: 
				return value;
		}

		function twoDigits(value) {

			var s = value +'';

			s = s.length < 2 ? '0'+s : s;

			return s;
		}
	}
	
}());