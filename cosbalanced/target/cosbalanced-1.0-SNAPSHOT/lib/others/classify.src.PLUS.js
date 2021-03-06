//--------------------------------------------------------------------------
//
//  Classify.js v@VERSION
//  http://classify.petebrowne.com/
//
//  Copyright (c) 2010, Pete Browne
//
//--------------------------------------------------------------------------

(function() {

	//----------------------------------
	//  Constants
	//----------------------------------

	var FUNCTION = 'function', STRING = 'string',

	//----------------------------------
	//  Internal Properties
	//----------------------------------

	// The namespace where the keyword methods will be attached to.
		namespace = this,

	// The current scope to define Classes, Modules, and Methods on.
		currentObject = namespace,

	// The current Class to define Methods on.
		currentClass = null,

	// Flag to signal when we are initializing a superclass during inheritance
		inheriting = false;


	//----------------------------------
	//  Internal Methods
	//----------------------------------

	// Builds a new Class, with optional inheritance.
	function buildClass(name, superclass) {
		function Class() {
			if (!inheriting && typeof this.initialize == FUNCTION) {
				this.initialize.apply(this, arguments);
			}
		}

		if (superclass != null) {
			inheriting = true;
			Class.prototype = new superclass();
			for (var method in superclass) {
				if (typeof superclass[method] == FUNCTION) {
					namespace.def({ object:Class, name:method, method:superclass[method] });
				}
			}
			inheriting = false;
		}

		Class.superclass = superclass;
		Class.prototype.constructor = Class;
		Class.prototype.toString = function() {
			return '[object ' + this.constructor.toString() + ']';
		};
		Class.prototype.abstractError = function abstractError() {
			return console.error("method is not yet implemented" );
		};

		addName(currentObject, Class, name);

		return Class;
	}

	// Builds a new module.
	function buildModule(name) {
		return addName(currentObject, {}, name);
	}

	// Adds a toString method that returns the name of the object
	function addName(currentObject, object, name) {
		object.toString = function(includeModules) {
			if (includeModules === false || currentObject == null || currentObject === namespace) {
				return name;
			} else {
				return currentObject + '.' + name;
			}
		};
		return object;
	}

	// Add the given methods to the object.
	function addDefinition(withClass, withObject, definition) {
		if (withObject == null || definition == null) {
			return;
		}

		var oldClass = currentClass, oldObject = currentObject;

		currentClass = withClass;
		currentObject = withObject;

		if (typeof definition == FUNCTION) {
			definition.call(withObject);
		} else {
			for (var name in definition) {
				if (!(/^(constructor|prototype|toString|valueOf)$/).test(name)) {
					namespace.def({ name:name, method:definition[name] });
				}
			}
		}

		currentClass = oldClass;
		currentObject = oldObject;
	}

	// If necessary add a `callSuper` method to access the superclass's method.
	function addCallSuper(definition, superDefinition) {
		if (typeof superDefinition == FUNCTION && callsSuper(definition)) {
			return function() {
				var defArgs = arguments, oldSuper = this.callSuper, result;

				this.callSuper = function() {
					return superDefinition.apply(this, arguments.length ? arguments : defArgs);
				};

				result = definition.apply(this, defArgs);
				this.callSuper = oldSuper;

				return result;
			};
		}

		return definition;
	}

	// Test to see if a function contains a call to `callSuper`
	function callsSuper(method) {
		return (/\bthis\.callSuper\b/).test(method.toString());
	}

	//----------------------------------
	//  Public Methods
	//----------------------------------

	// Defines a new method. The method will be defined on the _current scope_, which will
	// be either the `window`, a Class, or Module. Within the method definition, `this` will
	// refer to the _current scope_. Optionally, you can set the object to define the method on as the
	// first argument.

	namespace.def = function(options) {
		var object = options.object;
		var name = options.name;
		var definition = options.method;

		if (object == null) {
			object = currentClass || currentObject;
		}

		if (definition == null) {
			definition = object.abstractError;
		}

		object[name] = addCallSuper(definition, object[name]);

		return object[name];
	};

	// Creates a new Class. The Class will be defined on the _current scope_, which will
	// be either the `window` or a Module. Optionally you can pass in a Superclass as the first argument.
	namespace.classify = function(options) {
		var superclass = options.base;
		var object = options.name;
		var definition = options.definition;

//
//		if (definition == null) {
//			definition = object;
//			object = superclass;
//			superclass = null;
//		}

		if (typeof object == STRING) {
			if (currentObject[object] == null) {
				currentObject[object] = buildClass(object, superclass);
			}
			object = currentObject[object];
		}

		addDefinition(object.prototype, object, definition);

		return object;
	};

	// Creates a new Module. Modules can be used as namespaces for other Modules
	// and Classes. They can also be used as a collection of method definitions
	// to be included into other Classes.
	namespace.module = function(options) {
		var object = options.ns;
		var definition = options.definition;
		var isMultipleModuleDef = object.indexOf('.') != -1;
		var currentModule = isMultipleModuleDef ? object.substring(0, object.indexOf('.')) : object;

		if (typeof object == STRING) {
			if (currentObject[currentModule] == null) {
				currentObject[currentModule] = buildModule(currentModule);
			}
			currentModule = currentObject[currentModule];
		}

		addDefinition(null, currentModule, isMultipleModuleDef ? function() { namespace.module({ ns:object.substring(object.indexOf('.') + 1, object.length), definition:definition }) } : definition);

		return currentModule;
	};

	// Includes the given Module methods into either the current Class or, optionally, the
	// given Class Definition. The included methods will be available on the instance of the Class.
	namespace.include = function(object, definition) {
		if (definition == null) {
			definition = object;
			object = currentClass || currentObject;
		} else if (typeof object == STRING) {
			object = currentObject[object];
		}

		addDefinition(currentClass, object, definition);
	};

	// Extends the current Class or, optionally, the given Class Definition with the given
	// Module methods. The methods wil be available as Class methods.
	namespace.extend = function(object, definition) {
		if (definition == null) {
			definition = object;
			object = currentObject;
		} else if (typeof object == STRING) {
			object = currentObject[object];
		}

		addDefinition(null, object, definition);
	};

	// Creates a alias for the given Method, Class, or Module definition.
	namespace.alias = function(alias, method) {
		var object = currentClass || currentObject;

		object[alias] = object[method];
	};


})();