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
	
	function getTexture(gl, image){
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
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
		getTexture : getTexture,
		degToRad : degToRad
	};
	
})();
