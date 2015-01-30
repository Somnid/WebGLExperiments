var ResourceLoader = (function(){

	function queue(resources){
		var self = this;
		
		resources = [].concat(resources);
		for(var i = 0; i < resources.length; i++){
			self.resourceCount++;
			ajax.request({
				url : resources[i].url,
				success : self.publishResource.bind(self, resources[i]),
				error : self.resourceFailed.bind(self, resources[i])
			});
		}
	}
	
	function resourceFailed(resource){
		var self = this;
		if(resource.error){
			resource.error();
		}
		self.resourceErrorCount++;
	}
	
	function publishResource(resource, data){
		var self = this;
		data = resource.processor ? resource.processor(data) : data;
		self.resources[resource.name] = data;
		self.resourceSuccessCount++;
		if(resource.success){
			resource.success(data);
		}
		self.checkIfDone();
	}
	
	function checkIfDone(){
		var self = this;
		if(self.resourceSuccessCount == self.resourceCount){
			self.success();
			self.done();
		}
		else if(self.resourceSuccessCount + self.resourceErrorCount == self.resourceCount){
			self.error();
			self.done();
		}
	}

	function create(options){
		var options = options || {};
		var resourceLoader = {};
		resourceLoader.resources = {};
		resourceLoader.resourceCount = 0;
		resourceLoader.resourceSuccessCount = 0;
		resourceLoader.resourceErrorCount = 0;
		resourceLoader.success = options.success || function(){};;
		resourceLoader.error = options.error || function(){};
		resourceLoader.done = options.done || function(){};
		
		resourceLoader.queue = queue.bind(resourceLoader);
		resourceLoader.publishResource = publishResource.bind(resourceLoader);
		resourceLoader.resourceFailed = publishResource.bind(resourceLoader);
		resourceLoader.checkIfDone = checkIfDone.bind(resourceLoader);
		
		return resourceLoader;
	}
	
	return {
		create : create
	};

})();