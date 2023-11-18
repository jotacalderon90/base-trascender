
		app.modules.object = function(parent){
			this.parent = parent;
			this.name = 'blog';
			this.host = urlParams.get('host');
			this.query = {};
			this.options = {projection: {title: 1}, sort: {created: -1}};
			this.services = {
				total: createService('GET', '/api/cms/' + this.name + '/total?host=' + this.host + '&query=:query'),
				collection: createService('GET', '/api/cms/' + this.name + '/collection?host=' + this.host + '&query=:query&options=:options'),
				tag: createService('GET', '/api/cms/' + this.name + '/tag/collection?host=' + this.host)
			}
			
			/*this.scroller = '#modal_admin .modal-content';
			$(this.scroller).scroll(()=>{
				const p = $(this.scroller)[0].scrollHeight - $(document).height();
				if(($(this.scroller).scrollTop()*100)/p>=99){
					if(this.obtained < this.cant && !this.obtaining){
						this.getCollection();
					}
				}
			});	*/
		}
		
		app.modules.object.prototype.start = function(){
			this.getTags();
		}
		
		app.modules.object.prototype.getTags = async function(){
			try{
				const tags = await this.services.tag();
				if(tags.error){
					throw(tags.error);
				}
				this.tags = tags.data;
			}catch(e){
				alert(e);
				console.log(e);
			}
			this.refresh();
		}
		
		app.modules.object.prototype.refresh = function(tag){
			if(tag){
				this.query.tag = tag;
			}else{
				delete this.query.tag;
			}
			this.cant = 0;
			this.obtained = 0;
			this.coll = [];
			this.getTotal();
		}
		
		app.modules.object.prototype.getTotal = async function(){
			$('.loader').fadeIn();
			try{
				const cant = await this.services.total(this.paramsToGetTotal());
				if(cant.error){
					throw(cant.error);
				}
				this.cant = cant.data;
				this.getCollection();
			}catch(e){
				alert(e);
				console.log(e);
			}
		}
		
		app.modules.object.prototype.paramsToGetTotal = function(){
			return {query: JSON.stringify(this.query)};
		}
		
		app.modules.object.prototype.getCollection = async function(){
			$('.loader').fadeIn();
			try{
				this.obtaining = true;
				
				const coll = await this.services.collection(this.paramsToGetCollection());
				if(coll.error){
					throw(coll.error);
				}
				this.coll = this.coll.concat(coll.data);
				this.obtained = this.coll.length;
				this.obtaining = false;
				
				this.parent.refresh();
			}catch(e){
				alert(e);
				console.log(e);
			}
			$('.loader').fadeOut();
		}
		
		app.modules.object.prototype.paramsToGetCollection = function(){
			return {query: JSON.stringify(this.query), options: JSON.stringify(this.getOptions())};
		}
		
		app.modules.object.prototype.getOptions = function(){
			return {...this.options, skip: this.obtained, limit: 50};
		}