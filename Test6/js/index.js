var Engine = (function(){
	function animate(timeDelta){
		var engine = this;
		
		//rotate rectangle
		engine.models.cube.rotation.x += (timeDelta * 90) / 1000.0;
		engine.models.cube.rotation.x = engine.models.cube.rotation.x % 360;
	}

	function draw(timeDelta){
		var engine = this;
		
		engine.setupPositionBuffer();
		engine.setupTexCoordBuffer();
		engine.setupNormalBuffer();
		engine.setupIndexBuffer();
		engine.setupLights();
		engine.render();
	}
	
	function setupPositionBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.rect = engine.models.rect || {};
		
		gl.enableVertexAttribArray(engine.shaderAttrs.positionLocation);
		
		engine.models.cube.vertexPositionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexPositionBuffer);
		var vertices = new Float32Array(engine.models.cube.vertices);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		gl.vertexAttribPointer(engine.shaderAttrs.positionLocation, engine.models.cube.vertexSize, gl.FLOAT, false, 0, 0);
	}
	
	function setupTexCoordBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.cube.vertexTextureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexTextureBuffer);
		var texCoords = new Float32Array(engine.models.cube.texCoords);
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
		gl.vertexAttribPointer(engine.shaderAttrs.texCoord, engine.models.cube.texCoordSize, gl.FLOAT, false, 0, 0);
	}
	
	function setupNormalBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.cube.vertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexNormalBuffer);
		var normals = new Float32Array(engine.models.cube.normals);
		gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
		gl.vertexAttribPointer(engine.shaderAttrs.vertexNormal, engine.models.cube.normalSize, gl.FLOAT, false, 0, 0);
	}
	
	function setupIndexBuffer(){
		var engine = this;
		var program = engine.program;
		var gl = engine.gl;
		
		engine.models.cube.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, engine.models.cube.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(engine.models.cube.indices), gl.STATIC_DRAW);
	}
	
	function setupLights(){
		var engine = this;
		var program = this.program;
		var gl = engine.gl;
		
		var lightX = document.getElementById("light-x").value;
		var lightY = document.getElementById("light-y").value;
		var lightZ = document.getElementById("light-z").value;
		var lightR = document.getElementById("light-r").value;
		var lightG = document.getElementById("light-g").value;
		var lightB = document.getElementById("light-b").value;
		
		engine.lights.directional = {
			direction : [parseFloat(lightX), parseFloat(lightY), parseFloat(lightZ)],
			color : Color.create({ red : parseFloat(lightR), green : parseFloat(lightG), blue : parseFloat(lightB) })
		};
	}
	
	function render(){
		var engine = this;
		var gl = engine.gl;
		var resources = engine.resourceLoader.resources;
		
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
		mat4.rotate(engine.mvMatrix, glHelper.degToRad(engine.models.cube.rotation.x), [0, 1, 0]);

		//set the buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexPositionBuffer);
		gl.vertexAttribPointer(engine.shaderAttrs.positionLocation, engine.models.cube.vertexSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexNormalBuffer);
		gl.vertexAttribPointer(engine.shaderAttrs.vertexNormal, engine.models.cube.normalSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, engine.models.cube.vertexTextureBuffer);
        gl.vertexAttribPointer(engine.shaderAttrs.texCoord, engine.models.cube.texCoordSize, gl.FLOAT, false, 0, 0);
		
		//bind Texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, resources.texture1);
		gl.uniform1i(engine.program.samplerUniform, 0);
		
		//bind lights
		gl.uniform3f(
			engine.shaderUniforms.lightColorUniform, 
			engine.lights.directional.color.red,
			engine.lights.directional.color.green,
			engine.lights.directional.color.blue
		);
		
		var adjustedLD = vec3.create();
		vec3.normalize(engine.lights.directional.direction, adjustedLD);
		vec3.scale(adjustedLD, -1);
		gl.uniform3fv(engine.shaderUniforms.lightDirectionUniform, adjustedLD);
		
		//bind array buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, engine.models.cube.indexBuffer);
		
		//set the shader uniforms (mv and p matrix)
		engine.setMatrixUniforms();
		
		//draw buffers
		gl.drawElements(gl.TRIANGLES, engine.models.cube.getIndicesLength(), gl.UNSIGNED_SHORT, 0);
		engine.mvPopMatrix();
	}
	
	function setMatrixUniforms() {
		var engine = this;
		var gl = engine.gl;
		
        gl.uniformMatrix4fv(engine.shaderUniforms.pMatrixPointer, false, engine.pMatrix);
        gl.uniformMatrix4fv(engine.shaderUniforms.mvMatrixPointer, false, engine.mvMatrix);
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
		gl.enableVertexAttribArray(engine.shaderAttrs.positionLocation);
		engine.shaderAttrs.vertexNormal = gl.getAttribLocation(engine.program, "aVertexNormal");
		gl.enableVertexAttribArray(engine.shaderAttrs.vertexNormal);
		engine.shaderAttrs.texCoord = gl.getAttribLocation(engine.program, "aTextureCoord");
		gl.enableVertexAttribArray(engine.shaderAttrs.texCoord);
		
		engine.shaderUniforms.pMatrixPointer = gl.getUniformLocation(engine.program, "uPMatrix");
		engine.shaderUniforms.mvMatrixPointer = gl.getUniformLocation(engine.program, "uMVMatrix");
		engine.shaderUniforms.samplerUniform = gl.getUniformLocation(engine.program, "uSampler");
		
		engine.shaderUniforms.lightDirectionUniform = gl.getUniformLocation(engine.program, "uLightDirection");
		engine.shaderUniforms.lightColorUniform = gl.getUniformLocation(engine.program, "uLightColor");
		
		engine.initModels();
	}
	
	function initModels(){
		var engine = this;
		
		engine.models = {};
		//mess with this next!  make a cube!
		engine.models.cube = Model.create(engine.resourceLoader.resources.cube);
		
		engine.tick();
	}
	
	function initTextures(){
		var engine = this;
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
				processor : glHelper.getShader.bind(engine, gl, gl.FRAGMENT_SHADER),
				nocache : true
			},
			{ 
				url : "glsl/shader.vs", 
				name : "vertexShader", 
				processor : glHelper.getShader.bind(engine, gl, gl.VERTEX_SHADER),
				nocache : true
			},
			{
				url : "textures/crate.gif",
				name : "texture1",
				processor : glHelper.getTexture.bind(engine, gl),
				type : "image"
			},
			{
				url : "models/cube.json",
				name : "cube",
				processor : JSONA.parse,
				nocache : true
			}
		]);
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
		engine.lights = {};
		engine.viewport = {
			height : engine.canvas.height,
			width : engine.canvas.width
		};
		
		engine.gatherResources = gatherResources.bind(engine);
		engine.initCanvas = initCanvas.bind(engine);
		engine.initProgram = initProgram.bind(engine);
		engine.initModels = initModels.bind(engine);
		engine.initTextures = initTextures.bind(engine);
		engine.animate = animate.bind(engine);
		engine.draw = draw.bind(engine);
		engine.tick = tick.bind(engine);
		engine.mvPushMatrix = mvPushMatrix.bind(engine);
		engine.mvPopMatrix = mvPopMatrix.bind(engine);
		engine.setMatrixUniforms = setMatrixUniforms.bind(engine);
		
		engine.setupPositionBuffer = setupPositionBuffer.bind(engine);
		engine.setupTexCoordBuffer = setupTexCoordBuffer.bind(engine);
		engine.setupNormalBuffer = setupNormalBuffer.bind(engine);
		engine.setupIndexBuffer = setupIndexBuffer.bind(engine);
		engine.setupLights = setupLights.bind(engine);
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