  /*
	File: plan.js
	Purpose: Build a Gantt Chart alike plan
	Needs: id Namespace (id.js)
	
	$Author: udy $
*/

(function()
{

/* --------------------------------------------------------------------------------
	Public Interface
	-------------------------------------------------------------------------------- */
	
	id.gui.plan = 
	{
		id: 'plan',
	
		init: init,
		update: init /* no difference yet */,

		beforeInit: function(callback) { beforeInit = callback; },
		afterInit: function(callback) { afterInit = callback; }
	}

/* --------------------------------------------------------------------------------
	Private
	-------------------------------------------------------------------------------- */
	
	var beforeInit = 0;
	var afterInit = 0;
	
	var css = { isPlan: 'isPlan', 'table': 'planTable','tablefoot': 'dataTable', 'tr': '', 'th': '', 'td': '', 'foot': 'foot', 'rows': 'rows', 'thMonth': 'thMonth', 'thmultiplier': 'headmultiplier', 'thnumber': 'headnumber', 'check': 'check', 'itemLabel': 'itemlabel', 'currentWeek': 'currentweek', 'text': 'text', 'help': 'help', 'monthBox': 'monthBox', 'monthNormal': 'monthNormal', 'rangeOverlay': 'rangeoverlay', 'tooltipContent': 'tooltip-content','tooltip': 'tooltip', 'tpleft': 'tpleft', 'col': 'col2', 'tdLast': 'tdLast', 'labelBox': 'labelBox' };
	var cos = { plan: 'plan' };
	
	// maps logical attribute to column name
	var mapping = {
		'From': 'from',
		'To': 'to',
		'Id': 'auditId',
		'Label': 'auditName',
		'Postholder': 'postholder',
		'BoxLabel': 'from',
		'Status': 'status'
	};
	
	var hideColumnsForInfo = {
		"from": true,
		"to": true,
		"status": true,
		"postHolder": true,
		"auditId": true,
		"protocolReportDate": true
	};
	
	id.object.register(id.gui.plan, { docType: css.isPlan, cosType: cos.plan });
	
/* --------------------------------------------------------------------------------
	Init 
	-------------------------------------------------------------------------------- */

	
		
	function init(object, dialog)
	{
		var $table;
		
		var sd = object.range[0].from.split('.');
		var ed = object.range[0].to.split('.');
	
		var startDate = new Date(0);
		var currentWeek = new Date().getISOWeek(false);  
		var currentYear = new Date().getFullYear(); 

		startDate.setFullYear(sd[2]); startDate.setMonth(sd[1]-1); startDate.setDate(sd[0]); startDate.setHours(12);
		switch (startDate.getDay()) {
		  case 0:
		    startDate.setMilliseconds(startDate.getMilliseconds() - (5 * (24*60*60*1000) ));
		    break;
		  case 1:
		    break;
		  default:
		    startDate.setMilliseconds(startDate.getMilliseconds() - ((startDate.getDay() - 1) * (24*60*60*1000) ));
		    break;
		}

		var endDate = new Date(0);
		endDate.setFullYear(ed[2]); endDate.setMonth(ed[1]-1); endDate.setDate(ed[0]); endDate.setHours(12);
		switch (endDate.getDay()) {
		  case 0:
		    endDate.setMilliseconds(endDate.getMilliseconds() - (5 * (24*60*60*1000) ));
		    break;
		  case 1:
		    break;
		  default:
		    endDate.setMilliseconds(endDate.getMilliseconds() - ((endDate.getDay() - 1) * (24*60*60*1000) ));
		    break;
		}

		
		object.$place.empty();	
		
		if (beforeInit) beforeInit(object);
				
		$table = addTable(object);
		
		id.layout.setSemiFlexContainer(object.$scope, false);
		id.layout.setContainer(object.$scope, false);
		
		addColumns( object, $table, startDate, endDate, currentWeek, currentYear );
		addRows( object, $table, startDate, endDate, currentWeek, currentYear );
		addFooter( object, $table );
		
		id.layout.setContainer(object.$scope, true);
		id.layout.setSemiFlexContainer(object.$scope, true);

		setTimeout( function() { addRowItems( object, $table, startDate, endDate ); }, 0);
		setTimeout( function() { addTipItems( object ); },100);
		setTimeout( function() { addEvents( object, $table ); }, 200);
		
		if (afterInit) afterInit(object);

	}
	

	function addTable(obj)
	{
		var $table = $('<table class="'+css.table+'"></table>');
		
		obj.$place.append($table);
		
		if (obj.services) $table.service = obj.services; 
		
		return $table;	
	}
	
	function addColumns(obj, $table, startDate, endDate, currentWeek, currentYear)
	{
		var $row0, $row1, $row2, $tdcheck, $tdtitle, $td, $tdspan, tdLast;
		
		var lastTD1 = null;
		var addWeek = 0;
		var monthIndex = '';
		var lastMonthIndex = '';
					
		var setStartDateHead = new Date(startDate.setMilliseconds(startDate.getMilliseconds()));
		var setEndDateHead = new Date(endDate.setMilliseconds(endDate.getMilliseconds()));
				
		$row0 = $( '<tr></tr>' ); $row0.addClass(css['thMonth']);
		$row1 = $( '<tr></tr>' ); $row1.addClass(css['thmultiplier']);
		$row2 = $( '<tr></tr>' ); $row2.addClass(css['thnumber']);
		
		$table.append($row0).append($row1).append($row2);
		
		$tdcheck = $( '<td colspan="1"></td>' ); $tdcheck.addClass(css['check']);
		$tdtitle = $( '<td colspan="1"></td>' ); $tdtitle.addClass(css['itemLabel']);
		
		$tdspan = $( '<span></span>' );
				
		$row0.append($tdtitle.clone().text(id.lang.get('month')));
		$row1.append($tdtitle.clone());
		$row2.append($tdtitle.clone().text(obj.label));
		
		$td = $( '<td></td>' );
		
		do {
			setStartDateHead.setTime(setStartDateHead.getTime() + addWeek); // add 1 week
			addWeek = (7*24*60*60*1000);
			
			var kw = setStartDateHead.getISOWeek(false).toString();
			var kwLast = setEndDateHead.getISOWeek(false).toString();
			var dateHeadYear = setStartDateHead.getFullYear();
			
			monthIndex = setStartDateHead.getMonth() + 1;
			
			if (kw.length == 2) 
			{
				var label1 = kw.substring( 0, 1 ) + "x";
			} else {
				var label1 = 0 + "x";
			}
		
			if (kw.length == 2) 
			{
				var label2 = kw.substring( 1, 2 );
			} else {
				var label2 = kw ;
			}

			if ( lastTD1 == null  ||  lastTD1.text() != label1 )
			{
				lastTD1 = $( $td.clone() ).attr('colSpan','1').text( label1 );
				$row1.append( lastTD1 );
			} else {
				var colspan = lastTD1.attr( 'colSpan' );
				colspan++;
				lastTD1.attr( 'colSpan', colspan );  // use 'colSpan' instead of 'colspan' for IE !
			}
			
			if (currentWeek == kw && dateHeadYear == currentYear) {
				$row2.append( $( $td.clone() ).text( label2 ).addClass(css['currentWeek']));
				
			} else {
				$row2.append( $( $td.clone() ).text( label2 ));	
			}
				
			if (kw == kwLast && setEndDateHead.getFullYear() == dateHeadYear) { 
				tdLast = css['tdLast'];
			} else {
				tdLast = ''; 
			}
			
			if (monthIndex != lastMonthIndex) {
				var $tdcont = $td.clone().addClass(css['monthBox']).addClass(tdLast);
				$row0.append( $tdcont.append( '<div><span>'+id.lang.getMonths()[monthIndex-1]+'</span></div>' ) );
			} else {
				$row0.append( $( $td.clone() ).text( '' ).addClass(css['monthNormal']).addClass(tdLast));
			}
			
			lastMonthIndex = monthIndex;
			
		} while (setStartDateHead.getTime() < setEndDateHead.getTime());	
		
		$table.append($row0).append($row1).append($row2);	
	
	}
	
	
	function addRows(obj, $table, startDate, endDate, currentWeek, currentYear)
	{
		var cache ='', year, kw, setNextWeekDate;	
		
		if (obj.rows) $.each(obj.rows, function(i, row) 
		{			
			var addWeek = 0;
								
			var setStartDateRows = new Date(startDate.setMilliseconds(startDate.getMilliseconds()));
			var setEndDateRows = new Date(endDate.setMilliseconds(endDate.getMilliseconds()));
			
			cache += '<tr class="'+css.rows+'">';
			cache += '<td class="'+ css.itemLabel +'" colspan="1"><div class="'+css.labelBox+'">';
			cache += '<a class="'+ css.help+'" id="tpanchor-'+ getAttribute( obj, row, 'Id' ) +'"></a>';
			cache += '<a class="'+ css.text +'" id="service-'+ getAttribute( obj, row, 'Id' ) +'">'+ id.cos.valueOf(getAttribute( obj, row, 'Label' )) +( getAttribute( obj, row, 'Postholder' ) ? '<span>('+ getAttribute( obj, row, 'Postholder' ) +')</span>': '')+'</a>';
			cache += '</div></td>';
						
			do {
				
				setStartDateRows.setTime(setStartDateRows.getTime()  + addWeek); // add 1 week
				addWeek = (7*24*60*60*1000);
				
				setNextWeekDate = new Date(setStartDateRows.getTime() + (7*24*60*60*1000));
				kw = setStartDateRows.getISOWeek(false).toString();		
										
				if (setStartDateRows.getFullYear() < setNextWeekDate.getFullYear()) year = setNextWeekDate.getFullYear();	
				else year = setStartDateRows.getFullYear();
			
				cache += '<td id="' + getAttribute( obj, row, 'Id' ) + '-' + kw + '-' + year + '"'+(currentWeek == kw && year == currentYear ? ' class="'+ css.currentWeek +'"' : '')+'></td>'; 
			
			} while (setStartDateRows.getTime() < setEndDateRows.getTime());
			
			cache += '</tr>';
			
		});
		
		$table.append(cache);	
	}
	
	

	function addRowItems(obj, $table, startDate, endDate)
	{
		var itemStartYear, itemEndYear;
		var planContainerWidth = obj.$place.width();

		var setStartDateRows = new Date(startDate.setMilliseconds(startDate.getMilliseconds()));
		var setEndDateRows = new Date(endDate.setMilliseconds(endDate.getMilliseconds()));

		if (obj.rows) $.each(obj.rows, function(i, row)
		{
			var cache ='';

			isd = ( getAttribute( obj, row, 'From' )).split('.');
			itemStartDate = new Date(0);
			itemStartDate.setFullYear(isd[2]); itemStartDate.setMonth(isd[1]-1); itemStartDate.setDate(isd[0]); itemStartDate.setHours(12);
			
			switch (itemStartDate.getDay()) {
			  case 0:
			    itemStartDate.setMilliseconds(itemStartDate.getMilliseconds() - (5 * (24*60*60*1000) ));
			    break;
			  case 1:
			    break;
			  default:
			    itemStartDate.setMilliseconds(itemStartDate.getMilliseconds() - ((itemStartDate.getDay() - 1) * (24*60*60*1000) ));
			    break;
			}
			
			itemStartYear = itemStartDate.getWeekYear();
			
			ied = ( getAttribute( obj, row, 'To' )).split('.');
			itemEndDate = new Date(0);
			itemEndDate.setFullYear(ied[2]); itemEndDate.setMonth(ied[1]-1); itemEndDate.setDate(ied[0]); itemEndDate.setHours(12);
			switch (itemEndDate.getDay()) {
			  case 0:
			    itemEndDate.setMilliseconds(itemEndDate.getMilliseconds() - (5 * (24*60*60*1000) ));
			    break;
			  case 1:
			    break;
			  default:
			    itemEndDate.setMilliseconds(itemEndDate.getMilliseconds() - ((itemEndDate.getDay() - 1) * (24*60*60*1000) ));
			    break;
			}
			
			itemEndYear = itemEndDate.getWeekYear();

			var status = getAttribute( obj, row, 'Status' );
			
			cache += '<div id="overlay-'+ getAttribute( obj, row, 'Id' ) +'" class="'+ css.rangeOverlay +' '+ status +'"'; 
			
			var itemStartWeek = itemStartDate.getISOWeek(false).toString();
			var itemEndWeek = itemEndDate.getISOWeek(false).toString();
			
			if ( itemStartDate < startDate ) 
			{
				var posStart = $('#' + getAttribute( obj, row, 'Id' ) + '-' + setStartDateRows.getISOWeek(false).toString() + '-' + itemStartYear);
				var positionStart = posStart.position();
			}
			else
			{
				var posStart = $('#' + getAttribute( obj, row, 'Id' ) + '-' + itemStartWeek + '-' + itemStartYear);
				var positionStart = posStart.position();
			}
		
			if ( itemEndDate >= endDate ) 
			{
				var posEnd = $('#' + getAttribute( obj, row, 'Id' ) + '-' + setEndDateRows.getISOWeek(false).toString() + '-' + itemEndYear);
				var positionEnd = posEnd.position();
			}
			else
			{
				var posEnd = $('#' + getAttribute( obj, row, 'Id' ) + '-' + itemEndWeek + '-' + itemEndYear);
				var positionEnd = posEnd.position();
			}
			
			
			
			if (id.isIE() && $.browser.version.substr(0,1)<7) {
		        var cssPosTop = 'top: '+ (Math.floor(positionStart.top + ((posEnd.outerHeight() - (20)) / 2))) +'px;';
		        var cssPosLeft = 'left: '+ (positionStart.left) +'px;';
		        var cssPosWidth = 'width: '+ (positionEnd.left - positionStart.left + posEnd.outerWidth()) +'px;';
		        
		        cache += ' style="'+ cssPosTop + cssPosLeft + cssPosWidth +'"';        
			}
			else if ($.browser.mozilla) 
			{
		        var cssPosTop = 'top: '+ (Math.floor(positionStart.top + ((posEnd.outerHeight() - (20)) / 2))) +'px;';
		        var cssPosLeft = 'left: '+ (positionStart.left) +'px;';
		        var cssPosRight = 'right: '+ (Math.floor(planContainerWidth - positionEnd.left - posEnd.outerWidth()) + 1) +'px;';
		        
		        cache += ' style="'+ cssPosTop + cssPosLeft + cssPosRight +'"';   
			}
			else
			{
		        var cssPosTop = 'top: '+ (Math.floor(positionStart.top + ((posEnd.outerHeight() - (20)) / 2))) +'px;';
		        var cssPosLeft = 'left: '+ (positionStart.left) +'px;';
		        var cssPosRight = 'right: '+ (Math.floor(planContainerWidth - positionEnd.left - posEnd.outerWidth())) +'px;';
		        
		        cache += ' style="'+ cssPosTop + cssPosLeft + cssPosRight +'"';    
			}
					
			cache += '>';
	  				
			cache += '<div'; 
			
			if ( (itemEndDate - itemStartDate) < ((7*24*60*60*1000) * 5) ) 
			{
				if ( (setEndDateRows - itemEndDate) < ((7*24*60*60*1000) * 5) ) 
				{
		        	var pPosLeft = 'left: '+ (-(positionStart.left - positionEnd.left) + posEnd.outerWidth()) +'px;';
		        	var pPosColor = 'color: #000000;';
		        	var pPosBackgroundColor = 'background-color: #ffffff;';
		        		
		        	cache += ' style="'+ pPosLeft + pPosColor + pPosBackgroundColor +'"';
				} 
				else {
	        		var pPosLeft = 'left: '+ ((positionEnd.left - positionStart.left) + posEnd.outerWidth()) +'px;';
	        		var pPosColor = 'color: #000000;';
	        		var pPosBackgroundColor = 'background-color: #ffffff;';
	        			
	        		cache += ' style="'+ pPosLeft + pPosColor + pPosBackgroundColor +'"';
	        	}
			}
			
			cache += '>'+ getAttribute( obj, row, 'From' );
			cache += '</div>';
			cache += '</div>';
			
			obj.$place.append(cache);
			
		});
	}


	function addTipItems(obj)
	{
		var $tip, cache;

		var info = [];

		if (obj.rows) $.each( obj.rows, function( i, row )
		{	
			var cache = '';	
			
			cache += '<div id="'+ getAttribute( obj, row, 'Id' ) +'-tooltip'+'" class="'+css.tooltip+'">';
			cache += '<div class="'+ css.tooltipContent +'">';
			cache += '<table><tr>';
			
			var info = getAdditionalAttributes( obj, row );
			
			$.each( info, function(i, item)
			{
				cache += '<tr>';
				cache += '<td class="'+ css.tpleft +'">'+ item.label +'</td>';
				cache += '<td>:</td>';
				cache += '<td>'+ (item.value.length > 0 ? item.value : ' ') +'</td>';
				cache += '</tr>';
			});
			
			cache += '</tr></table>';
			cache += '<div class="shadowbox"><div class="shadow_t"></div><div class="shadow_b"></div><div class="shadow_l"></div><div class="shadow_r"></div><div class="shadow_tl"></div><div class="shadow_tr"></div><div class="shadow_bl"></div><div class="shadow_br"></div></div>';
			cache += '</div></div>';
			
			$('#content').append(cache);
			
			$('#tpanchor-' + getAttribute( obj, row, 'Id' )).tooltip({ 
        		tip: '#'+ getAttribute( obj, row, 'Id' ) +'-tooltip', 
         		position: 'center right', 
         		offset: [0, 0], 
         		lazy: false, 
         		predelay: 750,
         		delay: 500 
    		}).dynamic( { 
             	left: {offset: [0, 0]}
    		}); 

		});
	
	}
	
	function addFooter(obj, $table)
	{	
		var cache = '';
		
		cache += '<table class="'+ css.tablefoot +'"><tr class="'+ css.foot +'"><td class="'+ css.col +'">';
		cache += obj.rows.length +' '+  (obj.rows.length == 1 ? id.lang.get('entry') : id.lang.get('entries')) +' '+  id.lang.get('found');
		cache += '<td></td></tr></table>';
		
		obj.$place.append(cache);
		
	}
	
	
	function addEvents(obj, $table)
	{	
		var key = { id: 0, value: 0 };
		
		if (obj.services) {
			if (obj.rows) $.each(obj.rows, function(i, row) {
		
				key.id = getLogicalColumn( obj, 'Id' ).id;
				key.value = getAttribute( obj, row, 'Id' );
			
				$('#service-'+ getAttribute( obj, row, 'Id' )).bind(id.clickOf(), { obj: obj, service: obj.services[0], key: { id: key.id, value: key.value } }, function(e) {
					id.service.call(e.data.obj, e.data.service, { parameters: [{ id: e.data.key.id, value: e.data.key.value }] });
				});
				
				$('#overlay-'+getAttribute( obj, row, 'Id' )).bind(id.clickOf(), { obj: obj, service: obj.services[0], key: { id: key.id, value: key.value } }, function(e) {
					id.service.call(e.data.obj, e.data.service, { parameters: [{ id: e.data.key.id, value: e.data.key.value }] });
				});
			});
		}	
	}	


	/**
	Returns the value of the ...
	*/
	function getAttribute( obj, row, attributeName )
	{
		return getValue( obj, row, mapping[attributeName] );
	}

		
	/**
	Returns an array of object with label and values, containing all values ...
	*/
	function getAdditionalAttributes( obj, row )
	{
		var result = [];
		var i, valueObject;
		
		var columns = obj.columns;

		for ( i = 0; i < row.length; i++ )
		{
			valueObject = row[ i ];
			if ( ! hideColumnsForInfo[ columns[ i ].id ] )
			{
				var label = columns[ i ].label;
			
				// handle strings and value-objects.
				if ( row[ i ] && row[ i ].value )
				{
					result.push( { label: label, value: row[ i ].value } );
				}
				else
				{
					result.push( { label: label, value: row[ i ] } );
				}
			}
		}
			
		return result;
	}
	
	
	/**
	Returns the value of the requested attribute in the given row
	*/
	function getValue( obj, row, attributeId )
	{
		var result = null;
		var i;
		var column;
		
		var columns = obj.columns;
		
		for (i=0; result == null  &&  i < columns.length; i++) 
		{
			column = columns[i];
			if ( column.id == attributeId )
			{
				// handle strings and value-objects.
				if ( row[ i ].value )
				{
					result = row[ i ].value;
				}
				else
				{
					result = row[ i ];
				}
			}
		}
		
		return result;
	}

	/**
	Returns the Column Object for a row
	*/
	function getLogicalColumn( obj, attributeId )
	{
		return getColumn( obj, mapping[ attributeId ] );
	}


	//var columnByAttributeId = {};

	function getColumn( obj, attributeId )
	{
		/*
		if ( columnByAttributeId[ attributeId ] )
		{
			return columnByAttributeId[ attributeId ];
		}
		*/
	
		var result = null;
		var i, column;

		var columns = obj.columns;

		for ( i = 0; result == null  &&  i < columns.length; i++ )
		{
			column = columns[ i ];
			if ( column.id == attributeId )
			{
				result = column;
			}
		}

		/*
		if ( result != null )
		{
			columnByAttributeId[ attributeId ] = result;
		}
		*/

		return result;
	}

}());
