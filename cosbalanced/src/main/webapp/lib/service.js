/*
	File: service.js
	Purpose: Interplay with services (including HTTP/HTML loads)

	$Author: udy $
 */

(function() {
	// ----------------------------------------------------------------------------------------------
	// //
	// Public Interface
	// ----------------------------------------------------------------------------------------------
	// //

	id.service = {
		id : 'service',

		load : load,
		call : call,
		autocall : afterLoad,
		viaMultipart : viaMultipart,
		cancel : function() {
			queue.setObsolete();
		},

		setExternal : function(settings) {
			windowChild = settings;
		},
		setPath : function(path) {
			prefs.path = path;
		},
		setReload : function(flag) {
			prefs.reload = flag;
		},
		setRequestFormat : function(format) {
			prefs.requestFormat = format;
		},
		setSync : function(flag) {
			prefs.async = !flag;
		},
		setOfflinePriority : function(flag) {
			prefs.offlinePriority = flag;
		},
		setMothership : function(mothership) {
			prefs.mothership = mothership;
		},
		setCallbackName : function(jsonpCallback) {
			prefs.jsonpCallback = jsonpCallback;
		},

		setReload : function(after) {
			setReload('all', after);
		},
		setReloadIE : function(after) {
			setReload('ie', after);
		},
		setReloadFF : function(after) {
			setReload('ff', after);
		},
		setReloadWebkit : function(after) {
			setReload('webkit', after);
		},

		setOffline : setOffline,
		isOffline : isOffline,

		dump : dump
	};

	// ----------------------------------------------------------------------------------------------
	// //
	// Private
	// ----------------------------------------------------------------------------------------------
	// //

	// Vocabulary

	var attr = {
		service : 'service'
	};
	var cos = {
		json : 'json',
		url : 'url',
		init : 'init',
		reload : 'reload',
		multipart : 'multipart',
		filename : 'filename',
		uploadButton : 'uploadButton',
		cancel : 'cancel',
		none : 'none'
	};
	var css = {
		disabled : 'uploadDisabled',
		done : 'done',
		reload : 'reload'
	};
	var content = {
		json : 'application/json',
		url : 'application/x-www-form-urlencoded',
		charset : 'charset=UTF-8'
	};
	var method = {
		post : 'POST',
		get : 'GET'
	};
	var request = {
		json : 'json',
		url : 'url',
		jsonp : 'jsonp'
	};
	var reply = {
		script : 'script',
		json : 'json',
		html : 'html'
	};
	var httpHeader = {
		setIdInstance : 'x-id-set-instance',
		idInstance : 'x-id-instance'
	};

	// Preferences

	var prefs = {
		strictJSON : false,
		method : method.post,
		requestFormat : request.url,
		replyFormat : reply.json,
		fileExtension : 'json',
		async : true,
		path : 0,
		reload : {},
		serviceForgetAfter : 500, /* ms */
		uploadForgetAfter : 500, /* ms */
		offlinePriority : false,
		delay : 0 /* ms */,
		suffix : '-button',
		mothership : '',
		jsonp : 'jsonp',
		jsonpCallback : ''
	};

	// Variables

	var me = id.meOf(id.service);

	var requestID = 0;
	var wait = false;
	var queue = new Queue();
	var instance;
	var windowChild;
	var offline = false;

	// ----------------------------------------------------------------------------------------------
	// //
	// Load of HTML based content
	// ----------------------------------------------------------------------------------------------
	// //

	function load(file, options, afterLoad) {
		// Note (IE Bug)
		// IE doesn't like HTML loads with POST,
		// therefore using the method 'GET'.

		var callOptions = {};
		var options = options || {};

		$.extend(callOptions, {
			method : method.get,
			replyFormat : options.replyFormat || reply.html,
			cache : true,
			async : options.ascync || false,

			file : file,
			data : 0,
			fileName : file
		});

		$.extend(options, {
			afterCall : function(template, status, options, callOptions) {
				delete callOptions.afterCall;
				delete callOptions.file;

				if (status)
					id.error(me + 'File "' + callOptions.fileName + '" has "'
							+ status + '".');
				else
					debug('GOT '
							+ (this.replyFormat == reply.script ? template.id
									+ ' (' + (template.type || 'none') + ')'
									: '[' + id.htmlOf(template) + ']'));

				afterLoad(template, status, options, callOptions);
				return false /* everythings done, no function bubbling */;
			}
		});

		viaAJAX(/* obj = */0, options, callOptions);
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Call of Service
	// ----------------------------------------------------------------------------------------------
	// //

	function call(obj, service, options, callOptions) {
		options = options || {};
		callOptions = callOptions || {};
		wait = false;

		if (obj && obj.isItem())
			obj = obj.getOwner();
		if (service && !id.isObject(service))
			service = obj.getService(/* ID of */service);

		if (!service)
			return id.error(me + 'MISSING service'
					+ (obj ? ' ' + obj.getIndex() : '') + '!', {
				critical : true
			});

		if (service.locked) {
			id.debug(me + 'SKIP locked service "' + service.id + '".');
			return false;
		}

		var isWidget = obj && obj.isWidget();

		// Check on exit functionality.

		// If the current object has an exit function,
		// then call that before this call and wait
		// wait for response.

		if (!((service.type === cos.cancel) || (service.trigger === cos.cancel)
				|| options.whileExit || isWidget))
			id.object.leave(obj, {
				cause : service
			});

		if (wait && !isWidget) {
			queue.store({
				url : service.url,
				service : service,
				options : options,
				obj : obj
			});
			return false;
		}

		if (options.whileExit) {
			debug('SWITCH to synchronous calling mode.');
			wait = true;
		}

		// Check if confirmation of the service call
		// is required

		if (service.confirm) {
			id.gui.confirm.add({
				obj : obj,
				service : service,
				options : options,
				afterConfirm : finalize
			});
			return false;
		} else
			finalize(true, {
				obj : obj,
				service : service,
				options : options,
				callOptions : callOptions
			});

		function finalize(status, data) {
			if (status == true /* confirmed */)
				_call(data.obj, data.service, data.options, data.callOptions);

			else {
				queue.flush();
				wait = false;
			}
		}

		return true;
	}

	function _call(obj, service, options, callOptions) {
		options = options || {};
		callOptions = callOptions || {};

		// Action includes the service and optionally a function call,
		// which is "call" by default at the service backend.

		var collect = {};
		var via, url, i, parameters, reload;

		// -------------------------------------------------------------------------------------------
		// //
		// Reload
		// -------------------------------------------------------------------------------------------
		// //

		reload = hasReload(obj, service, options, callOptions);

		if (options.startup || reload) {
			// This must be a reload,
			// therefore make an initial load.

			collect.mode = cos.reload;
			options.reload = true;
		}

		// -------------------------------------------------------------------------------------------
		// //
		// Gathering all parameters (URL, keys, event parameters, form, ...)
		// -------------------------------------------------------------------------------------------
		// //

		if ((i = service.url.indexOf('?')) != -1) {
			// Parameters in the service URL itself ...

			if (!options.direct) {
				parameters = service.url.slice(i + 1);
				service.url = service.url.slice(0, i);

				id.serialize.addURL(collect, parameters);
			}
		}

		if (obj && obj.getKeys()) {
			// Essentiell parameters,
			// set by the keys of COS object.

			id.serialize.addParameters(collect, obj.getKeys());
		}

		if (service.parameters) {
			// Essentiell parameters,
			// typically set by the COS service object.

			id.serialize.addParameters(collect, service.parameters);
		}

		if (options.parameters) {
			// Additional parameters,
			// typically added by events, ...

			id.serialize.addParameters(collect, options.parameters);
		}

		if (options.map) {
			// Additional parameters given by a map,
			// typically added by events, ...

			id.serialize.addMap(collect, options.map);
		}

		if (options.$form) {
			// Parameters,
			// collected in a HTML area, not necessarily a form.

			id.serialize.addForm(collect, options.$form, {
				obj : obj,
				selection : service.parameters,
				type : service.type
			});
		}

		// -------------------------------------------------------------------------------------------
		// //
		// Defining the protocol, format, ...
		// -------------------------------------------------------------------------------------------
		// //

		if (options.format /* obsolete */)
			options.requestFormat = options.format;

		callOptions.method = service.method ? service.method.toLowerCase()
				: prefs.method;
		callOptions.requestFormat = service.requestFormat ? service.requestFormat
				.toLowerCase()
				: prefs.requestFormat;
		callOptions.replyFormat = service.replyFormat ? service.replyFormat
				.toLowerCase() : prefs.replyFormat;
		callOptions.external = service.external ? service.external : 0;
		callOptions.async = (service.sync || options.sync) ? false
				: prefs.async;
		callOptions.sid = service.id;
		callOptions.jsonp = service.mothership ? service.mothership : 0;

		if (callOptions.external) {
			callOptions.method = method.get;
			callOptions.requestFormat = request.url;
		}

		if (options.direct) {
			// iDevice Lib Calls

			options.method = method.post;
			options.requestFormat = request.json;
		}

		callOptions.data = (callOptions.requestFormat == request.json ? id.serialize
				.toJSON(collect)
				: id.serialize.toURL(collect));

		via = options.direct ? {
			url : service.url
		}
				: URLize(
						service.url,
						(options.reload && !options.startup)
								|| (callOptions.method == method.get && callOptions.requestFormat == request.url) ? callOptions.data
								: 0);
		if (via.file)
			callOptions.file = via.file;

		callOptions.url = via.url;

		if (callOptions.jsonp) {
			callOptions.replyFormat = request.jsonp;
			callOptions.requestFormat = request.jsonp;
			callOptions.jsonp = request.jsonp;
			callOptions.jsonpCallback = prefs.jsonpCallback;
			callOptions.url = prefs.mothership + '/' + via.url;
			callOptions.file = '';
		}

		// -------------------------------------------------------------------------------------------
		// //
		// Finally, do the call
		// -------------------------------------------------------------------------------------------
		// //

		if (prefs.offlinePriority
				&& viaOffline(callOptions.url, collect, obj, options))
			return;

		if (isOffline())
			viaOffline(callOptions.url, collect, obj, options, callOptions);
		else if (callOptions.external)
			viaHTML(options, callOptions);
		else if (!callOptions.startup && reload)
			viaReload(service.url, options, callOptions);
		else if (callOptions.requestFormat == cos.multipart)
			return collect;
		else
			viaAJAX(obj, options, callOptions);
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// AJAX/HTTP based communication
	// ----------------------------------------------------------------------------------------------
	// //

	function viaHTML(options, callOptions) {
		if (queue.isActive({
			url : callOptions.url,
			options : options,
			callOptions : callOptions
		})) {
			// Already in progress ..
			// .. maybe finger trouble.

			return false;
		}

		id.note(me + 'OPEN "' + callOptions.url + '" in a new window'
				+ (windowChild ? ' with "' + windowChild + '".' : '.'));

		var name, settings;

		if (id.isObject(callOptions.external)) {
			name = callOptions.external.id ? callOptions.external.id.replace(
					/\./g, '') : 'Zweitfenster';
			settings = windowChild;
			var newWindow = window.open(callOptions.url, name, settings);
			setTimeout(function() {
				if (!!newWindow && !!newWindow.location)
					newWindow.location.reload(true);
			}, 1000);
		} else if (id.isString(callOptions.external)) {
			name = callOptions.external;
			settings = '';
			var newWindow = window.open(callOptions.url, name, settings);
			setTimeout(function() {
				if (!!newWindow && !!newWindow.location)
					newWindow.location.reload(true);
			}, 1000);
		} else {
			name = id.isString(callOptions.external) ? callOptions.external
					: '_blank';
			settings = '';
			var newWindow = window.open(callOptions.url, name, settings);
		}

		return true;
	}

	function viaAJAX(obj, options, callOptions) {
		var data = {

			// Call parameters

			url : callOptions.file || callOptions.url,

			type : callOptions.method,
			data : callOptions.data,
			dataType : callOptions.replyFormat,
			contentType : (callOptions.requestFormat == cos.json ? content.json
					: content.url)
					+ '; ' + content.charset,
			converters : {
				"text script" : function(data) {
					return window["eval"]("(" + data + ")");
				}
			}, // window.eval ?!
			cache : (callOptions.cache !== undefined ? callOptions.cache
					: (options.file ? true : false)),
			async : (callOptions.async !== undefined ? callOptions.async
					: prefs.ascync),

			// Callbacks

			beforeSend : atSend,
			success : atSuccess,
			error : atError,

			jsonp : (options.callback != undefined ? options.callback
					: prefs.callback),
			jsonpCallback : (callOptions.jsonpCallback != undefined ? callOptions.jsonpCallback
					: prefs.jsonpCallback),

			// Own parameters

			requestID : ++requestID
		};

		if (!wait && queue.isActive({
			url : data.url,
			options : options,
			callOptions : callOptions
		})) {
			// Already in progress ..
			// .. maybe finger trouble.

			afterInit(obj, /* status = */0, options, callOptions);
			return false;
		}

		queue.store({
			requestID : data.requestID,
			url : data.url,
			call : data,
			options : options,
			callOptions : callOptions,
			obj : obj
		});
		$.ajax(data);

		return true;

		// -------------------------------------------------------------------------------------------
		// //
		// AJAX based events
		// -------------------------------------------------------------------------------------------
		// //

		function atSend(request) {
			var info = queue.get(this.requestID);

			if (instance)
				request.setRequestHeader(httpHeader.idInstance, instance);
			id.gui.panel.showProgress(this, info);
			debug((this.async == false ? 'SYNC\'ED ' : '') + this.type + ' '
					+ info.url + (this.data ? ' [' + this.data + ']' : ''));

			measure({
				reset : true
			});
		}

		function atSuccess(obj, status, request) {
			var info = queue.get(this.requestID);
			var options = info.options || {};
			var callOptions = info.callOptions || {};

			if (!welcome(this, /* status = */0, request, obj, info))
				return false;

			// Maybe some authorization problems ...
			// Todo: Move to object manager.

			if (id.authorize.check(obj))
				if (id.authorize.realize(obj, info) == true) {
					afterInit(obj, /* status = */0, options, callOptions);
					return true;
				}

			// Realize the received object
			// by the object management

			id.object.init(obj, options);

			afterInit(obj, /* status = */0, options, callOptions);

			// Set the URL for bookmarking, reloads, ..
			// .. set by the service or template load.

			if (obj.url)
				URLupdate(obj.url);

			if (wait) {
				if (obj.hasErrors() || obj.hasWarnings()) {
					queue.flush();
				} else {
					if (obj.mode != cos.none) {
						queue.process();
					} else {
						queue.flush();
						wait = false;
					}
				}

			}
		}

		function atError(request, status) {
			var options = queue.get(this.requestID).options || {};
			var callOptions = queue.get(this.requestID).callOptions || {};

			if (!welcome(this, status, request))
				return;

			// No init,
			// but after init ..

			afterInit(/* obj = */0, status, options, callOptions);

			if (wait) {
				queue.flush();
				wait = false;
			}

			// Typically it's a communication error,
			// like HTTP errors and/or application server errors.

			id.error(me + this.url + ' replied: ' + status, {
				critical : true
			});
			// if (request) id.message.communicationError(request, { url:
			// location.hostname+location.pathname+'#'+this.url });
			if (request)
				id.message.communicationError(request, {
					url : 'localhost:16580/UserAdministration/services/authentication/authorize?baseUrl='
							+ location
				});
		}

		function welcome(that, status, request, obj, info) {
			measure({
				info : URLclean(that.url)
			});

			if (request.getResponseHeader(httpHeader.setIdInstance))
				instance = request.getResponseHeader(httpHeader.setIdInstance);

			id.gui.panel.hideProgress(that, info);
			queue.remove(that.requestID);

			// Maybe that reply has been obsolete

			if (info && info.obsolete) {
				id.note(me + 'IGNORE obsolete reply of service "' + that.url
						+ '".');
				return afterInit(obj, status, options, callOptions);
			}

			// It's possible to register a callback
			// and that it will be done the whole job.

			return afterCall(obj, status, options, callOptions);
		}
	}

	// -------------------------------------------------------------------------------------------
	// //
	// Callbacks
	// -------------------------------------------------------------------------------------------
	// //

	function afterCall(obj, status, options, callOptions) {
		if (id.test)
			id.test.afterCall(obj, status, options);

		if (options && options.afterCall)
			if (options.afterCall(obj, status, options, callOptions) == false /*
																				 * everything's
																				 * done
																				 */)
				return false;

		return true;
	}

	function afterInit(obj, status, options, callOptions) {
		if (id.test)
			id.test.afterInit(obj, status, options);

		if (options && options.afterInit)
			options.afterInit(obj, status, options, callOptions);

		else if (callOptions && callOptions.afterInit)
			callOptions.afterInit(obj, status, options, callOptions);
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Via Offline
	// ----------------------------------------------------------------------------------------------
	// //

	function viaOffline(url, request, obj, options, callOptions) {
		options = options || {};
		callOptions = callOptions || {};
		url = url.slice(url.indexOf('/'));

		var response = id.object.service(url, request, obj);

		if (prefs.offlinePriority && !response) {
			// Look, if there's
			// an offline service,
			// otherwise check online service

			return false;
		}

		debug((prefs.offlinePriority ? 'PRIO\'ED ' : '') + 'OFFLINE call '
				+ url);

		afterCall(response, /* status = */true, options, callOptions);
		if (response)
			id.object.init(response);
		afterInit(response, /* status = */true, options, callOptions);

		return response ? true : id.warn(me + 'No offline service for "' + url
				+ '".');
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Reload
	// ----------------------------------------------------------------------------------------------
	// //

	function viaReload(url, options, callOptions) {
		id.note(me + 'RELOAD by service call "' + url + '"!');

		location.hash = url + (callOptions.data ? '?' + callOptions.data : '');
		location.reload();
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Multipart Upload
	// ----------------------------------------------------------------------------------------------
	// //

	function viaMultipart(obj, service, collect) {
		var collect = {}, info = {}, processKey = '', $modal, $filename, $saveButton, $uploadButton;
		var ns = id.namespaceOf(id.gui.upload);
		info.obj = obj;
		info.url = service.url;

		$modal = obj.getTask().getPlace();
		$filename = $modal.find('#' + cos.filename);
		$saveButton = $modal.find('#' + service.id + prefs.suffix);
		$uploadButton = $('#' + cos.uploadButton + prefs.suffix);

		if (obj && obj.getKeys()) {
			id.serialize.addParameters(collect, obj.getKeys());
			processKey = '?' + id.serialize.toURL(collect);
		}

		if ($saveButton.hasClass(css.done))
			$saveButton.removeClass(css.disabled);
		else
			$saveButton.addClass(css.disabled);

		if ($uploadButton.size() > 0) {
			var upload = new AjaxUpload($uploadButton, {
				action : 'services/' + service.url + processKey,
				name : 'userfile',
				data : [],
				autoSubmit : false,
				responseType : 'json',
				onChange : function(file, extension) {
					setTimeout(function() {
						$filename.val(file);
						$saveButton.removeClass(css.disabled)
								.addClass(css.done).one('click' + ns,
										function() {
											upload.submit();
										});
					}, 500);
				},

				onSubmit : function(file, extension) {
					this.setData(uploadData(obj, service));
					// this.disable();
					id.gui.panel.showProgress(obj, info);
				},

				onComplete : function(file, response) {
					setTimeout(function() {
						$saveButton.removeClass(css.disabled)
								.addClass(css.done).one('click' + ns,
										function() {
											upload.submit();
										});
					}, prefs.uploadForgetAfter);

					id.object.init(response, {});
					// this.enable();

					id.gui.panel.hideProgress(obj, info);
				},

				onError : function(response) {
					var request = {};
					request.responseText = response;
					request.status = '500';
					id.message.communicationError(request, {});
				}
			});

			function uploadData(obj, service) {
				var data = {};

				// obj.$scope.find('input,
				// textarea').not('.none').each(function()
				// {
				// data[ $(this).attr('id') ] = $(this).val();
				// });

				data = _call(obj, service, {
					$form : obj.getTask().getPlace()
				});

				return data;
			}
		}
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Automatic calls
	// ----------------------------------------------------------------------------------------------
	// //

	function afterLoad(options, callOptions) {
		// Every HTML element with an attribute "service"
		// triggers a call ..

		options = options || {};
		callOptions = callOptions || {};

		var $root = options.$place || $(document.body);
		var service = {};

		$root.find('[' + attr.service + ']').each(function() {
			// var op = $.extend(options, { $place: $(this) });
			service.url = $(this).attr(attr.service);

			call(0, service, {
				$place : $(this),
				startup : options.startup
			});
		});
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// URL Handling
	// ----------------------------------------------------------------------------------------------
	// //

	function URLize(url, parameters) {
		var data = {
			url : '',
			file : ''
		};
		var i;

		// OFFLINE MODE
		// Working on filesystem, with .json files.

		if (location.href.indexOf('file:') == 0) {
			if (url.indexOf('.' + prefs.fileExtension) != -1)
				data.file += (prefs.path ? prefs.path + '.'
						+ prefs.fileExtension + '/' : '')
						+ url;
			else {
				data.file += (prefs.path ? prefs.path + '.'
						+ prefs.fileExtension + '/' : '')
						+ url;
				if ((i = data.file.indexOf('?')) != -1)
					data.file = data.file.slice(0, i);
				if (prefs.fileExtension != undefined)
					data.file += '.' + prefs.fileExtension;
			}

			// Without parameters, yet,
			// because files are only provided service/function combinations.
		}

		// ONLINE MODE
		// Working with services, driven by URL based parameters.

		if (url.match(/^[a-z:]+:\/\//) /* || url.match(/\//) */)
			data.url = url;
		else if (url.indexOf(prefs.path + '/') != -1)
			data.url = url;
		else
			data.url += (prefs.path ? prefs.path + '/' : '') + url;

		if (parameters)
			data.url += (data.url.indexOf('?') == -1 ? '?' : '&') + parameters;

		return data;
	}

	function URLclean(url) {
		// Cleanup URL
		// - without ending non-caching parameter ('_=16767774...')
		// - without ending '&'
		// - without ending '?'

		// Note:
		// IE doesn't work with url[pos] .. therefore using charAt().

		var i;

		if ((i = url.indexOf('_=')) != -1)
			url = url.slice(0, i);
		if (url.charAt(url.length - 1) == '&')
			url = url.slice(0, url.length - 1);
		if (url.charAt(url.length - 1) == '?')
			url = url.slice(0, url.length - 1);

		return url;
	}

	function URLupdate(url) {
		if (location.hash === '#' + url)
			return /* id.debug(me+'IGNORE none URL update for '+url) */;

		// Add the service to the URL
		// by using the hash ('#'+<service> without path of service)

		var i;

		if ((i = url.indexOf(prefs.path + '.' + prefs.fileExtension + '/')) != -1)
			url = url.slice(prefs.path.length + 1 + prefs.fileExtension.length
					+ 1);
		else if ((i = url.indexOf(prefs.path)) != -1)
			url = url.slice(prefs.path.length + 1);

		location.hash = URLclean(url);

		// debug('Updating location with "'+location.hash.slice(1)+'"');
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Queueing of Service Calls
	// ----------------------------------------------------------------------------------------------
	// //

	// Queueing for several reasons
	// - Withholding of synced calls.
	// - Avoiding multiple instances of the same call.
	// - Ignoring obsolete service calls (replaced by newer service calls while
	// the old one is still in progress).
	// - Buffering options and object of caller.
	// - Preparing common service calls.

	function Queue() {
		var interface = {
			store : store,
			remove : remove,
			get : get,
			process : process,
			flush : flush,
			isActive : isActive,
			setObsolete : setObsolete,
			all : all
		};
		var queue = []; // new Array();

		// Basics

		function all() {
			return queue;
		}

		function store(data) {
			if (!data.requestID)
				debug('WITHHOLD "' + data.url + '".');
			queue.push(data);

			// dump();
		}

		function remove(item) {
			// Removing after a little delay (prefs.forgetAfter)
			// to prevent this double clicked multiple service calls
			// even for high responsive services.

			if (prefs.serviceForgetAfter)
				setTimeout(_remove, prefs.serviceForgetAfter);
			else
				_remove();

			function _remove() {
				if (id.isNumber(item))
					item = {
						requestID : item
					};

				for ( var i = 0; i < queue.length; i++)
					if (isIdentical(queue[i], item)) {
						// debug('FORGET service call "'+queue[i].url+'".');
						queue.splice(i, 1);

						break;
					}
			}

			// dump();
		}

		function get(requestID) {
			for ( var i = 0; i < queue.length; i++)
				if (queue[i].requestID && queue[i].requestID == requestID)
					return queue[i];

			return null;
		}

		// Withhold calls
		// Waiting for finishing the

		function process() {
			for ( var i = 0; i < queue.length; i++)
				if (!queue[i].requestID /* not active yet */) {
					debug('PROCESS queued service call "'
							+ queue[i].service.url + '".');
					_call(queue[i].obj, queue[i].service, queue[i].options);

					queue.splice(i, 1);
				}
		}

		function flush() {
			for ( var i = 0; i < queue.length; i++)
				if (!queue[i].requestID) {
					id.note(me + 'FLUSH queued service call "' + queue[i].url
							+ '".');
					queue.splice(i, 1);
				}
		}

		// Active calls

		function isActive(item) {
			if (item.options.force)
				return false;

			for ( var i = 0; i < queue.length; i++)
				if (queue[i].requestID) {
					if (isIdentical(queue[i], item) && !queue[i].options.reload) {
						id
								.warning(me
										+ 'IGNORE service call "'
										+ item.url
										+ '" - already in progress, maybe finger trouble.');
						return true;
					}

					if (isSimiliar(queue[i], item) && !queue[i].options.reload) {
						if (!queue[i].obsolete) {
							id.note(me + 'RENEW service call "' + item.url
									+ '" - forget previous call.');
							queue[i].obsolete = true;
						}
					}
				}

			return false;
		}

		// Conditions for Identity
		// - Same request IDs
		// - Same URL && same parameters

		function isIdentical(d1, d2) {
			if (d1.requestID && d2.requestID && (d1.requestID == d2.requestID))
				return true;
			if ((d1.url == d2.url) && d1.options && d2.options
					&& (d1.options.data == d2.options.data))
				return true;

			return false;
		}

		// Conditions for Similarity
		// - Same request IDs

		function isSimiliar(d1, d2) {
			return d1.url == d2.url ? true : false;
		}

		function setObsolete() {
			if (!queue.length)
				return false;

			id.note(me + 'FORGET obsolete service calls!')

			for ( var i = 0; i < queue.length; i++)
				if (!queue[i].obsolete) {
					id.note(me + 'FORGET obsolete service call "'
							+ queue[i].url + '".');
					queue[i].obsolete = true;
				}
		}

		return interface;
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Reload Handling
	// ----------------------------------------------------------------------------------------------
	// //

	function setReload(item, after) {
		prefs.reload.active = prefs.reload.active || (after ? true : false);
		prefs.reload[item] = after;
	}

	function hasReload(obj, service, options, callOptions) {
		var reload = false;

		if (prefs.reload.active) {
			reload = service.reload || options.reload
					|| (obj.$place && obj.$place.hasClass(css.reload));

			if (reload) {
				// The reload counter is given by common (all)
				// or is differd by browser (ie, ...).

				var count = (id.isIE() && prefs.reload.ie)
						|| (id.isMozilla() && prefs.reload.ff)
						|| (id.isWebkit() && prefs.reload.webkit);

				if (count === undefined)
					count = prefs.reload.all;

				if (count) {
					if (prefs.reload.count === undefined)
						prefs.reload.count = count;
					prefs.reload.count--;
					if (prefs.reload.count > 0)
						reload = false;

					id.debug(me + 'Wait ' + prefs.reload.count
							+ ' times before reload.');
				}

				else
					reload = false;
			}
		}

		return reload;
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Offline Mode
	// ----------------------------------------------------------------------------------------------
	// //

	function setOffline(flag) {
		offline = flag;
		id.note(me + 'Client is now ' + (offline ? 'OFFLINE!' : 'online.'));

		if (offline)
			id.object.atOffline();
		else
			id.object.atOnline();
	}

	function isOffline() {
		return offline;
	}

	// ----------------------------------------------------------------------------------------------
	// //
	// Debug
	// ----------------------------------------------------------------------------------------------
	// //

	function debug(message) {
		id.debug(me + message, {
			type : id.service.id
		});
	}
	function measure(options) {
		id.measure(id.service.id, $.extend({
			type : id.service.id
		}, options || {}));
	}

	function dump() {
		var qp = queue.all();

		if (!qp.length)
			id.tell('No queued service calls.');
		else
			for ( var i = 0; i < qp.length; i++)
				id.tell('Service[' + qp[i].requestID + '] = { '
						+ (qp[i].url ? 'url: ' + qp[i].url : '')
						+ (qp[i].obsolete ? ' OBSOLETE' : '') + ' }');
	}

}());