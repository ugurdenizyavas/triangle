/*
	File: status.js
	Purpose: Build a box with indicators, indices, KPIs, ..
	
	$Author: udy $
*/

(function()
{
	// ---------------------------------------------------------------------------------------------- //
	// Public Interface
	// ---------------------------------------------------------------------------------------------- //

	id.gui.status =
	{
		id: 'status',
	
		init: init,
		update: init /* no difference yet */
	};

	// ---------------------------------------------------------------------------------------------- //
	// Package Init
	// ---------------------------------------------------------------------------------------------- //
	
	var Class = { isStatus: 'isStatus', header: 'header', clearfix: 'clearfix', outerBox: 'kpiOuterBox', isIndex: 'isIndex' };
	var COS = { init: 'init', status: 'status', indicator: 'indicator', table: 'table', index: 'index', timer: 'timer', text: 'text' };
	var attr = { decimals: 'decimals' };

	var latest;
	
	id.object.register(id.gui.status, { docType: Class.isStatus, cosType: COS.status });
	
	// ---------------------------------------------------------------------------------------------- //
	// Init 
	// ---------------------------------------------------------------------------------------------- //
	
	function init(obj)
	{
		var $place = obj.getPlace();
      var options = {};
		
		$place.empty();
		latest = 0;
		
		if (obj.items && obj.items.length)
		{
			title();

			id.cos.items(obj, function(item)
			{
				switch (item.type)
				{
					// Elements ..
				
					case COS.index: 
					{
						options.dynamic = true;
						if ($place.attr(attr.decimals)) options.decimals = $place.attr(attr.decimals);
                        
						id.gui.index.add(item, setLabel(item), options); 
						break;
					}
					
					case COS.indicator: 
					{
						id.gui.indicator.add(item, $place); 
						break;
					}
					
					case COS.text: 
					{
						id.gui.kpis.add(item, $place); 
						break;
					}
					
					case COS.label:
					{
						// later ..
						
						break;
					}
					
					default: id.gui.element(item, $place);
				}
				
				if (item.stamp)
					stampOf(item.stamp);
			});
			
			if (latest)
				title(stampOf());
		}

		obj.atUpdate = atUpdate;
        obj.atBroadcast = atBroadcast;
        
		obj.isContent(true);
		
		return true;
		
		// Functions
		
		function title(update)
		{
			if (update) $place.find('.'+Class.header).children(/*h2*/).html(id.cos.labelOf(obj)+' ('+update+')');
			else $place.append('<div class="'+Class.header+' '+Class.clearfix + (obj.status ? ' '+obj.status : '') +'">'+ '<h2>'+id.cos.labelOf(obj)+(obj.time ? '<span>'+ obj.time +'</span>' : '')+'</h2>' +'</div>');
		}

		function stampOf(stamp)
		{
			if (stamp)
			{
				var current = Number(stamp.match(/\d\d:\d\d:\d\d/)[0].replace(/:/g, ''));
			
				if (current > latest)
					latest = current;
			}
			else if (latest)
			{
				var hhmmss = String(latest);
				
				while (hhmmss.length < 6) hhmmss = '0'+hhmmss;
				return hhmmss.slice(0,2)+':'+hhmmss.slice(2,4);
			}
		}
	
		function setLabel(item) 
		{
		  $place.append('<div class="'+Class.isIndex+'"><label>'+ id.cos.labelOf(item) +'</label></div>')
		  
		  return $place.find('.'+Class.isIndex+':last');
		}

		function atUpdate(obj, causedBy)
		{
			if (obj.services && obj.$place.is(':visible')) $.each(obj.services, function() 
			{ 
				if (this.trigger == COS.timer) 
					obj.call(this);
			});
		}
        
        function atBroadcast(obj, causedBy)
		{
			if (obj.services && obj.$place.is(':visible')) $.each(obj.services, function() 
			{ 
				if (this.trigger == COS.init) 
					obj.call(this);
			});
			//obj.unload();
		}
	}

}());

