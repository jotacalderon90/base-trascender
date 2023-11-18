
	app.modules.background = function(parent){
		this.service = document.helper.createService('GET','/api/background/collection');
	}

	app.modules.background.prototype.start = async function(){
		const coll = (await this.service()).map((r)=>{return {image: r};});
		jQuery(function($) {
			$.supersized({    
				slides: coll
			});
		});
	}