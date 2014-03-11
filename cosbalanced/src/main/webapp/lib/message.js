/*
	File: message.js
	Purpose: Managing server errors.
	Needs: id Namespace (id.js)
	
	$Author: udy $
*/

(function()
{ 
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.message = 
	{
		id: 'message',
		
		init: init,
		status: status,
		communicationError: communicationError,
		//serviceError: serviceError,
	
		setReceiver: function(aReceiver) { prefs.receiver = aReceiver; },
		setSubject: function(aSubject) { prefs.subject = aSubject; }
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var prefs = 
	{ 
		maxLength: 1900 /* Windows clients .... Achtung Windows Umlaute! */, 
		maxLines: 10,
		receiver: 'ikarus.developers@celebi.com',
		subject: 'Error Report for Celebi'
	};

	var css = { dump: 'dump', line: 'hr', modal: 'modal', wrapper: 'tableWrapper', grid: 'gridTable', foot: 'tabfooter', inner: 'inner', buttons: 'buttons', button: 'button', close: 'close', wrap: 'wrap', hint: 'hint', readonly: 'readonly' };
	var place = { report: 'report', error: 'errorContent', buttons: 'actions' };
	var cos = { close: 'close', message: 'message', critical: 'critical', error: 'error', warn: 'warn', info: 'info', hint: 'hint', debug: 'debug', ticketID: 'ticketID' };
	var label = { code: 'Code', url: 'URL', type: 'Type', time: 'Time', description: 'Description', cause: 'Cause', exception: 'Exception', message: 'Message', note: 'Note', title: 'Title', button: 'Report', ticketID: 'Ticket ID', level: 'Level', details: 'Details', hint: 'Last User Actions' };
	var httpCode = { unauthorized: '401', accessDenied: '403' };
	
	var ns = id.namespaceOf(id.message); 

	var formats = /* for communication error */ 
	{ 
		jboss /* JBoss Application Server Message */: 
		{
			id: { form: /\<title\>(.*(jboss|tomcat).*error.*report.*)\<\/title\>/i },
			
			description: { form: /<p><b>description<\/b>.*/,   start: '<u>',   end: '</u>' },
			type:        { form: /<p><b>type<\/b>.*/,          start: '</b>',  end: '</p>' },
			message:     { form: /<p><b>message<\/b>.*/,       start: '<u>',   end: '</u>' },
			// note:     { form: /<p><b\>note<\/b>.*/,         start: '<u>',   end: '</u>' },
			exception:   { form: /<p><b>exception<\/b>.*/,     start: '<span class="pre">', end: '</span>', dump: true },
			cause:       { form: /<p><b>root cause<\/b>.*/,    start: '<span class="pre">', end: '</span>', dump: true }
		},
		
		apache /* Apache Webserver Message */: 
		{
			id: { form: /\<address\>(.*Apache.*)\<\/address\>/i },
			
			description: { form: /<p>.*/, 		start: '<p>',   end: '</p>' },
			type:        { form: /<title>.*/,	start: '<title>',  end: '</title>' }
		}

		/* Other application server ... */
	};
	
	// ---------------------------------------------------------------------------------------------- //
	// Switch to the different levels
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj, options)
	{
		var url = options && options.url ? location.hostname+location.pathname+options.url : location.hostname+location.pathname+location.hash;
		var options = options || {};
			
		options = { url: url };
		
		switch (obj.level)
		{
			case cos.critical	: levelCritical(obj, options); break;
			case cos.error		: levelError(obj, options); break;
			case cos.warn		: levelWarn(obj, options); break;
			case cos.info		: levelInfo(obj, options); break;

			case cos.hint    	: 
			case cos.debug   	: 
			case undefined		: break;
		}
	}
			
	// ---------------------------------------------------------------------------------------------- //
	// Communication Error
	// ---------------------------------------------------------------------------------------------- //

	function communicationError(message, options)
	{
		// System message after communicatio error.
		//	Parse and show this in a modal error dialog.
		var options = options || {};
		var text = message.responseText;
		var httpStatus = message.status;
		var time = Date();
		var info = {};
		var parts, fp, message = 0;
		options.windowMode = 'error';
		options.button = { label: 'Report' };
		
		text = text.replace(/<pre>/g, '<span class="pre">').replace(/<\/pre>/g, '</span>').replace(/\n/g, '<br/>');
	
		for (var format in formats)
			if (formats[format].id.form.test(text))
			{
				fp = formats[format];
			
				options.headline = 'Communication Error';
				
				for (var attribute in fp)
				{
					if (attribute == 'id')
						continue;
						
					if (parts = fp[attribute].form.exec(text))
					{
						info[attribute] = {};
					
						info[attribute].value = parts[0].slice(parts[0].indexOf(fp[attribute].start)+fp[attribute].start.length, parts[0].indexOf(fp[attribute].end));
						info[attribute].label = label[attribute];

						if (fp[attribute].dump) 
							info[attribute].dump = fp[attribute].dump;
						
						if (attribute == 'message' && info[attribute].value.length)
							message = info[attribute].value;
					}
				}

				info.url = { value: options.url, label: label.url };
				info.time = { value: time.toString(), label: label.time  };		
		
				if (message)
				{
					if (httpStatus == httpCode.unauthorized)
					{
						unauthorizedError(info, options);
						break;
					} 
					else if (httpStatus == httpCode.accessDenied) {
						accessError(info, options);
						break;
					}
				}

				show(info, options);
				break;
			}
	}
	
	// ----------------------------------------------------------------------------------------------- //
	// Communication Error
	// ----------------------------------------------------------------------------------------------- //
	
	function accessError(aInfo, options)
	{
		var info = {};
		var url = options.url;
		
		options.windowMode = 'error';
		
		if ((i = url.indexOf('#')) != -1)
			url = url.slice(0, i);
		
		info.description = aInfo.description;
		info.time = aInfo.time;
		info.url = aInfo.url;
		
		options.button = { label: 'Login', url: url };
		
		show(info, options);
	}
	
	function unauthorizedError(aInfo, options)
	{
		var info = {};
		var url = options.url;
		
		options.windowMode = 'warning';
		
		if ((i = url.indexOf('#')) != -1)
			url = url.slice(0, i);
		
		options.headline = id.lang.get('pleaseLogin');
		info.description = { value: id.lang.get('unauthorizedLogin')};
		options.button = { label: 'Login', url: url };
		
		show(info, options);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Service Critical
	// ---------------------------------------------------------------------------------------------- //

	function levelCritical(obj, options)
	{
		// System message after service error.
		var time = new Date();
		var info = {};
		var url = options.url;
		
		options.windowMode = 'error';
		
		if (obj.label) options.headline = obj.label;
		else options.headline = 'Internal Service Error';
		
		options.receiver = obj.contact;
		options.subject = obj.subject;
		options.button = { label: 'Report' };
		
		if (obj.level) options.level = { value: obj.level, label: label.level  };
		if (obj.description) info.description = { value: obj.description.label, label: label.description };
		info.time = { value: time.toString(), label: label.time };
		if (obj.ticketId) info.ticket = { value: obj.ticketId, label: label.ticketID };
		if (obj.details) info.details = { value: obj.details, label: label.details };
		info.url = { value: url, label: label.url };
		info.hint = { value: '', label: label.hint };
		
		show(info, options);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Message Error
	// ---------------------------------------------------------------------------------------------- //

	function levelError(obj, options)
	{
		var time = new Date();
		var info = {};
		
		options.windowMode = 'error';
		
		if (obj.label) options.headline = obj.label;
		else options.headline = 'Internal Service Error';
		
		if (obj.level) options.level = { value: obj.level };
		if (obj.description) info.description = { value: obj.description.label, label: label.description };
		if (obj.type && obj.code) info.type = { value: obj.code+' '+obj.code, label: obj.type };
		info.time = { value: time.toString(), label: label.time };
		if (obj.ticketId) info.ticket = { value: obj.ticketId, label: label.ticketID };
		
		show(info, options);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Message Warn
	// ---------------------------------------------------------------------------------------------- //

	function levelWarn(obj, options)
	{
		var time = new Date();
		var info = {};
		
		options.windowMode = 'warning';
		if (obj.label) options.headline = obj.label;
		
		if (obj.level) options.level = { value: obj.level };
		if (obj.description) info.description = { value: obj.description.label, label: label.description };
		info.time = { value: time.toString(), label: label.time };
		if (obj.ticketId) info.ticket = { value: obj.ticketId, label: label.ticketID };
		
		show(info, options);
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Message Info
	// ---------------------------------------------------------------------------------------------- //

	function levelInfo(obj, options)
	{
		var time = new Date();
		var info = {};
		
		options.windowMode = 'info';
		if (obj.label) options.headline = obj.label;
		
		if (obj.level) options.level = { value: obj.level };
		if (obj.description) info.description = { value: obj.description.label, label: label.description };
		info.time = { value: time.toString(), label: label.time };
		if (obj.ticketId) info.ticket = { value: obj.ticketId, label: label.ticketID };
		
		show(info, options);
	}

	// ---------------------------------------------------------------------------------------------- //
	// Show the error info in a modal dialog
	// ---------------------------------------------------------------------------------------------- //
	
	function show(info, options)
	{	
	    var button = '<a class="'+ css.button +'"><span>'+ id.lang.get(cos.close) +'</span></a>';
		var cache = '';
		var flag = true;

		info.profile = {label:'Profile', value: getProfileData()};
		
		cache += '<div><div class="'+css.modal+'"><div class="'+css.wrapper+'">';
		cache += '<table class="'+css.grid+'"><tr><td class="'+place.error+' '+(options.level ? options.level.value : '')+'">';
		
		$.each(info, function(i, item) {
			if (item.value && item.value.length > 0 || i == 'hint')
			{
				if ( (i == "type" || (i == "details" || i == "time" ) || i == "code" || i == "hint") && flag  ) { 
					cache += '<div class="'+css.line+'"></div>';
					flag = false;
				}
				
				var classes = (i ? i : '') + (item.dump ? ' '+item.dump : '');
				cache += '<div'+(classes.length > 0 ? ' class="'+classes+'"' : '')+'>'+(item.label ? '<label>'+item.label+'</label>' : '' )+(i == 'details' || i == 'hint' ? '<div class="'+css.wrap+'"><textarea '+(i== 'details' ? 'readonly="readonly" class="'+css.readonly+'"' : '' )+'>'+item.value+'</textarea></div>' : '<p>'+item.value+'</p>')+'</div>';
			}
		});
				
		cache += '</td></tr></table></div>';
		cache += '<div class="'+css.foot+'"><div class="'+css.inner+'"><div class="'+css.buttons+'" id="'+place.buttons+'"></div></div>';
		cache += '</div></div>';
			
		var $dialog = new Boxy(cache, { title: options.headline, windowMode: options.windowMode, draggable: true, modal: false, unloadOnHide: true, cache: true });
		
		$dialog.boxy.find('#'+place.buttons).append(button);
		$dialog.boxy.find('#'+place.buttons).children('a:eq(0)').unbind('click'+ns).bind('click'+ns, function() { $dialog.hide()})
            .children('span').text(id.lang.get('close'));
		
		if (options.button) {
			$dialog.boxy.find('#'+place.buttons).append(button);
			$dialog.boxy.find('#'+place.buttons).children('a:eq(1)')
				.attr('href', options.button.url ? window.location.protocol+'//'+options.button.url : mailto(info, options))
				.children('span').text(options.button ? options.button.label : label.button);
				
			$dialog.boxy.find('.'+css.hint+' textarea').unbind('blur'+ns).bind('blur'+ns, function() { 
				info.hint.value = $(this).val();
				$dialog.boxy.find('#'+place.buttons).children('a:eq(1)')
					.attr('href', options.button.url ? window.location.protocol+'//'+options.button.url : mailto(info, options));
			});
		}

		function getProfileData()
		{
			var values = '';

			for (var i in id.profile.data){
				var value = id.profile.data[i];
				if (id.typeOf(value) == 'string'){
					values += i + ': ' + value + ', '
				}
			}

			return values;
		}
	}	
		
	// ---------------------------------------------------------------------------------------------- //
	// Report per mail
	// ---------------------------------------------------------------------------------------------- //

	function mailto(info, options)
	{
		var prio = { description: true, hint: true, url: true, time: true, profile: true };
		var cutted = '[...]';
		var linefeed = '%0A';
		var report = '';

		report += 'mailto:'+(options.receiver ? options.receiver : prefs.receiver)+'?';
		report += 'subject='+encodeURIComponent(options.subject ? options.subject : prefs.subject);
		report += '&'+'body=';
		
		for (var i in prio) report += entry(info[i]);
		for (var i in info) if (!prio[i]) report += entry(info[i]);
						
		if (report.length > prefs.maxLength)
			report = report.slice(0, prefs.maxLength-cutted.length)+cutted;
				
		return report;

		function entry(item)
		{
			var value = '';
			var s = '';
		
			if (item && item && item.value && item.value.length > 0)
			{
				s += (item).label+':'+linefeed;
								
				// Replace URL based parameter notation,
				// because these are used bei mailto.
				
				value = item.value.replace(/<br\/>/g, linefeed).replace(/&/g, '[amp]').replace('#', '[hash]').replace(/\"/g, '[quot]');
				
				if (info.dump)
				{
					// Dumps with multiple lines 
					// cutted to max lines.
				
					for (var vp = value, n = 0, i = 0, j = 0; i < prefs.maxLines; i++)
					{
						if ((j = vp.indexOf(linefeed)+linefeed.length) == -1) break;
							
						n += j;	
						vp = vp.slice(j);
					}
					
					value = value.slice(0, n);
					if (i == prefs.maxLines) value += cutted;
				}
				
				s += value+linefeed+linefeed;
				
				return s;
			}
			
			return s;
		}
	}

}());	