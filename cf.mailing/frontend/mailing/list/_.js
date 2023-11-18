
		
		app.modules.object = function(parent){
			this.parent = parent;
			this.name = 'mailing';
			this.query = {};
			this.options = {projection: {subject: 1, to: 1, created: 1, view: 1}, sort: {created: -1}};
			this.services = createServices('/api/' + this.name);
			this.markDelete = false;
			
			this.scroller = '#' + this.name + '_modal_admin .modal-content';
			$(this.scroller).scroll(()=>{
				const p = $(this.scroller)[0].scrollHeight - $(document).height();
				if(($(this.scroller).scrollTop()*100)/p>=99){
					if(this.obtained < this.cant && !this.obtaining){
						this.getCollection();
					}
				}
			});	
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
					throw(coll.error)
				}
				this.coll = this.coll.concat(this.formatCollectionToClient(coll.data));
				
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
		
		app.modules.object.prototype.formatCollectionToClient = function(coll){
			for(let i=0;i<coll.length;i++){
				coll[i].to = coll[i].to.split(',').map((r)=>{return {email: r}});
			}
			return coll;
		}
		
		app.modules.object.prototype.setDelete = function(){
			this.coll = this.coll.map((r)=>{
				r.delete = this.markDelete;
				return r;
			});
		}
		
		app.modules.object.prototype.delete = async function(){
			try{
				if(!confirm('Confirme eliminación de registros')){
					return;
				}
				$('.loader').fadeIn();
				this.coll.filter((r)=>{return r.delete}).map((r)=>{this.services.delete({id: r._id})});
				alert('Documentos eliminados');
				this.refresh();
			}catch(e){
				alert(e.error || e);
				console.log(e);
			}
		}
		
		app.modules.object.prototype.start = function(){
			$('#' + this.name + '_modal_admin').modal('show');
			this.getTags();
		}
		