/*
	File: file.js
	Purpose: Using the client sided filesystem.
	$Author: udy $
*/

(function()
{

	// ---------------------------------------------------------------------------------------------- //
	// Preferences
	// ---------------------------------------------------------------------------------------------- //

	var Prefs =
	{
		maxSize: 1*1024*1024 /* 1MB */,
		separator: '\n'
	};

	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.file =
	{
		id: 'file',
		Prefs: Prefs,
	
		// ------------------------------------------------------------------------------------------- //
		// Init
		// ------------------------------------------------------------------------------------------- //
	
		init: function(options)
		{
			options = options || {};
		
			if (!FileSystem)	
				return id.error(me+'No filesystem on this browser!', { critical: true });
				
			StorageInfo.requestQuota(PERSISTENT, Prefs.maxSize, function(grantedBytes) 
			{
				FileSystem(window.PERSISTENT, grantedBytes, function(fs) 
				{ 
					options.fs = space = fs;
					 
					if (options.afterInit)
						options.afterInit(fs, options);
						
				}, onError);
			});
		},
		
		// ------------------------------------------------------------------------------------------- //
		// Read
		// ------------------------------------------------------------------------------------------- //
		
		read: function(fileName, options)
		{
			options = options || {};
		
			spaceOf(options).root.getFile(fileName, { create: false, exclusive: false }, function(fileEntry) 
			{
				fileEntry.file(function(file)
				{
					var reader = new FileReader();
					
					$.extend(reader,
					{
						onerror: onError,
						
						onloadend: function(e) 
						{ 
							id.debug(me+'Read "'+this.result+'".'); 
	
							if (options.afterRead)
								options.afterRead(fileName, options);
						}
					});
					
					reader.readAsText(file);
				});
			}, onError);
		},
	
		// ------------------------------------------------------------------------------------------- //
		// Write
		// ------------------------------------------------------------------------------------------- //
		
		write: function(fileName, text, options)
		{
			options = options || {};
	
			spaceOf(options).root.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) 
			{
				fileEntry.createWriter(function(writer)
				{
					var append = options.append && writer.length;
	
					$.extend(writer,
					{
						onerror: onError,
						
						onwriteend: function(e) 
						{ 
							id.debug(me+(append ? 'Append' : 'Write')+' "'+text+'".'); 
						
							if (options.afterWrite)
								options.afterWrite(fileName, options);
						}
					});
					
					var blob = new BlobBuilder();
					
					if (append) 
					{
						writer.seek(writer.length);
	
						if (Prefs.separator)
							blob.append(Prefs.separator);
					}
	
					blob.append(text);
	
					writer.write(blob.getBlob('text/plain'));
					
				});
			}, onError);
		},
		
		// ------------------------------------------------------------------------------------------- //
		// Remove
		// ------------------------------------------------------------------------------------------- //
		
		remove: function(fileName, options)
		{
			options = options || {};
	
			id.file.check(fileName, function(fileEntry) 
			{
				fileEntry.remove(function()
				{
					id.note(me+'"'+fileName+'" removed.');
					after();
				});
	
			}, function() 
			{ 
				// File doesn't exist,
				// nothing to do.
				
				id.note(me+'"'+fileName+'" does not exist.');
				after();
				
			}, options);
			
			function after()
			{
				if (options.afterRemove)
					options.afterRemove(fileName, options);
			}
		},
	
		// ------------------------------------------------------------------------------------------- //
		// Check 
		// ------------------------------------------------------------------------------------------- //
		
		check: function(fileName, onSuccess, onFail, options)
		{
			spaceOf(options).root.getFile(fileName, { create: false, exclusive: false }, onSuccess, onFail);
		}
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	var me = id.meOf(id.file);
	
	var FileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	var BlobBuilder = window.WebKitBlobBuilder;
	var StorageInfo = window.webkitStorageInfo;
	var FileReader = window.FileReader;

	var space = null;
	
	// ---------------------------------------------------------------------------------------------- //
	// On Error
	// ---------------------------------------------------------------------------------------------- //
		
	function onError(e) 
	{
		var errors = 
		[
			{ code: FileError.NOT_FOUND_ERR, text: 'File not found' },
			{ code: FileError.SECURITY_ERR, text: 'Security violated' },
			{ code: FileError.ABORT_ERR, text: 'Aborted ...' },
			{ code: FileError.QUOTA_EXCEEDED_ERR, text: 'Quota exceeded' },
			{ code: FileError.INVALID_MODIFICATION_ERR, text: 'Modification not allowed' },
			{ code: FileError.INVALID_STATE_ERR, text: 'Invalid state' }
		];
			
		for (var i = errors.length; i--; )
			if (errors[i].code === e.code)
				return id.error(me+'Error('+e.code+'): '+errors[i].text+'!');
 
		return id.error(me+'Unknown error('+e.code+')');
	};

	// ---------------------------------------------------------------------------------------------- //
	// Snippets
	// ---------------------------------------------------------------------------------------------- //
		
	function spaceOf(options) { return (options && options.fs) ||space; }

}());
