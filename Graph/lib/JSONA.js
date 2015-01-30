var JSONA = (function(){

	function parse(jsona){
		jsona = jsona.replace(/\/\/.*\r?\n/g, "");
		jsona = jsona.replace(/\/\*[\s\S]*?\*\//g, "");
		return JSON.parse(jsona);
	}

	return {
		parse : parse
	}

})();