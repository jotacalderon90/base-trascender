app.modules.mailing = function(parent){
	this.parent = parent;
	
	this.to = '';
	this.subject = '';
	this.started = false;
	this.marcar_todo = true;
	this.sending_status = [];
	this.error_sending_status = [];
	this.enviando = false;
	this.users = {};
	
	this.name = 'mailing';
	this.services = createServices('/api/' + this.name);
	
	this.services.templates = createService("GET", "/api/mailing/template/collection");
	this.services.template_metadata = createService("GET", "/api/mailing/template/:id");
	this.services.users_tag = createService("GET", "/api/mailing/users/tag");
	this.services.users = createService("GET", "/api/mailing/users/:id");
		
	this.doc = doc || {subject: '', type: '', to: '', text: '', tag: [],tag_main: '', send: false, view: false, confirm: false};
	this.action = (this.doc._id)?'edit':'new';
	
	this.doc.confirm = false;
	
	console.log(this.doc);

}

app.modules.mailing.prototype.start = async function(){
	if(!this.started){
		await this.firstOpen();
	}
	$('#mailing_modal_form').modal('show');
}

app.modules.mailing.prototype.firstOpen = async function(){
	try{		
		$('.loader').fadeIn();
		
		//load iframe
		if(this.doc.type=='template'){
			$('iframe').attr('src','/mailing/templates/' + this.doc.template);
		}
		
		//ckeditor
		CKEDITOR.replace(this.name + '_input_content');
		setTimeout(()=>{
			if(this.isEditMode() && this.doc.type=='ckeditor'){
				CKEDITOR.instances[this.name + "_input_content"].setData(this.doc.html);
			}
			CKEDITOR.instances[this.name + "_input_content"].setReadOnly(false);
		}, 1000);
		
		//tags
		const tag = await this.services.tag();
		if(tag.error){
			throw(tag.error);
		}
		this.tag = tag.data.map((r)=>{return {label: r}});
		$('#' + this.name + '_input_tag').autocomplete({source: this.tag, select: ( event, ui )=>{
			this.doc.tagbk = ui.item.value;
		}});
		
		//template
		const templates = await this.services.templates();
		if(templates.error){
			throw(templates.error);
		}
		this.templates = templates.data;
		
		//users tag
		const users_tag = await this.services.users_tag();
		if(users_tag.error){
			throw(users_tag.error);
		}
		this.users_tag = users_tag.data;
		
		this.parent.refresh();

	}catch(e){
		alert(e);
		console.log(e);
	}
	this.started = true;
	$('.loader').fadeOut();	
}

app.modules.mailing.prototype.selectRoles = async function(id){
	$('.loader').fadeIn();
		
	const u = await this.services.users({id: id});
	if(u.error){
		throw(u.error);
	}
	u.data.filter((r)=>{
		return !this.users[r.email];
	}).map((r)=>{
		this.users[r.email] = r;
	});
	
	this.doc.to += ((this.doc.to=='')?'':',') + u.data.map((r)=>{return r.email});
	this.parent.refresh();
	$('.loader').fadeOut();
}

app.modules.mailing.prototype.selectTemplate = async function(){
	try{		
		$('.loader').fadeIn();
		const template_metadata = await this.services.template_metadata({id: this.doc.template});
		if(template_metadata.error){
			template_metadata.error
		}
		this.doc.template_metadata = template_metadata.data;
		
		$('iframe').attr('src','/mailing/templates/' + this.doc.template);
		this.parent.refresh();
		$('.loader').fadeOut();
	}catch(e){
		alert(e);
		console.log(e);
	}
}
	
app.modules.mailing.prototype.isCreateMode = function(){
	return (this.action=="new")?true:false;
}

app.modules.mailing.prototype.isEditMode = function(){
	return (this.action=="edit")?true:false;
}
		
app.modules.mailing.prototype.addTag = function(event){
	if(event.which === 13) {
		if(this.doc.tag.indexOf(this.doc.tagbk)==-1){
			this.doc.tag.push(this.doc.tagbk);
			this.doc.tagbk = "";
		}
	}
}
		
app.modules.mailing.prototype.removeTag = function(i){
	this.doc.tag.splice(i,1);
}
	
app.modules.mailing.prototype.create = async function(){
	try{
		
		if(this.doc.subject.trim()=='' && this.doc.to.trim()==''){
			return;
		}
		
		const bk = this.doc.to;
		const to = this.doc.to.split(',');
		
		if(confirm('Confirme envío de correos')){
			
			$('.loader').fadeIn();
			
			for(let i=0;i<to.length;i++){
				
				const memo = {};
				memo.subject = this.doc.subject;
				memo.to = to[i];
				memo.type = this.doc.type;
				memo.view = this.doc.view;
				memo.send = this.doc.send;
				memo.tag = this.doc.tag;
				memo.tag_main = this.doc.tag_main;
				
				if(this.doc.type=='plain'){
					memo.text = this.doc.text
				
				}else if(this.doc.type=='ckeditor'){
					memo.html = CKEDITOR.instances["" + this.name + "_input_content"].getData();
				
				}else if(this.doc.type=='template'){
					memo.template = this.doc.template;
					memo.template_metadata = this.doc.template_metadata.map((r)=>{return {label: r.label, type: r.type, value: r.value}});
					
					for(var x=0;x<this.doc.template_metadata.length;x++){
						let m = this.doc.template_metadata[x];
						if(m.type=="static"){
							memo[m.label] = m.value;
						}else if(m.type=="document"){
							memo[m.label] = this.users[to.email][m.label];
						}
					}
				}
				
				const create = await this.services.create({},memo);
				if(create.error){
					throw(create.error);
				}
			}
			
			alert('Documentos generados correctamente');
			location.href = '/';
			
		}
	}catch(e){
		alert(e.error || e);
		console.log(e);
	}
	$('.loader').fadeOut();
}

app.modules.mailing.prototype.delete = async function(){
	$('.loader').fadeIn();
	try{
		if(confirm('Confirme eliminación de documento')){
			const d = await this.services.delete({id: this.doc._id});
			if(d.error){
				throw(d.error);
			}
			alert('Documento eliminado correctamente');
			location.href = '/';
		}
	}catch(e){
		alert(e.error || 'Error, estado ' + e.xhttp.status);
		console.log(e);
	}
	$('.loader').fadeOut();
}