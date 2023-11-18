app.modules.object = function(){	
	this.contToAdmin = 0;
	this.name = 'blog';
}
		
app.modules.object.prototype.start = async function(){
	this.doc = doc;
	this.doc = this.formatToClient(this.doc);
	$('#modal_document').modal('show');
	$(".loader").fadeOut();	
}
		
app.modules.object.prototype.formatToClient = function(row){
	row.created = new Date(row.created);
	row.datefromnow = moment(row.created, "YYYYMMDD, h:mm:ss").fromNow();
	row.datetitle = moment(row.created).format("dddd, DD MMMM YYYY, h:mm:ss");
	return row;
}	
		
app.modules.object.prototype.toAdmin = function(){
	this.contToAdmin++;
	if(this.contToAdmin >= 7){
		location.href = HOST_CMS + '/' + this.name + '/' + this.doc._id + '?host=' + location.host;
	}
}
				
app.modules.object.prototype.copyURL = function(uri){
	copy(this.getURI(uri));
	alert('URL Copiada :)');
}

app.modules.object.prototype.getURI = function(uri){
	return location.href;
}