/*
	File: dcss.js
	Purpose: 
	Needs: id Namespace (id.js), jquery.dcss.js
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.layout =
	{
		initResolution: initResolution,
		setContainer: setContainer,
		setSemiFlexContainer: setSemiFlexContainer,
		setPanel: setPanel
	}
		
	// ---------------------------------------------------------------------------------------------- //
	// Private
	// ---------------------------------------------------------------------------------------------- //
	
	var css = { isflex: 'isFlex', flex: 'flex', semiFlex: 'semiFlex' };
	
	// ---------------------------------------------------------------------------------------------- //
	// Resolution
	// ---------------------------------------------------------------------------------------------- //
	
	function initResolution(options)
	{	
		options = options || {};
		
		var $window = $(window);
		var $container = $('#container');
		var resolution = id.getParameter('screen.resolution');
		var columns = '';
		
		if (id.getParameter('layout.columns')) {
			var columns = 'columns' + id.getParameter('layout.columns');
		}
		
		if (resolution.match === 1024 || resolution === 1280) {
			$container.removeClass().addClass('res'+resolution+columns );
		}
		else if (resolution == 'auto') {
			if ($window.width() <= 1024) {
				$container.removeClass().addClass('res1024'+columns);
			}
			else if (($window.width() > 1024) && ($window.width() <= 1280)) {
				$container.removeClass().addClass('res1280'+columns );
			}
			else if ($window.width() > 1280) {
				$container.removeClass().addClass('res1280'+columns );
			}
		}	
	}
		
	// ---------------------------------------------------------------------------------------------- //
	// 
	// ---------------------------------------------------------------------------------------------- //

	function setSemiFlexContainer(panel, mode)
	{	
		var $tabpnl = panel; 
		
		// semi automatic container sizing
		if  ($tabpnl.hasClass(css.semiFlex) && mode)
			$tabpnl.parent().css(({width: $tabpnl.width()  + (id.isMozilla() ? 0 : (id.isIE() ? 0 : 2 ))  +'px'}));
		else if ($tabpnl.hasClass(css.semiFlex) && !mode)
			$tabpnl.parent().removeAttr('style');

	}

	// ---------------------------------------------------------------------------------------------- //
	// 
	// ---------------------------------------------------------------------------------------------- //	
	
	function setPanel(panel, mode)
	{	
		var $tabpnl = panel; 
		var tabPanel, tabWidth;
		var rules2 = {};
		var $tab = $tabpnl.parent().parent();
		
			// spezial IE chart sizing restriction
		if  ($tabpnl.hasClass(css.chart) && mode) {
			//if (id.isIE()) $tab.addClass('floatl');
		
			tabPanel = '#container .tabs .tabPanel.chart'; 
		
			id.css.removeRules([tabPanel]).refresh();
			
			if ($tabpnl.width() == 0) { tabWidth = $tabpnl.css("width").replace(/px/g, '') * 1; }
			else { tabWidth = $tabpnl.width(); }
			
			rules2[tabPanel] = {
				'width': tabWidth + 'px !important'
			}
		
			id.css.addRules(rules2).refresh();
			
		} else if ($tabpnl && !mode) {
			id.css.removeRules([tabPanel]).refresh();
			//if (id.isIE()) $tab.removeClass('floatl');
		}
		
		$tabpnl.removeClass(css.flex);
	
	}
		
	
	function setContainer(panel, mode)
	{	
		var $tabpnl = panel; 
		var container, minWidthContainer, tabPanel;
		var $window = $(window);

		var rules = {};

		var $container = $('#container');
		var $tab = $tabpnl.parent().parent();
		var resolution = id.getParameter('screen.resolution');
		var columns = '';
		
		if (id.getParameter('layout.columns')) {
			var columns = 'columns' + id.getParameter('layout.columns');
		}
		
		if (resolution.match('1024') == '1024' || resolution.match('1280') == '1280') {
			resolution = '.res'+resolution+columns;
		}
		
		else if (resolution == 'auto') {
		
			if ($window.width() <= 1024) {
				resolution = '.res1024'+columns;
			}
			else if (($window.width() > 1024) && ($window.width() <= 1280)) {
				resolution = '.res1280'+columns;
			}
			else if ($window.width() > 1280) {
				resolution = '.res1280'+columns;
			}
		}	
					
		// Define the container css path
		if (id.isIE() && $.browser.version.substring(0,1)=='6') { 
			container = 'body.ie6 #container.'+resolution; minWidthContainer = 'body.ie6 .min_width_container'; 
		} else if (id.isIE() && $.browser.version.substring(0,1)=='7') { 
			container = '#container'+resolution; 
		}
		else if (id.isIE() && $.browser.version.substring(0,1)=='8') { 
			container = '#container'+resolution; 
		}
		else { 
			container = '#container'+resolution; 
		}
		
		
		// container sizing
		if  (($tabpnl.hasClass(css.isflex) || $tabpnl.hasClass(css.semiFlex)) && mode) {
		
			id.css.removeRules([container, minWidthContainer]).refresh();
			//if (id.isIE() && $.browser.version.substring(0,1)=='7') $tab.addClass('floatl');
			//alert('layout');
		
			var $content = $('#content');
			var $right = $('.contentColRight');
			var $dialog = $content.children('.dialog');
			var rightWidth = 0, rightPad = 0, dialogPad = 0, tabWidth = 0, contentWidth = 0, contentPad = 0, contentMar = 0;
			
			if ($right.length != 0) { rightPad = $right.css("padding-left").replace(/px/g, '') * 1; }
			if (($right.length == 0) && (resolution == ".res1024")){ 
				dialogPad = $dialog.css("padding-right").replace(/px/g, '') * 1; 
			}
			
			if ($tabpnl.width() == 0) { tabWidth = $tabpnl.css("width").replace(/px/g, '') * 1; }
			else { tabWidth = $tabpnl.width(); }
				
			contentPad = $content.css("padding-left").replace(/px/g, '') * 1;
			contentMar = $content.css("margin-left").replace(/px/g, '') * 1;
			rightWidth = $right.width();
				
			contentWidth = contentPad + contentMar + rightWidth + rightPad;
			
			// Define the css rule
			if (id.isIE() && $.browser.version.substring(0,1)=='6') {
				rules[container] = {
					'padding': '0px '+((contentWidth + tabWidth + (dialogPad*2))/2) +'px !important'
				}
				rules[minWidthContainer] = {
					'margin': '0px '+(-(contentWidth + tabWidth + (dialogPad*2))/2) +'px !important'
				}
			} else {
				rules[container] = {
					'min-width': contentWidth + tabWidth + (dialogPad) + (id.isIE() ? -2 : -2 )  + 'px !important'
				}
			}
		
			// Add the css to the document header section
			id.css.addRules(rules).refresh();
			
		} else {
			id.css.removeRules([container, minWidthContainer]).refresh();
			//if (id.isIE() && $.browser.version.substring(0,1)=='7') $tab.removeClass('floatl');
		}
		

	}

}());