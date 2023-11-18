
app.modules.cms = function(parent){
	this.parent = parent;
	this.info = info;
	this.dominios = this.info.map((r)=>{
		let dominio = r.host;
		dominio = dominio.split('.');
		dominio = dominio.slice(dominio.length-2);
		dominio = dominio.join('.');
		return dominio;
	}).filter((value, index, array) => array.indexOf(value) === index);
	this.dominio = '';
}

app.modules.cms.prototype.start = async function(){
	
}

app.modules.cms.prototype.selectDominio = async function(){
	if(this.dominio==''){
		return;
	}
	this.subdominios = this.info.filter((r)=>{
		let dominio = r.host;
		dominio = dominio.split('.');
		dominio = dominio.slice(dominio.length-2);
		dominio = dominio.join('.');
		return dominio === this.dominio;
	}).map((r)=>{
		return r.host.replace('.'+this.dominio,'')
	});

	this.subdominio = '';
	this.coleccion = '';
}

app.modules.cms.prototype.selectSubDominio = function(){
	if(this.subdominio==''){
		return;
	}
	if(this.subdominio=='www'){
		location.href = 'www?host=' + this.subdominio+'.'+this.dominio;
		return;
	}
	this.colecciones = this.info.filter((r)=>{
		return r.host === this.subdominio + '.' + this.dominio;
	}).map((r)=>{return r.collection}).map((r)=>{return r[0]});

	this.coleccion = '';
}

app.modules.cms.prototype.selectColeccion = function(){
	if(this.coleccion == ''){
		return;
	}
	location.href = this.coleccion + '?host='+this.subdominio+'.'+this.dominio;
}