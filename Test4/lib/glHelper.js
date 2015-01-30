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
	
	function degToRad(degrees){
		return degrees * Math.PI / 180;
	}

	return {
		getContext : getContext,
		getShader : getShader,
		degToRad : degToRad
	};
	
})();
