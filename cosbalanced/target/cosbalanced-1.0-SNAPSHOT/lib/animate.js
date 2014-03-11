/*
	File: animate.js
	Date: Feb 2012
	Purpose: CSS3 Animations
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //
	
	id.animate = 
	{
		init:		init
	}
	
	// ---------------------------------------------------------------------------------------------- //
	// Private 
	// ---------------------------------------------------------------------------------------------- //
	
	var Class = { scrollable: 'scrollable' }

	// ---------------------------------------------------------------------------------------------- //
	// Set Metas and Orientation Classes
	// ---------------------------------------------------------------------------------------------- //
	
	function init($from, $to, animation) 
	{	
		if($to.length === 0){
            return false;
        }
        
        //$to.find('.'+ Class.scrollable).removeAttr('style');
        
        var callback = function(event){

            if (id.hasWebKitAnimationEvents() && animation) {
                $to.removeClass('in reverse ' + animation.name);
                $from.removeClass('selected out reverse ' + animation.name);
            } else {
                $from.removeClass('selected');
            }

            $to.trigger('pageAnimationEnd', { direction: 'in' });
	        $from.trigger('pageAnimationEnd', { direction: 'out' });
        }
        
        $(':focus').blur();

        //scrollTo(0, 0);

        $from.trigger('pageAnimationStart', { direction: 'out' });
        $to.trigger('pageAnimationStart', { direction: 'in' });
        
        if (id.hasWebKitAnimationEvents() && animation) {
            $to.one('webkitAnimationEnd', callback);
            $to.addClass(animation.name + ' in selected ' + (animation.direction ? ' reverse' : ''));
            $from.addClass(animation.name + ' out' + (animation.direction ? ' reverse' : ''));
        } else {
            $to.addClass('selected');
            callback();
        }

        return true;
	}
	

}());
