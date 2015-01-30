var Engine = (function(){
	function animate(timeDelta){
		var engine = this;
		
		//rotate rectangle
		engine.models.rect = engine.models.rect || {};
		engine.models.rect.rotation = engine.models.rect.rotation || 0;
		engine.models.rect.rotation += (timeDelta * 90) / 1000.0;
		engine.models.rect.rotation = engine.models.rect.rotation % 360;
	}

	function draw(timeDelta){
		var engine = this;
		
		engine.setupPositionBuffer();
		engine.setupColorBuffer();
		engine.render();
	}
	
	function setupPositionBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.rect = engine.models.rect || {};
		
		gl.enableVertexAttribArray(engine.shaderAttrs.positionLocation);
		engine.models.rect.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.rect.vertexPositionBuffer);
		var vertices = new Float32Array([
			 0.0,  1.0, 0.0,
			-1.0, -1.0, 0.0,
			 1.0, -1.0, 0.0
		])
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		gl.vertexAttribPointer(engine.shaderAttrs.positionLocation, 3, gl.FLOAT, false, 0, 0);
	}
	
	function setupColorBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.rect = engine.models.rect || {};
	
		gl.enableVertexAttribArray(engine.shaderAttrs.vertexColor);
		engine.models.rect.vertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.rect.vertexColorBuffer);
		var colors = new Float32Array([
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0
		]);
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		gl.vertexAttribPointer(engine.shaderAttrs.vertexColor, 4, gl.FLOAT, false, 0, 0);
	}
	
	function render(){
		var engine = this;
		var gl = engine.gl;
		
		//clear screen
		gl.viewport(0, 0,  engine.viewport.width, engine.viewport.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		//setup perspective and model view matrix
		mat4.perspective(45, engine.viewport.width / engine.viewport.height, 0.1, 100.0, engine.pMatrix);
		mat4.identity(engine.mvMatrix);
		
		//move back
		mat4.translate(engine.mvMatrix, [0.0, 0.0, -7.0]);
		
		//rotate model view matrix
		engine.mvPushMatrix();
		mat4.rotate(engine.mvMatrix, glHelper.degToRad(engine.models.rect.rotation), [0, 1, 0]);

		//set the buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.rect.vertexPositionBuffer);
		gl.vertexAttribPointer(engine.shaderAttrs.positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.rect.vertexColorBuffer);
		gl.vertexAttribPointer(engine.shaderAttrs.vertexColor, 4, gl.FLOAT, false, 0, 0);
		
		//set the shader uniforms (mv and p matrix)
		engine.setMatrixUniforms();
		
		//draw buffers
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
		engine.mvPopMatrix();
	}
	
	function tick(time){
		var engine = this;
		var timeDelta = engine.lastTime ? time - engine.lastTime : 0;
		engine.animate(timeDelta);
		engine.draw();
		engine.lastTime = time;
		webkitRequestAnimationFrame(engine.tick, engine.canvas);
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
		
		engine.shaderAttrs.positionLocation = gl.getAttribLocation(engine.program, "aVertexPosition");
		engine.shaderAttrs.vertexColor = gl.getAttribLocation(engine.program, "aVertexColor");
		engine.shaderUniforms.pMatrixPointer = gl.getUniformLocation(engine.program, "uPMatrix");
		engine.shaderUniforms.mvMatrixPointer = gl.getUniformLocation(engine.program, "uMVMatrix");
		
		engine.tick();
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
			{ 
				url : "glsl/shader.fs", 
				name : "fragmentShader", 
				processor : glHelper.getShader.bind(self, gl, gl.FRAGMENT_SHADER),
				nocache : true
			},
			{ 
				url : "glsl/shader.vs", 
				name : "vertexShader", 
				processor : glHelper.getShader.bind(self, gl, gl.VERTEX_SHADER),
				nocache : true
			}
		]);
	}
	
	 function setMatrixUniforms() {
		var engine = this;
		var gl = engine.gl;
		
        gl.uniformMatrix4fv(engine.shaderUniforms.pMatrixPointer, false, engine.pMatrix);
        gl.uniformMatrix4fv(engine.shaderUniforms.mvMatrixPointer, false, engine.mvMatrix);
    }
	
	function mvPushMatrix(){
		var engine = this;
		var copy = mat4.create();
		mat4.set(engine.mvMatrix, copy);
		engine.mvMatrixStack.push(copy);
	}
	
	function mvPopMatrix(){
		var engine = this;
		if(engine.mvMatrixStack.length == 0){
			throw "Invalid PopMatrix";
		}
		engine.mvMatrix = engine.mvMatrixStack.pop();
	}

	function create(options){
		var engine = {};
		engine.canvas = document.getElementById(options.canvasId);
		engine.gl = glHelper.getContext(engine.canvas);
		engine.resourceLoader = ResourceLoader.create();
		
		//globals
		engine.mvMatrix = mat4.create();
		engine.mvMatrixStack = [];
		engine.pMatrix = mat4.create();
		engine.models = {};
		engine.shaderAttrs = {};
		engine.shaderUniforms = {};
		engine.viewport = {
			height : engine.canvas.height,
			width : engine.canvas.width
		};
		
		engine.gatherResources = gatherResources.bind(engine);
		engine.initCanvas = initCanvas.bind(engine);
		engine.initProgram = initProgram.bind(engine);
		engine.animate = animate.bind(engine);
		engine.draw = draw.bind(engine);
		engine.tick = tick.bind(engine);
		engine.mvPushMatrix = mvPushMatrix.bind(engine);
		engine.mvPopMatrix = mvPopMatrix.bind(engine);
		engine.setMatrixUniforms = setMatrixUniforms.bind(engine);
		
		engine.setupPositionBuffer = setupPositionBuffer.bind(engine);
		engine.setupColorBuffer = setupColorBuffer.bind(engine);
		engine.render = render.bind(engine);
		
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