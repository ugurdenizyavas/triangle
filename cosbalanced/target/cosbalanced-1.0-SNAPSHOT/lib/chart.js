/*
	File: chart.js
	Purpose: COS based charting with Highcharts
	Needs: chart.client.js for web client usage.

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

		// Object Manager

		prepare: prepare,
		init: init,
		update: update,
		destroy: destroy,

		// Template Functions

		cellOf: cellOf,
		columnOf: columnOf,
		serieOf: serieOf,

		// Template Formatter

		formatTime:    function(value) { return id.isString(value) ? (value.slice(3,5) == '00' ? value.slice(0,2) : false) : false; },
		formatPercent: function(value, decimals) { return id.formatPercent(value, { decimals: decimals, optimized: true }); },
		formatNumber:  function (value, decimals) { return id.formatNumber(value, { decimals: decimals }); },
		bytesToSize:   function (value, decimals) { return id.bytesToSize(value, { decimals: decimals }); },
		numbersToSize: function (value, decimals) { return id.numbersToSize(value, { decimals: decimals }); },
		secondsToHms:  function (value) { return id.secondsToHms(value); },
		labelOf:       function(series) { return series.chart.series[series.index].options.label; },

		infoOf:	function(value, series)
		{
			for	(var i = 0; i < series.options.tooltip.length; i++)
				if (series.options.tooltip[i].value == value)
					return series.options.tooltip[i].info;
		},

		// Client Functionality
		// given by overloading those functions.

		atTooltip:     function() { return warn('atTooltip'); },
		setPrint:      function() { return warn('afterShow'); },
		getTemplate:   function() { return warn('getTemplate'); },
		loadTemplate:  function() { return warn('loadTemplate'); },
		setLabel: setLabel,

		beforePrepare: function() { return false; }, afterPrepare: function() { return false; },
		beforeInit:    function() { return false; },
		beforeSet:     function() { return false; }, afterSet:     function() { return false; },
		beforeDraw:    function() { return false; }, afterDraw:    function() { return false; },
		beforeUpdate:  function() { return false; }, afterUpdate:  function() { return false; },
		beforeDestroy: function() { return false; }, afterDestroy: function() { return false; }
	};

	function warn(fn) { return id.warn(me+'No implementation of "'+fn+'" in core package.'); }

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	var prefs = { chartWidth: 735, chartHeight: 540 };

	// Vocabulary

	var css = { isChart: 'isChart', disableLegendForExport: 'disableLegendForExport' };
	var cos = { colCategories: 0, colData: 1, chart: 'chart', percent: 'percent', number: 'number', absolute: 'absolute', allPlus: '+', bytes: 'bytes' };
	var Type = { bar: 'bar', column: 'column', scatter: 'scatter', standard: 'standard', line: 'line', hline: 'hline', waterfall: 'waterfall', xy: 'xy', candlestick: 'candlestick', pieChart: 'pieChart' };

	var pid = id.gui.chart.id;
	var me = id.meOf(id.gui.chart);
	var ns = id.namespaceOf(id.gui.chart);

	// Register

	id.object.register(id.gui.chart, { docType: css.isChart, serializer: serialize });

	// ---------------------------------------------------------------------------------------------- //
	// Init, Update, ...
	// ---------------------------------------------------------------------------------------------- //

	function prepare(obj)
	{
		id.gui.chart.beforePrepare(obj);

		destroy(obj);
		setLabel(obj, true);

		id.gui.chart.afterPrepare(obj);
	}

	function init(obj, template, options)
	{
		id.gui.chart.beforeInit(obj, template);

		destroy(obj);
		obj.isContent(true);

//		if (!(obj.rows && obj.rows.length > 0))
//		{
//			debug('No data found, nothing to do ..');
//			return false;
//		}

		// if no data found
		if (!obj.rows) { obj.rows = []; }

		if (template || (template = id.gui.chart.getTemplate(obj))) realize(obj, template, options);
		else if (!id.gui.chart.loadTemplate(obj, realize)) return false;
	}

	function update(obj)
	{
		var chart = obj.getPlace().data('object');

		if (!chart)
			return id.error(me+'Update on unknown chart "'+obj.id+'".');

		id.gui.chart.beforeUpdate(obj, chart);

		setSeries(chart.options, obj, chart);
		atRedraw(chart.options, obj, chart, /* force = */ true);
		chart.redraw();

		id.gui.chart.afterUpdate(obj, chart);
	}

	function destroy(obj)
	{
		var chart = obj.getPlace().data('object');

		if (!chart)
			return false;

		debug(obj.getInfo('destroy'));

		id.gui.chart.beforeDestroy(obj, chart);

		chart.destroy(obj);
		delete chart;

		if (id.isMozilla())
		{
			// TODO Check, if necessary after all the time ..
			// With this setting is FF3's memory
			// nearly constant. Effects on IE are unclear yet,
			// may be negative ....

			obj.getPlace().empty();
		}

		// setTimeout(function() { obj.getPlace().empty(); }, 1);

		obj.getPlace().removeData('object');

		id.gui.chart.afterDestroy(obj);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Realizer
	// ---------------------------------------------------------------------------------------------- //

	function realize(obj, template, options)
	{
		var x, y, definition;

		// Secondly,
		// get the right template format related to the format of category and values.

		// Format of the category
		// must be set.

		x = obj.columns[cos.colCategories].format;

		// Format of the first column of the COS based table
		// related to the format tag ('percent', ...) or the type ('number').

		if (obj.columns[cos.colData])
			y = formatOf(obj.columns[cos.colData]);


		if (!(definition = getFormat(template, x, y)))
			return id.error(me+'Missing template for {'+x+', '+y+' } for chart "'+obj.getIndex()+'"', { critical: true });

		// Third,
		// fill the definition of Highcharts
		// with categories, data, ...

		id.measure(pid, { type: pid, reset: true });

		set()
		draw();

		id.measure(pid, { type: pid, info: obj.id });

		function set()
		{
			id.gui.chart.beforeSet(definition, x, y, obj);

			setup(definition, obj);

			setID(definition, obj);
			setTitle(definition, obj);
			setSeries(definition, obj);
			setYAxis(definition, obj);

			id.gui.chart.afterSet(definition, obj);
		}

		function draw()
		{
			id.gui.chart.beforeDraw(definition, obj, chart);

			if (options && options.callback) {
				options.callback(definition);
				return false;
			}

			var chart = new Highcharts.Chart(definition);

			if (!chart.get)
			{
				// TODO: Check if necessary after all the time ...
				// Empty chart object
				// delivered, if area was emptied meanwhile,
				// by choosing another template for example.

				return false;
			}

			obj.getPlace().data('object', chart);
			atRedraw(definition, obj, chart, /* force = */ true);

			id.gui.chart.afterDraw(definition, obj, chart);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Get Format (in the definition ...)
	// ---------------------------------------------------------------------------------------------- //

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
	// Set Chart Options
	// ---------------------------------------------------------------------------------------------- //

	function setup(definition, obj)
	{
		// Simplifying
		// the JSON based definition by presetting useless definition.

		if (!definition.title) definition.title = { text: null };
		if (!definition.credits) definition.credits = { enabled: false };
		if (!definition.colors) definition.colors = [];
		if (!definition.exporting) definition.exporting = { enabled: false };

		// Prepare
		// own definition.

		definition.plus = definition.plus || {};

		//if (definition.plus.extraLegend)	definition.legend = { enabled: false }; disabled because of some intersection when exporting the svg
		definition.plus.task = obj.getTask();
		definition.plus.$place = obj.getPlace();

		$.extend(definition.chart,
		{
			events:
			{
				redraw: function (event) {
					atRedraw(event.target.options, obj, event.target, false);
				}
			}
		});
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

	// ---------------------------------------------------------------------------------------------- //
	// Transformer
	// ---------------------------------------------------------------------------------------------- //

	function setSeries(definition, obj, chart)
	{
		var insert = !chart;
		var plus = definition.plus || {};
        // plus.max = 1;
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
							if (so[i].zIndex)    	spi.zIndex = so[i].zIndex;
							if (so[i].pointWidth)   spi.pointWidth = so[i].pointWidth;
							if (so[i].groupPadding)   spi.groupPadding = so[i].groupPadding;
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

						// the column index is j, not i !!!
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
					spi.setData(transpose({}, columns, rows, i, { hideTotal: hideTotal }).data, /* don't redraw */ false);
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
				// Registering values,
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

			case Type.pieChart: // ...
				setSeriesPieChart(definition, option, obj, chart);
				break;

			default: return id.error(me+'Unknown transformer type "'+plus.transform.type+'"!');
		}

		return true;
	}

	// ---------------------------------------------------------------------------------------------- //
	// XY
	// ---------------------------------------------------------------------------------------------- //

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
				status: row[index.status] != null  ? row[index.status] : '',

				marker:
				{
					radius: row[index.radius],
					fillColor: colorOf(row[index.status])
				}
			};

			setMinMax(data[i].x, plus);
		}

		if (!definition.xAxis.labels.formatter) {
			//return false;

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

	// ---------------------------------------------------------------------------------------------- //
	// Waterfall
	// ---------------------------------------------------------------------------------------------- //

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

	// ---------------------------------------------------------------------------------------------- //
	// HLine
	// ---------------------------------------------------------------------------------------------- //

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
	// PieChart
	// ---------------------------------------------------------------------------------------------- //

	function setSeriesPieChart(definition, option, obj, chart)
	{
		var insert = !chart;
		var op = option.transform;
		var columns = obj.columns || definition.plus.columns;
		var rows = obj.rows;
		var n = rows.length - (obj.sum && !definition.plus.showTotal ? 1 : 0);
		var j, i, column, label, value;

		var sp = addSeries(definition, { label: id.cos.labelOf(obj), data: [] });
		var data = sp.data;

		for (j = 0; j < columns.length; j++)
		{
			if (columns[j].id == op.id) column = j;
		}

		for (i = 0; i < n; i++)
		{
			data[i] =
			[
				label = rows[i][column] ? (rows[i][column].label ? rows[i][column].label : "") : 0,
				value = rows[i][column] ? (rows[i][column].value ? rows[i][column].value : 0) : 0
			];
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
	// Events
	// ---------------------------------------------------------------------------------------------- //

	function atRedraw(definition, obj, chart, force)
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
	// Snippets
	// ---------------------------------------------------------------------------------------------- //

	function setLabel(obj, flag)
	{
		if (obj.label)
			placeOfLabel(obj).text(flag ? obj.label : '');
	}

	function placeOfLabel(obj) {
		var $place = obj.getPlace();
		var $task = obj.getTask().getPlace();
		var $previous = $place.prev();

        if ($previous.is('label')) {
 			return $previous;
 		} else {
 			return $task.find('label[for = '+ obj.id +']');
 		}
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

	function serialize(map, field, $element, wanted)
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

	// ---------------------------------------------------------------------------------------------- //
	// Debug
	// ---------------------------------------------------------------------------------------------- //

	function debug(message) { id.debug(me+message, { type: id.gui.chart.id }); }

}());