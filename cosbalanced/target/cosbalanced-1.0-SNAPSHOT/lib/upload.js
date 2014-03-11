/*
	File: upload.js
	Purpose: 
	Needs: id Namespace (id.js)
	
	$Author: udy $
*/

(function() 
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.upload =
	{
		id: 'upload',
		
		init: init,
		set: set
	};
	
	var css = { message: 'message', warning: 'warning', error: 'error', button: 'button', locked: 'locked' };
	
	// ---------------------------------------------------------------------------------------------- //
	// Upload
	// ---------------------------------------------------------------------------------------------- //

	function init(obj, service)
	{
		id.service.viaMultipart(obj, service);
	}

	function set(item)
	{
		if (item) {
			setLabel(item);	
			setButton(item);	
			item.getPlace().addClass(css.locked);
		}
	}
	
	function setLabel(item) 
	{
		if (!item.label)	{
			return false;
		}

		var $label = item.getPlace().parent(/*div*/).parent(/*td*/).children('label');
		var required = item.required != undefined ? item.required : $label.text().indexOf('*') != -1;
	
		$label.text(item.label + (required == true ? ' *' : ''));
	}
	
	function setButton(item) 
	{
		var $button = item.getPlace().parent(/*div*/).parent(/*td*/).parent(/*td*/).parent(/*td*/).find('a.'+ css.button);
		$button.children('span').text(id.lang.get('choose'));
	}


}());