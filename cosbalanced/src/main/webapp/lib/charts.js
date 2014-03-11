/*
	File: charts.js
	Purpose: COS based charting with Highcharts
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.chart = 
	{
		id: 'chart',
	
		init: init,
		update: update,
		destroy: destroy,
		prepare: prepare,
		
		cellOf: cellOf,
		afterShow: afterShow,
		atTooltip: atTooltip,
		
		// Settings
		
		setPath: function(aPath) { path = aPath; },

		// Public Formatter

		formatTime: function(value) { return id.isString(value) ? (value.slice(3,5) == '00' ? value.slice(0,2) : false) : false; },
		formatPercent: function(value, decimals) { return id.formatPercent(value, { decimals: decimals, optimized: true }); },
		formatNumber: function (value, decimals) { return id.formatNumber(value, { decimals: decimals }); },
		bytesToSize: function (value, decimals) { return id.bytesToSize(value, { decimals: decimals }); },
		numbersToSize: function (value, decimals) { return id.numbersToSize(value, { decimals: decimals }); },
		secondsToHms: function (value) { return id.secondsToHms(value); },

		labelOf: function(series) { return series.chart.series[series.index].options.label; },
		
		infoOf: function(value, series) { 
			for	(var i = 0; i < series.options.tooltip.length; i++)
				if (series.options.tooltip[i].value == value) 
					return series.options.tooltip[i].info;
		}
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = { legendDelay: 500, legendFadeIn: 1000 /* milliseconds */, chartWidth: 735, chartHeight: 540 };

	// Vocabulary

	var css = { disabled: 'disabled', hidden: 'hidden', icon: 'icon', call: 'calling', isChart: 'isChart', toggleAllSeries: 'toggleAllSeries', isSelect: 'isSelect', print: 'print', noPrint: 'noPrint', disableLegendForExport: 'disableLegendForExport' };
	var cos = { colCategories: 0, colData: 1, chart: 'chart', percent: 'percent', number: 'number', absolute: 'absolute', allPlus: '+', bytes: 'bytes' };
	var place = { content: '#content', legendSuffix: '-legend', printSuffix: '-print' };
	var attr = { key: 'key', serie: 'serie' };
	var Type = { bar: 'bar', column: 'column', scatter: 'scatter', standard: 'standard', line: 'line', hline: 'hline', waterfall: 'waterfall', xy: 'xy', candlestick: 'candlestick' };

	var path = 0;
	var templates = [];
	var currDefinition = null;

	var pid = id.gui.chart.id; 
	var me = id.meOf(id.gui.chart);
	var ns = id.namespaceOf(id.gui.chart); 

	id.object.register(id.gui.chart, { docType: 'isChart', serializer: serialize });

	// ---------------------------------------------------------------------------------------------- //
	// Prepare
	// ---------------------------------------------------------------------------------------------- //
	
	function prepare(obj)
	{
		destroy(obj);
		
		setLabel(obj);
		showProgress(obj.getPlace());
		
		loadTemplate(obj);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Init, Update
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{		
		var template;

		destroy(obj);
		//setLabel(obj);
		obj.isContent(true);
		hideProgress(obj.getPlace());

//		if (!(obj.rows && obj.rows.length > 0)) 
//		{
//			debug('No data found, nothing to do ..');
//			return false;
//		}

		// if no data found
		if (!obj.rows) { obj.rows = []; }

		// First,
		// get the right template,
		// defined by the ID.
	
		if (template = getTemplate(obj))	realize(obj, template);
		else if (!loadTemplate(obj, realize)) return false;
	
		function realize(obj, template)
		{
			var x, y, definition;
			
			id.measure(pid, { type: pid, reset: true });
			
			// Secondly,
			// get the right template format related to the format of category and values.

			// Format of the category
			// must be set.
			
			x = obj.columns[cos.colCategories].format;

			// Format of the first column of the COS based table 
			// related to the format tag ('percent', ...) or the type ('number').
			
			if (obj.columns[cos.colData])
				y = formatOf(obj.columns[cos.colData]);
				
			if ( x === null || y === null) {
				setLabel(obj, false);
				setPrint(definition, obj, true);
				return false;
			} else {
				setLabel(obj, true);
				setPrint(definition, obj);
			}
			
			if (!(definition = getFormat(template, x, y)))
				return id.error(me+'Missing template for {'+x+', '+y+' } for chart "'+obj.getIndex()+'"', { critical: true });
			
			// Third,
			// fill the definition of Highcharts
			// with categories, data, ...
							
			setup(definition, obj);

			setID(definition, obj);
			setTitle(definition, obj);
			setSize(definition, obj);
			setEvents(definition, obj);
			setSeries(definition, obj); 
			setYAxis(definition, obj);
			setLegend(definition, obj);
			
			draw(); // setTimeout(draw, 1);
			
			id.measure(pid, { type: pid, info: obj.id });

			function draw()
			{
				// definition.chart.events = { /* after */ redraw: afterDraw()	};

				showLegend(obj); 
				
				currDefinition = definition;
				var chart = new Highcharts.Chart(definition); 
				currDefinition = null;
	
				if (!chart.get)
				{
					// Empty chart object
					// delivered, if area was emptied meanwhile,
					// by choosing another template for example. 
					
					return false;
				}

				obj.getPlace().data('object', chart);
				id.serialize.register(css.isChart, serialize);

				afterDraw(obj, chart);
			}
			
			function afterDraw(obj, chart)
			{
				// obj.atEnter = function(obj)  { addEvents(obj); }
				// obj.atLeave = function(obj)  { deleteEvents(obj); }
				
				addEvents(obj, definition);
				// shifted gridLines in plotArea
				//setYAxisMax(definition, chart, obj, true);
				setYAxisMax(definition, chart, obj);
			}
		}
	}

	function update(obj)
	{
		var chart = obj.getPlace().data('object');
				
		hideProgress(obj.getPlace());

		if (!chart)
			return id.error(me+'Update on unknown chart "'+obj.id+'".');
		
		setSeries(chart.options, obj, chart);
		//setSize(obj);
		
		setYAxisMax(chart.options, chart, obj);
		chart.redraw();
	}

	// ---------------------------------------------------------------------------------------------- //
	// Destroy
	// ---------------------------------------------------------------------------------------------- //

	function destroy(obj)
	{
		var chart = obj.getPlace().data('object');

		if (chart)
		{
			debug(obj.getInfo('destroy'));
	
			chart.destroy();
			delete chart;
		
			if (id.isMozilla())
			{
				// With this setting is FF3's memory
				// nearly constant. Effects on IE are unclear yet, 
				// may be negative ....
				
				obj.getPlace().empty();
			}
					
			// setTimeout(function() { obj.getPlace().empty(); }, 1);
	
			obj.getPlace().removeData('object');	
		}
		
		removeLegend(obj);
	}
	
	function afterShow(obj)
	{	
		if (!id.isIDevice()) 
		{
			id.layout.setSemiFlexContainer(obj.$scope, true);
			id.layout.setContainer(obj.$scope, true);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Set Chart Options
	// ---------------------------------------------------------------------------------------------- //
	
	function setup(definition, obj)
	{
		// Simplifying 
		// the JSON based definition by presetting useless definition.

		if (!definition.title) definition.title = { text: null };
		if (!definition.credits) definition.credits = { enabled: false };
		if (!definition.colors)  definition.colors = [];
		if (!definition.exporting) definition.exporting = { enabled: false };

		// Prepare
		// own definition.

		definition.plus = definition.plus || {};

		//if (definition.plus.extraLegend)	definition.legend = { enabled: false }; disabled because of some intersection when exporting the svg
		definition.plus.task = obj.getTask();
		definition.plus.$place = obj.getPlace();
	}
	
	function setID(definition, obj)
	{
		definition.chart.renderTo = obj.id;
	}
	
	function setTitle(definition, obj)
	{
		if (definition.plus && definition.plus.title) 
			definition.title.text = obj.label;
	}
		
	function setSize(definition, obj)
	{
		var chartWidth, chartHeight;
		
		if (id.isIDevice()) {
			chartWidth = obj.getPlace().parent().width();
			chartHeight = obj.getPlace().parent().height();
			if (chart.setSize) {
				chart.setSize(chartWidth, chartHeight, false);
			} else {
				definition.chart.width = chartWidth;
				definition.chart.height = chartHeight;
			}
		}
	}
	
	function setEvents(definition, obj)
	{
		if (!definition.plotOptions.series) definition.plotOptions.series = {};
		if (!definition.plotOptions.series.point) definition.plotOptions.series.point = {};
		
		$.extend(definition.plotOptions.series, 
		{ 
			stickyTracking: false
		});
		
		$.extend(definition.chart,  
		{ 
			events: 
			{
				redraw: function (event) { 
					atRedraw(event.target.options, event.target, obj, false); 
				}
			}
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
	
	// ---------------------------------------------------------------------------------------------- //
	// Transformer
	// ---------------------------------------------------------------------------------------------- //
	
	function setSeries(definition, obj, chart)
	{
		var insert = !chart;
		var plus = definition.plus || {};
		var columns = obj.columns || definition.plus.columns; 
		var rows = obj.rows;
		var hideTotal = obj.sum && !plus.showTotal;
		var so = plus.series ? plus.series : 0 /* series definition */;  
		var sp = chart ? (chart.series ?  chart.series : chart.series = []) : (definition.series = []);
		var ci = 0 /* column index */, i, j, type, stacked, spi, withTransform = false;
		var minPointWidth = plus.minPointWidth || null;

		$.extend(plus, { columns: columns });

		if (insert && !columns[cos.colData])
		{
			addSeries(definition, transpose({ id: 'empty', name: 'empty' }, columns, rows, 0, { empty: true, hideTotal: hideTotal }));
			setXAxis(definition, obj);
			
			return true;
		}

		if ((!so || !definition.plus.exclusive) && !withTransform) standard();
		if (so) extended();
		if (insert && !withTransform)	setXAxis(definition, obj);

		function extended()
		{
			for (i = 0; i < so.length; i++)
			{
				if (so[i].ignore)
					continue;
					
				if (so[i].transform)
				{
					transform(definition, so[i], obj, chart);
					
					withTransform = true;
					
					continue;
				}

				// Find wanted serie 
				// in the data columns;
				
				for (j = 0; j < columns.length; j++)
				{
					if (so[i].id == columns[j].id) 
					{
						// TODO!!!
						// Eliminate ...
						// ... change to { tooltip: '<id>' }
					
						if (so[i].tooltip && so[i].tooltip.at)
						{
							so[i].serie = transpose({}, columns, rows, j, { hideTotal: hideTotal, calculate: so[i].calculate }).data;
							
							continue;
						}

						type = so[i].type || definition.chart.defaultSeriesType;
						stacked = so[i].stacked || definition.plotOptions[type].stacking;
						
						if (minPointWidth && (type == 'column')) setPointMinWidth(type, minPointWidth);
						
						if (insert)
						{
							spi = addSeries(definition, transpose({ id: columns[j].id, name: columns[j].id, label: id.cos.labelOf(columns[j]) }, columns, rows, j, { type: type, hideTotal: hideTotal, calculate: so[i].calculate }));
							
							if (so[i].color)       	spi.color = so[i].color;
							if (so[i].yAxis)       	spi.yAxis = so[i].yAxis;
							if (so[i].type)        	spi.type = so[i].type;
							if (so[i].marker)      	spi.marker = so[i].marker;
							if (so[i].borderColor) 	spi.borderColor = so[i].borderColor;
							if (so[i].fillOpacity) 	spi.borderColor = so[i].fillOpacity;
							if (so[i].stacking)    	spi.stacking = so[i].stacking;
							if (so[i].zIndex)		spi.zIndex = so[i].zIndex;
						}
						else
						{
							spi = sp[ci++];
							
							var newSeries = transpose({}, columns, rows, j, { hideTotal: hideTotal, calculate: so[i].calculate });
							spi.setData(newSeries.data, /* don't redraw */ false);
							spi.plus = newSeries.plus;
						}

						// ### TODO
						// Problems with multiple axis are expected ...

						//plus.format = formatOf(columns[i]); I do not think it is [i] ..
                        plus.format = formatOf(columns[j]); 
	
						break;
					}
				}
			}
		}
		
		function standard()
		{
			var type = definition.chart.defaultSeriesType;
			var stacked = definition.plotOptions[type].stacking;
			var spi;
			
			if (minPointWidth && (type == 'column')) setPointMinWidth(type, minPointWidth);
		
			// No additional description of series,
			// take it like it is.
		
			for (i = 0; i < columns.length; i++)
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
				
				if (insert) 
				{
					spi = addSeries(definition, transpose({ name: columns[i].id, label: id.cos.labelOf(columns[i]) }, columns, rows, i, { hideTotal: hideTotal }));
				}
				else 
				{
					spi = sp[ci++];
					sp[ci].setData(transpose({}, columns, rows, i, { hideTotal: hideTotal }).data, /* don't redraw */ false);
				}
				
				// ### TODO
				// Problems with multiple axis are expected ...

				plus.format = formatOf(columns[i]); 
			}
		}
		
		function setPointMinWidth(type, minPointWidth)
		{
			// Set pointWidth for few series  
			definition.plotOptions[type].pointWidth = rows.length < 3 ? minPointWidth : null;
		}
	}
	
	function transpose(serie, columns, rows, column, options)
	{
		options = options || {};
	
		var data = serie.data || (serie.data = []);
		var plus = serie.plus || (serie.plus = {});
		var tooltip = serie.tooltip || (serie.tooltip = []);
		var n = rows.length - (options.hideTotal ? 1: 0);
		var cell, value, label;
		
		for (var row = 0; row < n; row++)
		{
			cell = options.empty ? null : rows[row][column];
			
			label = id.isObject(cell) && cell.label ? cell.label : 0;
			
			value = cell == null ? cell
					: cell == 0 ? null
					: options.calculate ? options.calculate(rows[row], columns) 
			      : id.isObject(cell) && cell.value == undefined ? null
			      : id.cos.valueOf(cell);

			data[row] = value;
			
			tooltip[row] = cell;
			
			if (plus.labels) 
			{
				// Register values,
				// which belongs to the labels.
			
				plus.labels[row] = label || value;
			}

			if (value != null && !options.text)	setMinMax (value, plus);
		}
				
		return serie;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Extended Transformer
	// ---------------------------------------------------------------------------------------------- //
	
	function transform(definition, option, obj, chart)
	{
		switch (option.transform.type)
		{
			case Type.xy: // ... 
				setSeriesXY(definition, option, obj, chart); 
				break;
			
			case Type.waterfall: // ... 
				setSeriesWaterfall(definition, option, obj, chart); 
				break;
			
			case Type.hline: // ... 
				setSeriesHLine(definition, option, obj, chart); 
				break;
		
			default: return id.error(me+'Unknown transformer type "'+plus.transform.type+'"!'); 		
		}

		return true;
	}
	
	function setSeriesXY(definition, option, obj, chart)
	{
		var insert = !chart;
		var op = option.transform;
		var columns = obj.columns || definition.plus.columns; 
		var rows = obj.rows;
		var n = rows.length - (obj.sum && !definition.plus.showTotal ? 1 : 0);
		var plus = definition.plus;
		var sp = addSeries(definition, { id: obj.id, name: obj.id, label: id.cos.labelOf(obj), data: [] });
		var data = sp.data;
		
		if (insert && (n <= 1))	setXAxis(definition, obj);

		var index = 
		{ 
			x: id.isNumber(op.x) ? op.x : indexOf(op.x, columns), 
			y: id.isNumber(op.y) ? op.y : indexOf(op.y, columns),
			name: indexOf(op.name, columns), 
			radius: id.isNumber(op.radius) ? op.radius : indexOf(op.radius, columns), 
			status: id.isNumber(op.status) ? op.status : indexOf(op.status.id, columns),
			format: columns[(id.isNumber(op.x) ? op.x : indexOf(op.x, columns))].format
		};

		for (var i = 0; i < n; i++)
		{
			var row = rows[i];

			data[i] = 
			{ 
				type: Type.xy,
				x: row[index.x] != null  ? row[index.x] : '', 
				y: row[index.y] != null  ? row[index.y] : '', 
				name: id.cos.labelOf(row[index.name]),
								
				marker:
				{ 
					radius: row[index.radius],
					fillColor: colorOf(row[index.status])
				} 
			};
			
			setMinMax(data[i].x, plus);
		}
		
		if (definition.xAxis.labels.formatter) 
			return false;
					
		definition.xAxis.format = index.format;

		switch (index.format)
		{
			case cos.number:   
			case cos.absolute: 
				definition.xAxis.labels.formatter = function() { 
					return id.gui.chart.formatNumber(((this.value / this.tickInterval) * this.tickInterval), decimalOf(this.tickInterval));
				};
				break;
				
			case cos.percent:  
				definition.xAxis.labels.formatter = function() { 
					return id.gui.chart.formatPercent(((this.value / this.tickInterval) * this.tickInterval), decimalOf(parseFloat(this.tickInterval) * 100)); 
				}; 
				break;
		}
	
		// Infos for xAxis
		// like labeling, ..

		definition.xAxis.data = data;
		
		if (op.xAxis)
		{
			definition.xAxis.title = definition.xAxis.title || {}; 

			if (op.xAxis.titleByLabel) definition.xAxis.title.text = columns[index.x].label;
			if (op.xAxis.titleByFormat) definition.xAxis.title.text = labelOfFormat(formatOf(columns[index.x]));
		}

		// YAxis
		
		if (op.yAxis) 
		{
			definition.yAxis.title = definition.yAxis.title || {}; 

			if (op.yAxis.titleByLabel)
				definition.yAxis.title.text = columns[index.y].label;
		}
	
		function colorOf(status)
		{
			//return op.status.colors ? op.status.colors[status] : (op.status.color || undefined /* = HC default color */)
			for (var statusId = 0; statusId < op.status.colors.length; statusId++)
				if (status == op.status.colors[statusId].code) return op.status.colors[statusId].col;
		}
		
		return sp;
	}	
	
	function setSeriesWaterfall(definition, option, obj, chart)
	{
		var insert = !chart;
		var op = option.transform;
		var columns = obj.columns || definition.plus.columns; 
		var rows = obj.rows;
		var n = rows.length - (obj.sum && !definition.plus.showTotal ? 1 : 0);
		var divHeight = definition.plus.$place[0].clientHeight;
		var low = 0;
		var max = 0;
		var y = 0;
		var j, i, row, idRow, sum;
		
		var sp = addSeries(definition, { id: option.id, name: option.id, label: id.cos.labelOf(obj), data: [] });
		var data = sp.data;
		var plus = definition.plus;

		if (insert)	setXAxis(definition, obj);
	
		var index = { y: indexOf(op.y, columns), status: indexOf(op.status.id, columns) };
		
		for (j = 0; j < n; j++)
		{
			idRow = rows[j];
			max = max + idRow[index.y];
		}
		
		sum = max / divHeight;

		for (i = 0; i < n; i++)
		{
			row = rows[i];
			
			if (low == 0)
			{
				if (row[index.y] < sum)	y = row[index.y] + sum;
				else	y = row[index.y];	
			}	
			else
			{
				if (row[index.y] < sum)	y = row[index.y] + sum + low;
				else	y = row[index.y] + low;	
			}

			data[i] = 
			{ 
				low: low, 
				y: y,
				name: row[index.y],
				color: colorOf(row[index.status])
			};

			low = y;
			
			if (y != null) setMinMax(y, plus);
		}
		
		function colorOf(status)
		{
			for (var statusId = 0; statusId < op.status.colors.length; statusId++)
				if (status == op.status.colors[statusId].code) return op.status.colors[statusId].col;
		}
		
		return sp;
	}

	function setSeriesHLine(definition, option, obj, chart)
	{
		var insert = !chart;
		var op = option.transform;
		var columns = obj.columns || definition.plus.columns; 
		var rows = obj.rows;
		var n = rows.length - (obj.sum && !definition.plus.showTotal ? 1 : 0);
		var divHeight = definition.plus.$place[0].clientHeight;
		var max = 0;
		var j, idRow, i, row, sum, lineHeight;
		
		var sp = addSeries(definition, { id: option.id, name: option.id, label: id.cos.labelOf(columns[indexOf(option.id, columns)]), type: Type.candlestick, yAxis: op.yAxis, data: [] });
		var data = sp.data;

		if (insert)	setXAxis(definition, obj);
	
		var index = { id: indexOf(option.id, columns)};
		
		for (j = 0; j < n; j++)
		{
			idRow = rows[j];
			max = max + idRow[index.id];
		}
		
		sum = max / divHeight;

		for (i = 0; i < n; i++)
		{
			row = rows[i];
//			lineHeight = row[index.id] - sum;

			data[i] = 
			{ 
				open: 	row[index.id],
				high: 	row[index.id],
				low: 		row[index.id], 
				close: 	row[index.id]
			};
		}

		return sp;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Axis
	// ---------------------------------------------------------------------------------------------- //
	
	function setXAxis(definition, obj)
	{
		definition.xAxis = transpose($.extend(definition.xAxis, { plus: { labels: []}, data: []}), 0, obj.rows, cos.colCategories, { text: true });
		definition.xAxis.categories = definition.xAxis.plus.labels;
	}
	
	function setYAxis(definition, obj)
	{
		 // Standard formatter,
		 // if there's no explicit formatter.
		
		if (definition.yAxis) 
		{
			var yAxis = definition.yAxis;
		
			if (id.isArray(yAxis))
			{
				// for (var i = 0; i < yAxis.length; i++)
				// 	_setYAxis(yAxis[i], obj);
				_setYAxis(definition, obj, yAxis[0]);
			}
			else _setYAxis(definition, obj, yAxis);
		}
	
		function _setYAxis(definition, obj, yAxis)
		{
			var plus = definition.plus || {};
			var axis = plus.yAxis || {};
			var column = columnOf(obj.columns, axis.column) || (isXY(definition) ? obj.columns[getYAxisIndexForXY(obj.columns)] : obj.columns[cos.colData]);
		
			// Dynamic correction of a preset axis minimum,
			// which fall below by the delivered values.
			
			if (yAxis.min && definition.plus && definition.plus.min !== undefined)
				if (yAxis.min > definition.plus.min)
					yAxis.min = definition.plus.min

			// Set standard formatter,
			// if there's no explicit formatter.

			if (!yAxis.labels) yAxis.labels = {};
			if (!yAxis.title) yAxis.title = {};
			if (axis.titleByTable) yAxis.title.text = obj.label;
			if (axis.titleByColumn) yAxis.title.text;

			if (yAxis.labels.formatter) 
				return false;
				
			if (!column) 
				return false;

			switch (yAxis.format = formatOf(column))
			{
				case cos.number:   
				case cos.absolute: 
					yAxis.labels.formatter = function() { 
						return id.gui.chart.formatNumber(((this.value / this.tickInterval) * this.tickInterval), decimalOf(this.tickInterval)); 
					};
					break;
					
				case cos.percent:  
					yAxis.labels.formatter = function() { 
						return id.gui.chart.formatPercent(((this.value / this.tickInterval) * this.tickInterval), decimalOf(parseFloat(this.tickInterval) * 100)); 
					}; 
					break;
			}
			
			if (axis.titleByFormat) 
				yAxis.title.text = labelOfFormat(yAxis.format);
			
			return true;
			
		}
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
			
				for (var j = 0; j < columns.length; j++)
				if (!(option.ignore || (option.tooltip && option.tooltip.at)) && option.id == columns[j].id)
				{
					if (option.transform && option.transform.type) 
					{
						type = option.transform.type; 
						color = option.transform.color;
					}
					cache += htmlOf(columns[j], option.color || colors[i] || color, option.type || type);
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
		
		if (obj.$place.hasClass(css.noPrint)) {
			return false;
		}
		
		if (flag || (obj.services && obj.services.length == 0)) {
			obj.$scope.find('#'+obj.id + place.printSuffix).removeClass(css.isSelect).empty();
			return false;
		}
		
		if (!obj.$scope.find('#'+obj.id + place.printSuffix).exist()) {
			$printSelect = $('<div id="'+obj.id + place.printSuffix+'" class="'+css.isSelect+' '+css.print+'"></div>');
			obj.$place.parent().append($printSelect);
		} else {
			$printSelect = obj.$scope.find('#'+obj.id + place.printSuffix);
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
					id: 'png',
					label: id.lang.get('downloadPNG'),
					callback: function () { exportChart('png');  }
				},
				{
					id: 'jpg',
					label: id.lang.get('downloadJPG'),
					callback: function () { exportChart('jpg');  }
				},
				{
					id: 'pdf',
					label: id.lang.get('downloadPDF'),
					callback: function () { exportChart('pdf');  }
				},
				{
					id: 'svg',
					label: id.lang.get('downloadSVG'),
					callback: function () { exportChart('svg'); }
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
			
		function exportChart(type) {
			var chart = obj.$place.data('object');
			var mimeType, flag = true;
		
			if (obj.$place.hasClass(css.disableLegendForExport)) 
				flag = false;
			
			switch (type)
			{
				case 'png': 
					mimeType = 'image/png'
					break;
				
				case 'jpg':
					mimeType = 'image/jpeg'
					break;
				
				case 'pdf': 
					mimeType = 'application/pdf'
					break;
					
				case 'svg': 
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
	
	function setLabel(obj, flag) { if (obj.label) placeOfLabel(obj.getPlace()).text(flag ? obj.label : ''); }
	function showProgress($place) { placeOfLabel($place).addClass(css.call); }
	function hideProgress($place) { placeOfLabel($place).removeClass(css.call); }
	
	function placeOfLabel($place) { return $place.parent().parent().find('label'); }
	
	// ---------------------------------------------------------------------------------------------- //
	// Events
	// ---------------------------------------------------------------------------------------------- //

	function addEvents(obj, options)
	{
		options = options || obj.getPlace().data('object').options;
		
		// Add legend events
		
		if (options.plus.$legend && (options.plus.extraLegend.enabled != false))
			options.plus.$legend.unbind('click'+ns).bind('click'+ns, { obj: obj }, atLegend);
			
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
			debug('Resizing Chart ..');
			setSize(obj);
		}
	}
				
	function atLegend(e)
	{
		var chart = e.data.obj.getPlace().data('object');
		var $item = $(e.target);
		
		if ($item.is('a')) $item = $item.parent();
		else if ($item.is('span'))	$item = $item.parent().parent();
		
		var serie = serieOf(chart, $item.attr(attr.serie));
		
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
			redraw(serieOf(chart, $(this).attr(attr.serie)), $(this));
		});
		
		function redraw(serie, $item)
		{
			if (id.isIE()) setTimeout(draw, 1);
			else draw();
		
			function draw()
			{
				if (show) {
					$item.removeClass(css.disabled);
					if ($item.attr(attr.serie)) serie.show();
				} else {
					$item.addClass(css.disabled);
					if ($item.attr(attr.serie)) serie.hide();
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

		debug('CLICKED ["'+(point ? point : x+'"/"'+y)+'"]');

		// Service handling

		var columns = chart.options.plus.columns;
		var column = this.type == 'xy' ? columnOf(columns, chart.options.plus.series[0].transform.name) : columnOf(columns, y);
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
		
			debug('CALL '+service.url);
			
			id.service.call(task, service, { $form: task.getPlace() });
		}
	}

	function atSeriesHover(event)
	{
		var entered = event.type == "mouseOver" ? true : /* mouseOut */ false;
		var x = this.series.chart.options.xAxis.data[this.x];
		var y = this.series.name;

		// debug((entered ? 'ENTERED' : 'LEFT')+' ["'+x+'"/"'+y+'"]');
		
		if (entered)
		{
			var column = columnOf(this.series.chart.options.plus.columns, y);
	
			if (column && column.services) 
				id.setPointer('pointer');
		}
		else id.setPointer('auto');
		
		// Legend hightlighting
		// Tooltip handling
	}
	
	function setYAxisMax(definition, chart, obj, force)
	{
		atRedraw(definition, chart, obj, force);
	}
	
	function atRedraw(definition, chart, obj, force)
	{
		var yAxis = chart.yAxis[0];
		var xAxis = chart.xAxis[0];
		var extremesY = yAxis.getExtremes();
		var extremesX = xAxis.getExtremes();
		var minY, maxY, minX, maxX;
		
		if (force === undefined) force = false;

		if (isXY(definition)) {
		
			if (extremesY.dataMax == '' && extremesY.dataMax == '') {	
				minY = -1;
				maxY = 1;
				chart.options.yAxis.min = minY;
				chart.options.yAxis.max = maxY;
			}
			
			if (extremesX.dataMax == '' && extremesX.dataMax == '') {	
				minX = -1;
				maxX = 1;
				chart.options.xAxis.min = minX;
				chart.options.xAxis.max = maxX;
			}
			
			yAxis.setExtremes(minY, maxY, false, false);
			xAxis.setExtremes(minX, maxX, force, false);
			
		} else {
		
			if ((extremesY.dataMax === null && extremesY.dataMin === null) || (extremesY.dataMax == 0 && extremesY.dataMin == 0)) {
				minY = 0;
				maxY = 1;
			} else if (extremesY.dataMax == 0) {
				maxY = 0;
			} else if (extremesY.dataMax < 0) {
				maxY = 0;
			} else {
				if (obj.columns[cos.colData]) {
					switch (yAxis.format = formatOf(obj.columns[cos.colData])) 
					{
						case cos.number:  maxY = extremesY.dataMax; break;
						case cos.absolute:  maxY = extremesY.dataMax; break;
						case cos.bytes:  maxY = extremesY.dataMax; break;
						//default:  max = 1; break;
					}
				}
			}
			
			chart.yAxis[0].setExtremes(minY, maxY, force, false);
		}
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
	
	function getFormat(template, x, y)
	{
		var formats = template.items;
		var format;

		// Two kinds of template formats:
		// - One format without format specification
		// - More formats with format 
		
		if (!formats) return template;
		
		if (formats.length == 1) 
		{
			// There's only one format ..
		
			debug('Using default format (there\'s only one).');
			return formats[0];
		}
		
		// Find the wanted format
		// in the template series.
		
		// First: Both is defined,
		// that's the right bet.
		
		for (var i = 0; i < formats.length; i++)
		{
			format = formats[i].format;	
		
			if ((format.x == x) && (format.y == y))
			{
				debug('Using format = { '+format.x+', '+format.y+' }');
				return formats[i];
			}
		}

		// Second: only one is defined,
		// a short definition.

		for (var i = 0; i < formats.length; i++)
		{
			format = formats[i].format;	
		
			if ((format.x == x) || (format.y == y))
			{
				debug('Using format = { '+(format.x ||format.y)+' }');
				return formats[i];
			}
		}
		
		// Nothing found ..
		
		return null;
	}

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //
	
	function cellOf(row, columns, item)
	{
		for (var i = 0; i < columns.length; i++)
			if (columns[i].id == item)
				return id.cos.valueOf(row[i]);
				
		return 0;
	}

	function serieOf(chart, serie)
	{
		for (var i = 0; i < chart.series.length; i++)
			if (chart.series[i].name == serie)
				return chart.series[i];
	
		return 0;
	}
		
	function formatOf(obj)
	{
		return obj.format || (obj.type == cos.number ? cos.number : undefined);
	}

	function columnOf(columns, name)
	{
		for (var i = 0; columns && i < columns.length; i++)
			if (columns[i].id == name)
				return columns[i];

		return null;
	}

	function decimalOf(tickInterval)
	{
		var decimals = 0;
		
		if (tickInterval) {
			if (tickInterval.toString().indexOf('.') != -1) {
				decimals = tickInterval.toString().split('.');
				decimals = decimals[1];
				decimals = decimals.length;
			}
		}
		
		return decimals;
	}
	
	function indexOf(aID, columns)
	{
		for (var i = 0; i < columns.length; i++)
			if (columns[i].id == aID)
				return i;
					
		return -1;
	}
		
	function addSeries(definition, obj)
	{
		if (!definition.series) definition.series = [];
		definition.series.push(obj || {});
			
		return definition.series[definition.series.length-1];
	}
	
	function setMinMax(value, plus)
	{
		value = Number(value);

		if (plus.max == undefined || plus.max < value) plus.max = value;
		if (plus.min == undefined || plus.min > value) plus.min = value;
		
		return plus;
	}

	function isXY(definition)
	{
		return definition.plus && definition.plus.series && definition.plus.series[0] && definition.plus.series[0].transform && definition.plus.series[0].transform.type == Type.xy;
	}
	
	function getYAxisIndexForXY(columns)
	{
		var index;
		
		$.each(columns, function(i, item) {
			if (item.id == 'y') {
				index = i;
			}
		});
		
		return index;
	}
	

	// ---------------------------------------------------------------------------------------------- //
	// Serializer
	// ---------------------------------------------------------------------------------------------- //

	function serialize( map, field, $element, wanted )
	{
		var chart = $element.data('object');
		var value, flag = true;
		
		if ($element.hasClass(css.disableLegendForExport)) 
			flag = false;
		
		if (!chart) 
			return false;
	
		if (chart.getSVG) value = chart.getSVG({ 
			chart: {
				width: prefs.chartWidth,
            	height: prefs.chartHeight
            },
			legend: { enabled: flag }
		});
		
		map[field] = value;
		
		return true;
	}
	
	function labelOfFormat(format)
	{
		switch (format)
		{
			case cos.number:   return id.firstLetter(id.lang.get('numberOf'));
			case cos.percent:  return id.firstLetter(id.lang.get('percent'));
			case cos.absolute: return id.firstLetter(id.lang.get('numberOf'));
		}
	}
     

	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function debug(message) { id.debug(me+message, { type: id.gui.chart.id }); }

}());