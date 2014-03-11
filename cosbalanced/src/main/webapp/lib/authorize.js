/*
	File: authorize.js
	Date: November 2009
	Purpose: Authorization stuff ...
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.authorize =
	{ 
		id: 'authorize',
	
		check: check,
		realize: realize,
		setLogout: function(path) { prefs.path = path;  showLoginStatus(); }
	};

	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //

	var css = { error: 'error', text: 'text', button: 'button' };
	var place = { buttons: 'actions', status: 'servicestatus', content: 'content' };
	var cos = { authorization: 'authorization', redirect: 'redirect', close: 'close' };
	var status = { loginSucceeded: 0, logoutSucceeded: 1, loginFailed: 2, loginNeeded: 10, reloginNeeded: 11, insufficientRights: 20, redirectForLogin: 30, iframeLogin: 31 };	
	var template = { };
	var prefs = { path: 0 };

	var call = 0;
	var loggedIn = false; 
	var modal = 0;
	
	var me = id.meOf(id.authorize);
	var ns = id.namespaceOf(id.authorize); 

	// ---------------------------------------------------------------------------------------------- //
	// Extend 
	// ---------------------------------------------------------------------------------------------- //
	
	function extend(obj)
	{
		// TOTALLY INTERIMS!
		// ...
	
		obj.getIndex = function() { return obj.id };
		obj.isModal = function() { return obj; }
		obj.getPlace = function() { return obj.$place; }
		obj.getScope = function() { return $('#'+place.content); }
		obj.hasButtons = function() { return obj.services; }
		obj.isWidget = function() { return false; }
		obj.getKeys = function() { return 0; }
		obj.hide = function() { modal.hide(); }
		obj.isType = function(type) { return type == cos.authorization; }
		obj.getService = function() { return obj.services[0]; }
		obj.isItem = function() { return false; }
        obj.isContent = function(flag) { if (flag != undefined) content = flag; return content; }
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Check 
	// ---------------------------------------------------------------------------------------------- //
	
	function check(obj)
	{
		return obj.type == cos.authorization;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Process 
	// ---------------------------------------------------------------------------------------------- //
	
	function realize(obj, aCall)
	{		
		extend(obj);
	
		switch (parseInt(obj.status.code))
		{
			case status.loginSucceeded: 
			{
				// Login was successful,
				// so call the previous wanted call.
				
				if (call)
				{
					obj.hide();
					
					id.debug(me+': Update autocalls after login.')
					id.service.autocall(/* all auto services on current page */);

					id.debug(me+': Call wanted service "'+call.url+'" after succeeded login.');
					id.service.call(0, call, call.options);
					
					call = 0;	
				}
				
				break;
			}
			
			case status.logoutSucceeded:
			{
				id.note(me+': Session logout.');
				
				id.service.call(0, { url: $('meta[name="application.home"]').attr('content') });
				id.service.autocall(/* all auto services on current page */);
				
				break;
			}
			
			case status.loginFailed:
			{
				// User or Password unknown, ..
				// .. so stay in the dialog.
				
				error(obj);
				break;
			}

			case status.loginNeeded:
			case status.reloginNeeded:
			{
				// There must be a login
				// before the service call. 

				call = aCall;
				dialog(obj);
				break;
			}
			
			case status.insufficientRights:
			{
				// The user have no rights for this service,
				// may be a bookmark from a colleague.
				
				info(obj);
				break;
			}
			
			case status.redirectForLogin:
			{
				// The user is immediately redirected to the login page,
				
				redirectToLogin(obj);
				break;
			}
			
			case status.iframeLogin:
			{
				// Desmond iFrame login procedure
				
				iframeLogin(obj);
				break;
			}
			
			default: 
			{
				id.error(me+': Invalid or unknown status code '+obj.status.code+(obj.status.text ? ' ('+obj.status.text+')' : '')+'.');
				return false;
			}
						
		}
		
		return true;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Dialog 
	// ---------------------------------------------------------------------------------------------- //
	
	function dialog(obj)
	{
		if (!id.template.load(obj, { afterInjection: finalize }))
		{
			id.error(me+': Missing template for login.');
			return false;
		}
		
		return true;
		
		// Functions
		
		function finalize(obj, options)
		{
			var $place = options.$place; 

			modal = options.$place;
		
			if (obj.services)
			{
				// Button
				
				obj.$place = $place.find('#'+obj.id);
				id.gui.button.init(obj, $place.find('#'+place.buttons), { $form: $place });
				$place.find('input:first').focus();
				
				// Key
				
				id.key.register(obj, function() { id.service.call(obj, obj.services[0], { $form: $place })},  { keydown: [ 'enter' ] });
			}
			
			error(obj);
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Info 
	// ---------------------------------------------------------------------------------------------- //
	
	function info(obj)
	{
		// TODO
		// Move to message.js.
	
		obj.id = 'info';
	
		if (!id.template.load(obj, { afterInjection: finalize }))
		{
			id.error(me+': Missing template for info.');
			return false;
		}
		
		// Functions
		
		function finalize(obj, options)
		{
			var $place = options.$place; 

			modal = options.$place;
		
			$place.find('.'+css.text).empty().append('<p>'+obj.status.text+'</p>');
			$place.find('.'+css.button).bind('click'+ns, { obj: obj }, function(e) { 
				e.data.obj.hide(); 
			}).children('span').text(id.lang.get(cos.close));
		}
	}

	// ---------------------------------------------------------------------------------------------- //
	// Error 
	// ---------------------------------------------------------------------------------------------- //
	
	function error(obj)
	{	
		var $place = modal;
	
		if (!obj.status.text) return false;
		
		var $p = $('<p class="'+css.error+'">'+obj.status.text+'</p>').hide();
		
		$place.find('#'+place.status).html($p);
		$place.find('input:first').focus();

		if (id.isIE()) $p.show(); else $p.fadeIn('slow'); 
		
		return true;
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Login Status 
	// ---------------------------------------------------------------------------------------------- //
	
	function showLoginStatus()
	{	
		$('#loginStatus').find('a').bind('click'+ns, function() { id.service.call(0, { url: prefs.path }); })
	}

	// ---------------------------------------------------------------------------------------------- //
	// Redirect To Login
	// ---------------------------------------------------------------------------------------------- //
	
	function redirectToLogin(obj)
	{	
		var hash, url, objURL, objPath;
		
		if (obj.url) {
			hash = location.hash;
			url = obj.url + hash;
			objURL = obj.url.split("#");
			objPath = objURL[0];
			if (objURL[1]) hash = '#' + objURL[1];
			if ('http://'+ window.location.host + window.location.pathname == objPath || 'https://'+ window.location.host + window.location.pathname == objPath) {
				window.location.href = objPath + (hash ? hash : '');
				window.location.reload(true);
			} else {
				window.location.href = objPath + (hash ? hash : '');
			}
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Desmond iFrame login
	// ---------------------------------------------------------------------------------------------- //
	
	function iframeLogin(obj)
	{	
		if (!id.template.load(obj, { afterInjection: finalize }))
		{
			id.error(me+': Missing template for iframe login.');
			return false;
		}
		
		return true;
		
		// Functions
		
		function finalize(obj, options)
		{
			var $place = options.$place; 

			modal = obj.boxy;
		
			if (obj.url)
			{
				obj.$place = $place.find('#'+obj.id);
				//id.gui.button.init(obj, $place.find('#'+place.buttons), { $form: $place });
				$place.find('iframe:first').attr('src', obj.url);
			}
			
			error(obj);
		}
	}
	
}());