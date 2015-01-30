var glHelper = (function(){
	
	function getShader(gl, type, shaderSource){
		var shader = gl.createShader(type);
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("Error compiling shader: " + shaderSource);
		}
		
		return shader;
	}
	
	function getContext(canvas){
		var context = canvas.getContext("web-gl") || canvas.getContext("experimental-webgl");
		return context;
	}
	
	function makeTranslation(tx, ty, tz){
		return [
			1,  0,  0,  0,
			0,  1,  0,  0,
			0,  0,  1,  0,
			tx, ty, tz, 1
		];
	};
	
	function make2DProjection(width, height, depth) {
		// Note: This matrix flips the Y axis so 0 is at the top.
		return [
			2 / width, 0, 0, 0,
			0, -2 / height, 0, 0,
			0, 0, 2 / depth, 0,
			-1, 1, 0, 1,
		];
	}

	return {
		getContext : getContext,
		getShader : getShader
	};
	
})();
