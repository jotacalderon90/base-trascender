app.controller("myCtrl", function($scope){
	this.refresh = function(){
		try{
			$scope.$digest(function(){});
		}catch(e){
			console.log('this.refresh!',e);
		}
	};
	(async ()=>{
		for(module in app.modules){
			$('.loader').fadeIn();
			try{
				this[module] = new app.modules[module](this);
				if(this[module].start){
					await this[module].start();
				}
			}catch(e){
				$('.loader').fadeOut();
				//myError("Error al iniciar " + module, e.toString());
				alert("Error: " + module + '\n' +  e.toString());
				console.log(e);
			}
		}
		this.refresh();
		$('.loader').fadeOut();
	})();
});