var Color = (function(){

	function create(options){
		var color = {};
		color.red = options.red || 0;
		color.green = options.green || 0;
		color.blue = options.blue || 0;
		return color;
	}

	return {
		create : create
	};

})();