
		app.modules.object = function(){
			this.name = 'ecommerce';
			this.host = urlParams.get('host');
			this.services = {
				create: createService('POST', '/api/cms/' + this.name + '?host='+this.host),
				update: createService('PUT', '/api/cms/' + this.name + '/:id?host='+this.host),
				delete: createService('DELETE', '/api/cms/' + this.name + '/:id?host='+this.host),
				tag: createService('GET', '/api/cms/' + this.name + '/tag/collection?host=' + this.host)
			}
		}
				
		app.modules.object.prototype.start = function(){
			
			this.doc = doc;
			if(this.doc==null){
				this.doc = {title: '', tag: []};
			}
			
			this.action = (this.doc && this.doc._id)?'edit':'new';
			
			CKEDITOR.replace('input_content');
			setTimeout(()=>{
				CKEDITOR.instances["input_content"].setData((this.isCreateMode())?'':this.doc.content);
				CKEDITOR.instances["input_content"].setReadOnly(false);
			}, 1000);
			
			if(!this.isCreateMode()){
				$('form').attr('action','/api/cms/' + this.name + '/' + ((this.doc)?this.doc._id:'') + '/image?host=' + this.host);
			}
			
			this.getTags();
			
		}
		
		app.modules.object.prototype.isCreateMode = function(){
			return (this.action=="new")?true:false;
		}

		app.modules.object.prototype.isEditMode = function(){
			return (this.action=="edit")?true:false;
		}
		
		app.modules.object.prototype.getImg = function(){
			return '/assets/img/' + this.name + '/' + this.doc._id + '.jpg';
		}
		
		app.modules.object.prototype.addTag = function(event){
			if(event.which === 13) {
				if(this.doc.tag.indexOf(this.doc.tagbk)==-1){
					this.doc.tag.push(this.doc.tagbk);
					this.doc.tagbk = "";
				}
			}
		}
		
		app.modules.object.prototype.removeTag = function(i){
			this.doc.tag.splice(i,1);
		}
		
		app.modules.object.prototype.getTags = async function(){
			try{
				const tag = await this.services.tag({host: this.host});
				if(tag.error){
					throw(tag.error);
				}
				this.tag = tag.data.map((r)=>{return {label: r}});
				this.refreshAutocomplete();
			}catch(e){
				alert(e);
				console.log(e);
			}
			$('.loader').fadeOut();
		}
		
		app.modules.object.prototype.refreshAutocomplete = function(){
			$('#input_tag').autocomplete({source: this.tag, select: ( event, ui )=>{
				this.doc.tagbk = ui.item.value;
			}});
		}
		
		app.modules.object.prototype.formatToServer = function(doc){
			delete doc.datefromnow;
			delete doc.datetitle;
			delete doc.tagbk;
			delete doc.relation;
			doc.content = CKEDITOR.instances["input_content"].getData();
			doc.host = this.host;
			return doc;
		}
		
		app.modules.object.prototype.create = async function(){
			$('.loader').fadeIn();
			try{
				if(confirm('Confirme creación de documento')){
					const d = await this.services.create({},this.formatToServer(this.doc));
					if(d.error){
						throw(d.error);
					}
					alert('Documento creado correctamente');
					location.href = '/' + this.name + '/' + d.data + '?host='+this.host;
				}
			}catch(e){
				alert(e);
				console.log(e);
			}
			$('.loader').fadeOut();
		}
		
		app.modules.object.prototype.update = async function(){
			$('.loader').fadeIn();
			try{
				if(confirm('Confirme actualización de documento')){
					const d = await this.services.update({id: this.doc._id},this.formatToServer(this.doc));
					if(d.error){
						throw(d.error);
					}
					alert('Documento actualizado correctamente');
					location.reload();
				}
			}catch(e){
				alert(e);
				console.log(e);
			}
			$('.loader').fadeOut();
		}
		
		app.modules.object.prototype.delete = async function(){
			$('.loader').fadeIn();
			try{
				if(confirm('Confirme eliminación de documento')){
					const d = await this.services.delete({id: this.doc._id});
					if(d.error){
						throw(d.error);
					}
					alert('Documento eliminado correctamente');
					location.href = '/' + this.name + '?host=' + this.host;
				}
			}catch(e){
				alert(e.error || e.xhttp.status);
				console.log(e);
			}
			$('.loader').fadeOut();
		}