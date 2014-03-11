/*
	File: chart.client.js
	Purpose: Client specific stuff for chart package (which supports also server sided functions)
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	$.extend(id.gui.chart, 
	{
		setPath: function(aPath) { path = aPath; },
		
		getTemplate: getTemplate,
		loadTemplate: loadTemplate,
	
		afterPrepare: afterPrepare,
		beforeInit: beforeInit,
		beforeUpdate: beforeUpdate,
		beforeDestroy: beforeDestroy,
		beforeSet: beforeSet,
		afterSet: afterSet,
		afterDraw: afterDraw,

		atTooltip: atTooltip,

		// TODO
		// Better integration of following functions
		
		afterShow: afterShow,
		setPrint: setPrint
	});
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { legendDelay: 500, legendFadeIn: 1000 /* milliseconds */, chartWidth: 735, chartHeight: 540 };

	// Vocabulary

	var cos = { colCategories: 0, list: 'list' };
	var css = { disabled: 'disabled', hidden: 'hidden', icon: 'icon', call: 'calling', isChart: 'isChart', toggleAllSeries: 'toggleAllSeries', isSelect: 'isSelect', print: 'print', noPrint: 'noPrint', disableLegendForExport: 'disableLegendForExport' };
	var place = { content: '#content', legendSuffix: '-legend', printSuffix: '-print' };
	var Attr = { key: 'key', serie: 'serie' };
	var Type = { bar: 'bar', column: 'column', scatter: 'scatter', standard: 'standard', line: 'line', hline: 'hline', waterfall: 'waterfall', xy: 'xy', candlestick: 'candlestick' };
	var Format = { PNG: 'PNG', JPG: 'JPG', PDF: 'PDF', SVG: 'SVG' };

	var path = 0;
	var templates = [];

	var pid = id.gui.chart.id; 
	var me = id.meOf(id.gui.chart);
	var ns = id.namespaceOf(id.gui.chart); 

	// ---------------------------------------------------------------------------------------------- //
	// Init, Update, ...
	// ---------------------------------------------------------------------------------------------- //
	
	function afterPrepare(obj)	
	{
		showProgress(obj.getPlace());
	}

	function beforeInit(obj)
	{
		hideProgress(obj.getPlace());
	}

	function beforeUpdate(obj)
	{
		hideProgress(obj.getPlace());
	}
	
	function beforeSet(definition, x, y, obj)
	{
 		if (x === null || y === null) {
 			id.gui.chart.setLabel(obj, false);
			id.gui.chart.setPrint(definition, obj, true);
			return false;
		} else {
			id.gui.chart.setLabel(obj, true);
			id.gui.chart.setPrint(definition, obj);
		}
	}

	function afterSet(definition, obj)
	{
		setLegend(definition, obj)
		setEvents(definition, obj)
	}

	function afterDraw(definition, obj, chart)
	{
		showLegend(obj);	
		addEvents(definition, obj);
	}
	
	function afterShow(obj)
	{	
		if (!id.isIDevice()) 
		{
			id.layout.setSemiFlexContainer(obj.$scope, true);
			id.layout.setContainer(obj.$scope, true);
		}
	}

	function beforeDestroy(obj)
	{
		removeLegend(obj);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Extra Legend
	// ---------------------------------------------------------------------------------------------- //

	function setLegend(definition, obj)
	{
		var plus = definition.plus, toggle;

		if (!plus.extraLegend) return false;
		if (!(plus.$legend = findLegend(obj))) return false;
		if (plus.$legend && plus.$legend.hasClass(css.toggleAllSeries)) toggle = true;

		var so = plus.series ? plus.series : 0 /* series definition */;  
		var columns = obj.columns || definition.columns;
		var colors = definition.colors;
		var plotOptions = definition.plotOptions;
		var cache = '';
		var i, ci, j, type, soi, withTransform = false;
		var $legend = plus.$legend;

		type = definition.chart.defaultSeriesType;

		cache += '<ul>';
		
		if (!so || !definition.plus.exclusive) standard();
		if (so && !withTransform) extended();
		
		for (soi = 0; soi < so.length; soi++)
		{
			if (so[soi].transform && so[soi].transform.type) switch (so[soi].transform.type)
			{
				case	Type.xy:
						xy(so[soi]);
						break;
				
				case	Type.waterfall:
						waterfall(so[soi]);
						break;
				
				case	Type.hline:
						break;
	
				default: id.error(me+'Unknown transformer type "'+so[soi].transform.type+'"!'); 		
			}
		}
		
		if (toggle) cache += '<li class="'+css.toggleAllSeries+'"><a><span class="'+css.icon+'"'+'"></span>'+id.lang.get('on')+'/'+id.lang.get('off')+'</a></li>';
		
		cache += '</ul>';
		
		$legend.html(cache);
		$legend.addClass(css.hidden);
		
		// Functions
		
		function xy(so)
		{
			var op = so.transform.status.colors;
			var label, color, sti;
			
			for (sti = 0; sti < op.length; sti++)
			{
				label = op[sti].label;
				color = op[sti].col;
				type = so.transform.type;
				cache += htmlOf( label, color, type);
			}
		}
		
		function waterfall(so)
		{
			xy(so);
		}
		
		function extended()
		{
			for (var i = 0; i < so.length; i++)
			{
				var option = so[i];
				var optionType = option.type;
			
				for (var j = 0; j < columns.length; j++)
				if (!(option.ignore || (option.tooltip && option.tooltip.at)) && option.id == columns[j].id)
				{
					if (option.transform && option.transform.type) 
					{
						type = option.transform.type; 
						color = option.transform.color;
					}
					
					// for Line Scatter Chart Legendsymbol
					optionType = (optionType == 'scatter' && plotOptions.scatter.marker.symbol == 'hline') ? plotOptions.scatter.marker.symbol : optionType;
					
					cache += htmlOf(columns[j], option.color || colors[i] || color, optionType || type);
				}
			}
			
			withTransform = true;
		}

		function standard()
		{
			// No additional description of series,
			// take it like it is.
		
			for (i = 0, ci = 0; i < columns.length; i++)
			{
				if (i == cos.colCategories) continue;
				if (columns[i].dim) continue;
				
				if (so) 
				{
					for (j = 0; j < so.length; j++)
						if (so[j].id == columns[i].id)
							break;
							
					if (so[j])
						continue;
				}
				
				cache += htmlOf(columns[i], colors[ci], type);
				ci++;
			}
		}

		function htmlOf(column, color, type)
		{
			return '<li class="'+type+'" serie="'+column.id+'"><a><span class="'+css.icon+'"'+(color ? ' style="background-color: '+color+'"' : '')+'></span>'+id.cos.labelOf(column)+'</a></li>';
		}
	}

	function showLegend(obj)
	{
		try { 
			if (!id.isIDevice()) {
				findLegend(obj).hide().removeClass(css.hidden).fadeIn(prefs.legendFadeIn); 
			} else {
				findLegend(obj).removeClass(css.hidden); 
			}
			
		} catch(error) {};

	}

	function removeLegend(obj)
	{
		try { findLegend(obj).empty(); }
		catch(error) {};
	}
	
	function findLegend(obj)
	{
		var $legend = $(place.content).find('#'+obj.id+place.legendSuffix);

		if ($legend.missed())		
		{
			// id.error(me+'Missing legend area "'+obj.id+place.legendSuffix+'".');
			return 0;
		}

		return $legend;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Print Menue
	// ---------------------------------------------------------------------------------------------- //

	function setPrint(definition, obj, flag)
	{
		var $printSelect;
		var select = {};
		var buttons = [];
		
		if (obj.getPlace().hasClass(css.noPrint)) {
			return false;
		}
		
		if (flag || (obj.services && obj.services.length == 0)) {
			obj.getScope().find('#'+obj.id + place.printSuffix).removeClass(css.isSelect).empty();
			return false;
		}
		
		if (!obj.getScope().find('#'+obj.id + place.printSuffix).exist()) {
			$printSelect = $('<div id="'+obj.id + place.printSuffix+'" class="'+css.isSelect+' '+css.print+'"></div>');
			obj.getPlace().parent().append($printSelect);
		} else {
			$printSelect = obj.getScope().find('#'+obj.id + place.printSuffix);
			if (!$printSelect.hasClass(css.isSelect)) {
				$printSelect.addClass(css.isSelect);
			}
		}
		
		select = {
			id: obj.id + place.printSuffix,
			label: '',
			type: cos.list,
			items: [],
			getTask: obj.getTask,
			getOwner: obj.getOwner,
			getPlace: obj.getPlace,
			$place: $printSelect
		};
				
		if (!obj.services) {
		
			buttons = [
				{
					id: Format.PNG,
					label: id.lang.get('download'+Format.PNG),
					callback: function () { exportChart(Format.PNG);  }
				},
				{
					id: Format.JPG,
					label: id.lang.get('download'+Format.JPG),
					callback: function () { exportChart(Format.JPG);  }
				},
				{
					id: Format.PDF,
					label: id.lang.get('download'+Format.PDF),
					callback: function () { exportChart(Format.PDF);  }
				},
				{
					id: Format.SVG,
					label: id.lang.get('download'+Format.SVG),
					callback: function () { exportChart(Format.SVG); }
				}
			];
			
			$.each(buttons, function(i, button)
			{
				var item = {};
				
				item.label = id.cos.labelOf(button);
				item.value = button.id;
				item.id = button.id;
							
				item.callback = button.callback; 
				select.items.push(item);
			});
		
		} else if (obj.services && obj.services.length > 0) {
		
			$.each(obj.services, function(i, service)
			{
				var item = {};
				item.services = [];
				
				item.id = service.id;
				item.label = service.label || service.id;
				
				item.services.push(service);
				select.items.push(item);
			});
			
		}
				
		if (id.gui.select)
			id.gui.select.init(select, { button: true });
			
		function exportChart(type) 
		{
			var chart = obj.$place.data('object');
			var mimeType, flag = true;
		
			if (obj.getPlace().hasClass(css.disableLegendForExport)) 
				flag = false;
			
			switch (type)
			{
				case Format.PNG: 
					mimeType = 'image/png'
					break;
				
				case Format.JPG:
					mimeType = 'image/jpeg'
					break;
				
				case Format.PDF: 
					mimeType = 'application/pdf'
					break;
					
				case Format.SVG: 
					mimeType = 'image/svg+xml'
					break;
			
				default: return id.error(me+'Unknown export type "'+type+'"!'); 		
			}
			
			if (chart.exportChart) {
				chart.exportChart({
        			type: mimeType,
        			filename: obj.label+'-chart',
        			width: prefs.chartWidth,
            		height: prefs.chartHeight
   				}, 
   				{
        			legend: {
            			enabled: flag
        			}
    			});
			}	
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Label and progress signs
	// ---------------------------------------------------------------------------------------------- //
	
	function showProgress($place) { placeOfLabel($place).addClass(css.call); }
	function hideProgress($place) { placeOfLabel($place).removeClass(css.call); }
	function placeOfLabel($place) {	return $place.parent().parent().find('label'); }

	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //

	function setEvents(definition, obj)
	{
		if (!definition.plotOptions.series) definition.plotOptions.series = {};
		if (!definition.plotOptions.series.point) definition.plotOptions.series.point = {};
		
		$.extend(definition.plotOptions.series, 
		{ 
			stickyTracking: false
		});
		
		$.extend(definition.plotOptions.series.point = 
		{ 
			events: 
			{
				click: atSeriesClick,
				mouseOver: atSeriesHover,
				mouseOut: atSeriesHover
			}
		});
	}

	function addEvents(definition, obj)
	{
		definition = definition || obj.getPlace().data('object').options;
		
		// Add legend events
		
		if (definition.plus.$legend && (definition.plus.extraLegend.enabled != false))
			definition.plus.$legend.unbind('click'+ns).bind('click'+ns, { obj: obj }, atLegend);
			
		// $(window).bind('resize', { obj: obj }, atResize);
	}

	function deleteEvents(obj)
	{
		$(window).unbind('resize');
		
		var chart = obj.getPlace().data('object');
		
		if (chart)
		{		
			var $legend = chart.options.plus.$legend;
		
			if ($legend)
				$legend.unbind('click'+ns);
		}
	}

	function atResize(e)
	{
		var obj = e.data.obj;
		
		if (!obj.getPlace().is(':hidden')) {
			id.debug('Resizing Chart ..');
			setSize(obj);
		}
	}
				
	function atLegend(e)
	{
		var chart = e.data.obj.getPlace().data('object');
		var $item = $(e.target);
		
		if ($item.is('a')) $item = $item.parent();
		else if ($item.is('span'))	$item = $item.parent().parent();
		
		var serie = id.gui.chart.serieOf(chart, $item.attr(Attr.serie));
		
		if ($item.hasClass(css.toggleAllSeries))
		{
			toggleAllSeries(e, $item.parent(), $item.hasClass(css.disabled));
			return false;
		}
			
		if ($item.hasClass(css.disabled))
		{
			$item.removeClass(css.disabled);
			if ($item.parent().parent().hasClass(css.toggleAllSeries)) setToggle($item.parent(), $item.hasClass(css.disabled));
			if (serie) redraw(true);
		}
		else
		{
			$item.addClass(css.disabled);
			if ($item.parent().parent().hasClass(css.toggleAllSeries)) setToggle($item.parent(), $item.hasClass(css.disabled));
			if (serie) redraw(false);
		}
		
		function redraw(show)
		{
			if (id.isIE()) setTimeout(draw, 1);
			else draw();
		
			function draw()
			{
				if (show) serie.show();
				else serie.hide();

				chart.redraw();
			}
		}
	}
	
	function toggleAllSeries(e, $place, show)
	{
		var chart = e.data.obj.getPlace().data('object');
		
		$.each($place.find('li'), function() {
			redraw(id.gui.chart.serieOf(chart, $(this).attr(Attr.serie)), $(this));
		});
		
		function redraw(serie, $item)
		{
			if (id.isIE()) setTimeout(draw, 1);
			else draw();
		
			function draw()
			{
				if (show) {
					$item.removeClass(css.disabled);
					if ($item.attr(Attr.serie)) serie.show();
				} else {
					$item.addClass(css.disabled);
					if ($item.attr(Attr.serie)) serie.hide();
				}

				chart.redraw();
			}
		}
	}
	
	function setToggle($place, show)
	{		
		var allDisabled = true;
		var $toggle = $place.find('li.'+css.toggleAllSeries);
		
		$.each($place.find('li').not('.'+css.toggleAllSeries), function() {
			if (!$(this).hasClass(css.disabled)) {
				allDisabled = false;
				return false;
			}
		});
		
		toggle(allDisabled);
		
		function toggle(flag) {
			if (flag && !$toggle.hasClass(css.disabled)) $toggle.addClass(css.disabled);
			else $toggle.removeClass(css.disabled);
		}
	}
	
	function setYAxisMax(definition, chart, obj, force)
	{
		atRedraw(definition, chart, obj, force);
	}
	
	var n = 0, sid = 0;
	
	function atTooltip(that)
	{
		var plus = that.series.chart.options.plus;
		var text = 0, formatter;

		if (sid != that.series.options.id)
		{
			// New serie ..
			// .. set series id (sid).
			
			sid = that.series.options.id;
			n = 0;
		}
		else n++;
		
		$.each(plus.series, function() 
		{
			formatter = this.tooltip && this.tooltip.formatter ? this.tooltip.formatter : plus.extraTooltip.formatter;

			if (this.tooltip && this.tooltip.at == sid)
			{
				if (!this.serie)
				{
					id.warning(me+'Missing tooltip info for "'+sid+'".');
					return true /* continue */;
				}
			
				if (this.serie[n] > 0)
					text = formatter(that, this.serie[n]);
	
				return false /* break */;
			}
			
			else if (this.tooltip && !this.tooltip.at) 
			{
				text = formatter(that);
				return false /* break */
			}
			else if (this.tooltip && this.tooltip.at) 
			{
				text = formatter(that);
				return false /* break */
			}
		});
		
		return text ? text : false;
	}
	
	function atSeriesClick(event)
	{
		// Fired by Highcharts,
		// if a series is clicked.

		var chart = this.series.chart;
		var x = this.type == 'xy' ? this.x : chart.options.xAxis.data[this.x];
		var y = this.type == 'xy' ? this.y : this.series.name;
		var point = this.name;

		id.debug('CLICKED ["'+(point ? point : x+'"/"'+y)+'"]');

		// Service handling

		var columns = chart.options.plus.columns;
		var column = this.type == 'xy' ? id.gui.chart.columnOf(columns, chart.options.plus.series[0].transform.name) : id.gui.chart.columnOf(columns, y);
		var service = column && column.services ? column.services[0 /* There's only one. */] : null;

		if (service)
		{
			var task = chart.options.plus.task;
			
			for (var i = 0; i < service.parameters.length; i++)
			{
				var parameter = service.parameters[i];
				
				if (parameter.id == columns[cos.colCategories].id)
					service.parameters[i].value = x;
			}
		
			id.debug('CALL '+service.url);
			
			id.service.call(task, service, { $form: task.getPlace() });
		}
	}

	function atSeriesHover(event)
	{
		var entered = event.type == "mouseOver" ? true : /* mouseOut */ false;
		var x = (this.series.chart.options.chart.defaultSeriesType == 'pie') ? this.name : this.series.chart.options.xAxis.data[this.x];
		var y = this.series.name;

		// debug((entered ? 'ENTERED' : 'LEFT')+' ["'+x+'"/"'+y+'"]');
		
		if (entered)
		{
			var column = id.gui.chart.columnOf(this.series.chart.options.plus.columns, y);
	
			if (column && column.services) 
				id.setPointer('pointer');
		}
		else id.setPointer('auto');
		
		// Legend hightlighting
		// Tooltip handling
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Templates and Formats (within)
	// ---------------------------------------------------------------------------------------------- //

	function getTemplate(obj)
	{
		for (var i in templates)
			if (templates[i].id == obj.id)
				return templates[i];
	
		return 0;
	}

	function loadTemplate(obj, finalize)
	{
		// TODO: Reducing template handling by using Template Package.
		// id.template.load(obj, id.template.isChart(), { async: true, replyFormat: 'json', afterLoad: realize });

		var template;

		id.note(me+'LOAD template for chart "'+obj.getIndex()+'".');
		
		if (id.template.getVersion() == 2)
		{
			if (!(template = id.template.getFile(obj, id.template.isChart())))
				return id.error(me+'No template for "'+obj.getIndex()+'" defined.');
		}
		else template = path+'/'+obj.id+'.json';
		
		id.service.load(template, { finalize: finalize, obj: obj, replyFormat: 'script', reload: true }, afterLoad);
		return true;
		
		// Callback
		
		function afterLoad(template, status, options)
		{
			if (status)
				return false;
			
			var obj = options.obj;
			
			templates[obj.id] = template; 
			if (options.finalize) options.finalize(obj, template);
		}
	}
	
}());