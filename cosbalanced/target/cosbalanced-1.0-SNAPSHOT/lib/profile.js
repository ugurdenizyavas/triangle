/*
	File: profile.js
	Purpose: Setting user profile (language, ...)

	$Author: udy $

*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.profile =
	{
		init: init,
		update: init /* no difference yet */
	};
	
	var place = { application: 'application', environment: 'environment' };
	
	// ---------------------------------------------------------------------------------------------- //
	// Init
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		// Only one thing today:
		// Set the language by the profile service.

		id.profile.data = obj;

		if(!!obj.mandator){
			$('body').addClass(obj.mandator.toLowerCase());
		}

		if (obj.lang) id.lang.setLang(obj.lang, obj.id);
		
		var appId = id.getParameter('application.id');
		var system = { application: obj.application, version: obj.version, revision: obj.revision, environment: obj.environment };
		
		if (system.environment) {
			if (system.environment) $('#'+appId+'-'+place.environment).text(system.environment);
		}
		
		if (system.application) {
			if (system.application) $('#'+appId+'-'+place.application).text(system.application);
		}
		
		if (system.environment && system.application) {
			if (id.gui.about) id.gui.about.setSystem(system);
		} 

		// Add some user stuff, later.
	}

}());