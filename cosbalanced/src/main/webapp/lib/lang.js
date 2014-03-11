/*
	File: lang.js
	Purpose: Language layer.
	
	$Author: udy $
*/

(function()
{
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Public Interface
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //

	id.lang = 
	{
		id: 'lang',
	
		init: init,
		update: init /* no difference yet */,
	
		get: getWord,
		setLang: setLanguage,

		getLang: function() { return language; },
		getMonths: function(size, lang) { return getSet('months', size ? size : 'medium', lang); },
		getDays: function(size, lang) { return getSet('weekdays', size ? size : 'medium', lang); },
	
		isGerman: function() { return language == 'de'; },
		isEnglish: function() { return language == 'en'; },
	
		all: function() { return dictionary; }
	};
	
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Private
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //

	var prefs = { lang: 'en' };
	var cos = { label: 'label', list: 'list' };

	var language = prefs.lang; 
	var languages = 0; 
	var dictionary = 0;
	
	var me = id.meOf(id.lang);
	
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Init
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	
	function init(obj)
	{
		languages = obj.langs;
		dictionary = obj.items;
		
		checkLanguage();
	}

	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Dictionary
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	
	function getWord(id, lang)
	{
		if (dictionary) 
		{
			if (!lang) lang = language;
		
			for (var i = 0; i < dictionary.length; i++)
				if (dictionary[i].type != cos.list && dictionary[i].id == id)
					return dictionary[i][cos.label][lang];
		}
		
		// Didn't find it ...
		
		return '['+id+']';
	}
	
	function getSet(set, size, lang)
	{
		if (dictionary) 
		{
			if (!lang) lang = language;
		
			for (var i = 0; i < dictionary.length; i++)
				if (dictionary[i].type == cos.list && dictionary[i].id == set)
					return dictionary[i][size][lang];
		}
		
		return 0;
	}

	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Language
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	
	function setLanguage(lang, service)
	{
		if (lang) 
		{
			language = lang.slice(0,2);
			note(service ? 'service "'+service+'"' : 'user');
		}

		else if (getPageLanguage()) 
		{
			language = getPageLanguage().slice(0,2);
			note('page');
		}

		else if (getBrowserLanguage()) 
		{
			language = getBrowserLanguage().slice(0,2);
			note('browser');
		}
		
		else 
		{
			language = prefs.lang;
			note('preferences');
		}
		
		setPageLanguage(language);
		checkLanguage(language);
		
		function note(owner) { id.note(me+'Language "'+language+'" set by '+owner+'.'); }
	}
	
	function checkLanguage()
	{
		if (languages && !id.isMember(languages, language))
		{
			// Limitations of used languages,
			// set by the dictionary.
		
			id.warning(me+'Language "'+language+'" not supported, switched to "'+prefs.lang+'".');
			
			language = prefs.lang;
			setPageLanguage(language);
		}
	}

	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Snippets
	// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //

	function setPageLanguage(lang) { $('html').attr('lang', lang).attr('xml:lang', lang); }
	function getPageLanguage() { return $('html').attr('lang'); }
	function getBrowserLanguage() { return id.isIE() ? navigator.userLanguage : navigator.language; }

}());
