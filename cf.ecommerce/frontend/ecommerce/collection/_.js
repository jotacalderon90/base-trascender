app.modules.object = function(parent){
	this.parent = parent;
	this.contToAdmin = 0;
	this.name = 'ecommerce';
}

app.modules.object.prototype.start = function(){
	this.coll = rows;
	this.coll = this.coll.map(this.formatToClient);
	this.index = 0;
	
	$('.loader').fadeOut();
	
	if($('#modal_list').length > 0){
		$('#modal_list').modal('show');
		addTouchEvent('#modal_list .modal-body',this,'touchend');
	}
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
		location.href = HOST_CMS + '/' + this.name;
	}
}
		
app.modules.object.prototype.touchend = function(detectSwipe){
	switch(detectSwipe){
		case 'left':
			if(this.index<this.coll.length-1){
				this.index++;
				this.parent.refresh();
			}
		break;
		case 'right':
			if(this.index>0){
				this.index--;
				this.parent.refresh();
			}
		break;
	}
}