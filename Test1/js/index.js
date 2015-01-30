var Engine = (function(){
	function draw(){
		var engine = this;
		var gl = engine.gl;
		var program = engine.program;
		
		var positionLocation = gl.getAttribLocation(program, "aVertexPosition");
		
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER, 
			new Float32Array([
				-1.0, -1.0, 
				1.0, -1.0,
				-1.0, 1.0,
				-1.0, 1.0,
				1.0, -1.0,
				1.0, 1.0]),
			gl.STATIC_DRAW);
		
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		webkitRequestAnimationFrame(engine.draw, engine.canvas);
	}
	
	function initProgram(){
		var engine = this;
		var gl = engine.gl;
		var resources = engine.resourceLoader.resources;
		
		engine.program = gl.createProgram(gl);
		gl.attachShader(engine.program, resources.vertexShader);
		gl.attachShader(engine.program, resources.fragmentShader);
		gl.linkProgram(engine.program);
		gl.useProgram(engine.program);
		
		requestAnimationFrame(engine.draw, engine.canvas);
	}
	
	function initCanvas(){
		var engine = this;
		var gl = engine.gl;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
	}
	
	function gatherResources(){
		var engine = this;
		var gl = engine.gl;
		
		engine.resourceLoader.success = engine.initProgram;
		engine.resourceLoader.queue([
			{ url : "glsl/shader.fs", name : "fragmentShader", processor : glHelper.getShader.bind(self, gl, gl.FRAGMENT_SHADER) },
			{ url : "glsl/shader.vs", name : "vertexShader", processor : glHelper.getShader.bind(self, gl, gl.VERTEX_SHADER) }
		]);
	}

	function create(options){
		var engine = {};
		engine.canvas = document.getElementById(options.canvasId);
		engine.gl = glHelper.getContext(engine.canvas);
		engine.resourceLoader = ResourceLoader.create();
		
		engine.gatherResources = gatherResources.bind(engine);
		engine.initCanvas = initCanvas.bind(engine);
		engine.initProgram = initProgram.bind(engine);
		engine.draw = draw.bind(engine);
		
		engine.initCanvas();
		engine.gatherResources();
	}
	
	return {
		create : create
	}

})();

document.addEventListener("DOMContentLoaded", function(){
	var engine = Engine.create({
		canvasId : "canvas"
	});
},true);