var Model = (function(){

	function getVerticesLength(){
		var model = this;
		return model.vertices.length / model.vertexSize;
	}

	function getColorLength(){
		var model = this;
		return model.colors.length / model.colorSize;
	}
	
	function getIndicesLength(){
		var model = this;
		return model.indices.length / model.indexSize;
	}
	
	function create(options){
		var model = {};
		model.rotation = {};
		model.rotation.x = options.rotation ? options.rotation.x || 0 : 0;
		model.rotation.y = options.rotation ? options.rotation.y || 0 : 0;
		model.rotation.z = options.rotation ? options.rotation.z || 0 : 0;
		model.translation = {};
		model.translation.x = options.translation ? options.translation.x || 0 : 0;
		model.translation.y = options.translation ? options.translation.y || 0 : 0;
		model.translation.z = options.translation ? options.translation.z || 0 : 0;
		
		model.vertices = options.vertices || [];
		model.vertexSize = options.vertexSize || 3;
		model.colors = options.colors || [];
		model.colorSize = options.colorSize || 4;
		model.indices = options.indices || [];
		model.indexSize = options.indexSize || 1;
		
		model.getVerticesLength = getVerticesLength.bind(model);
		model.getColorLength = getColorLength.bind(model);
		model.getIndicesLength = getIndicesLength.bind(model);
		
		return model;
	}

	return {
		create : create
	}

})();