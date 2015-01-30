var ResourceLoader = (function(){

	function queue(resources){
		var self = this;
		
		resources = [].concat(resources);
		for(var i = 0; i < resources.length; i++){
			self.resourceCount++;
			if(resources[i].type == "image"){
				var image = new Image();
				image.onload = self.publishImage.bind(self, resources[i]);
				image.onerror = self.resourceFailed.bind(self, resources[i]);
				image.src = resources[i].url;
				
			}else{
				ajax.request({
					url : resources[i].url + (resources[i].nocache ? "?" + (new Date()).getTime() : ""),
					success : self.publishResource.bind(self, resources[i]),
					error: self.resourceFailed.bind(self, resources[i]),
					dataType : resources[i].dataType || undefined
				});
			}
		}
	}
	
	function resourceFailed(resource, ajax, error){
		var self = this;
		if(resource.error){
			resource.error(error, ajax);
		}
		self.resourceErrorCount++;
	}
	
	function publishResource(resource, data){
		try {
			var self = this;
			data = resource.processor ? resource.processor(data) : data;
			self.resources[resource.name] = data;
			self.resourceSuccessCount++;
			if(resource.success){
				resource.success(data);
			}
		}catch(ex){
			console.error("Error publishing: " + resource.name, ex);
			resource.error();
		}
		self.checkIfDone();
	}
	
	function publishImage(resource, e){
		var self = this;
		var image = e.srcElement;
		image = resource.processor ? resource.processor(image) : image;
		self.resources[resource.name] = image;
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
	
	function noop(){}

	function create(options){
		options = options || {};
		var resourceLoader = {};
		resourceLoader.resources = {};
		resourceLoader.resourceCount = 0;
		resourceLoader.resourceSuccessCount = 0;
		resourceLoader.resourceErrorCount = 0;
		resourceLoader.success = options.success || noop;
		resourceLoader.error = options.error || noop;
		resourceLoader.done = options.done || noop;
		
		resourceLoader.queue = queue.bind(resourceLoader);
		resourceLoader.publishResource = publishResource.bind(resourceLoader);
		resourceLoader.publishImage = publishImage.bind(resourceLoader);
		resourceLoader.resourceFailed = resourceFailed.bind(resourceLoader);
		resourceLoader.checkIfDone = checkIfDone.bind(resourceLoader);
		
		return resourceLoader;
	}
	
	return {
		create : create
	};

})();