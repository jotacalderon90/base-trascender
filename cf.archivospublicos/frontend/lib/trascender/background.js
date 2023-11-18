const background = function(parent){
	this.service = createService('GET','/api/background/collection');
}

background.prototype.start = async function(){
	let images;
	let ext = false;
	try{
		images = await this.service();
	}catch(e){
		//en otros host como blog se cae por 404, por ende llamar a host www
		console.log(e);
		ext = location.protocol + '//' + location.host.replace(location.host.split('.')[0],'www');
		this.service = createService('GET',ext + '/api/background/collection');
		images = await this.service();
	}
	if(!images.data || images.data.length==0){
		return;
	}
	images = images.data.map((image)=>{
		return {image: (ext)?location.protocol + '//' + image:image};
	});
	this.supersized(images);
}

background.prototype.supersized = function(images){
	jQuery(function($) {
		$.supersized({
			slides: images
		})
	});
}

app.modules.background = background;