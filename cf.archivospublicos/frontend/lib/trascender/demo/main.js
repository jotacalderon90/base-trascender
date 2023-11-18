const demo = function(parent){
	this.parent = parent;
	this.serviceCollection = createService('POST', baseUrl + '/v1/rest/tickets/obtenerTicketFaseAsignacion');
	this.serviceDocument = createService('GET', baseUrl + '/v1/rest/agenda/obtenerDatosHeaderAgenda/:id');
	this.serviceInmueble = createService('POST', baseUrl + '/v1/rest/maestra/obtenerInmueble');
	this.serviceProblemas = createService('POST', baseUrl + '/v1/rest/maestra/obtenerProblemasPV');
	this.coll = [0,0,0,0];
	this.active = 0;
	this.filter = '';
	this.column = '';
	$("#dvDocument").fadeOut();
}

demo.prototype.start = async function(){
	await Promise.all([
		this.loadCollection(0),
		this.loadCollection(1),
		this.loadCollection(2),
		this.loadCollection(3),
	]); 
	this.total = this.coll.map((r)=>{return r.length}).reduce((a, b) => a + b, 0);
}

demo.prototype.loadCollection = async function(estado){
	try{
		const res = await this.serviceCollection({},{"estado": estado,"rutUsuario": validUser});
		if(res.resultado!=1 && res.resultado!=2){
			throw(res.descripcion);
		}
		this.coll[estado] = res.contenido.map((r)=>{return this.formatRow(r)});
	}catch(e){
		alert(e);
		console.log(e);
	}
}

demo.prototype.formatRow = function(r){
	let s = "";
	for(attr in r){
		s+=(r[attr]!=null)?r[attr].toString().toLowerCase():"";
	}
	r.fechaString = moment(r.fechaTicket).format('YYYY-MM-DD HH:mm:ss');
	r.filter = s;
	return r;
}

demo.prototype.getCollection = function(){
	if(this.filter==''){
		return this.coll[this.active];
	}else{
		return this.coll[this.active].filter((r)=>{
			return r.filter.indexOf(this.filter.toLowerCase())>-1;
		});
	}
}

demo.prototype.sortCollection = function(field){
	if(this.column===field){
		this.coll[this.active] = this.coll[this.active].reverse()
	}else{
		this.column = field;
		this.coll[this.active] = SOABF(this.coll[this.active],field);
	}
}

demo.prototype.openDocument = async function(row){
	$('.loader').fadeIn();
	try{
		const res = await this.serviceDocument({id: row.idTicket});
		if(res.resultado!=1){
			throw(res.descripcion);
		}
		this.doc = res.contenido[0];
		this.doc.inmueble = await this.serviceInmueble({},{idCaso: this.doc.idCaso});
		if(this.doc.inmueble.resultado!=1){
			throw(this.doc.inmueble.descripcion);
		}
		this.doc.problemas = await this.serviceProblemas({},{idTicket: row.idTicket});
		if(this.doc.problemas.resultado!=1){
			throw(this.doc.problemas.descripcion);
		}
		console.log(this.doc);
		$("#dvCollection").fadeOut();
		$("#dvDocument").fadeIn();	
		this.parent.refresh();
	}catch(e){
		alert(e);
		console.log(e);
	}
	$('.loader').fadeOut();
}

demo.prototype.closeDocument = function(){
	$("#dvDocument").fadeOut();
	$("#dvCollection").fadeIn();
	this.doc = null;
}
	
app.modules.demo = demo;