/*
	File: id.js
	Purpose: ID base functionality
	
	$Author: udy $
*/

// ------------------------------------------------------------------------------------------------- //
//	Namespace, Objects, ...
//	------------------------------------------------------------------------------------------------- //

if (id === undefined) var id = {};
if (id.gui === undefined) id.gui = {};
if (id.services === undefined) id.services = {};

id.css = new $.DCSS();

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //

	id.package = function(type, options) 
	{
		var packages =
		{
			// Basic Services
	
			'profile': id.profile,
			'dictionary': id.lang,
			'template': id.template,
			'console': id.console,
			'timer': id.timer,
			'process': id.gui.panel,
			'task': id.gui.dialog
		};
		
		// Mapping between type IDs and objects
	
		if (!packages[type] && (options && !options.ask)) 
			id.error('Unknown object type "'+type+'" requested.');
		
		return packages[type];
	};

}());

	
