app.modules.object = function(parent) {
	this.parent = parent;
	this.name = 'account';
	this.query = {};
	this.options = {
		projection: {
			email: 1,
			roles: 1,
			activate: 1
		},
		sort: {
			created: -1
		}
	};
	//this.services = document.helper.createServices('/api/admin/' + this.name);
	this.services = {
		total: createService('GET', '/api/admin/' + this.name + '/total?query=:query'),
		collection: createService('GET', '/api/admin/' + this.name + '/collection?query=:query&options=:options'),
		tag: createService('GET', '/api/admin/' + this.name + '/tag/collection'),
		create: createService('POST', '/api/admin/' + this.name),
		update: createService('PUT', '/api/admin/' + this.name + '/:id'),
		delete: createService('DELETE', '/api/admin/' + this.name + '/:id'),
		tag: createService('GET', '/api/admin/' + this.name + '/tag/collection')
	}

	this.scroller = '#account_modal_admin .modal-content';
	$(this.scroller).scroll(() => {
		const p = $(this.scroller)[0].scrollHeight - $(document).height();
		if (($(this.scroller).scrollTop() * 100) / p >= 99) {
			if (this.obtained < this.cant && !this.obtaining) {
				this.getCollection();
			}
		}
	});
}

app.modules.object.prototype.getTags = async function() {
	try {
		const tags = await this.services.tag();
		if(tags.error){
			throw(tags.error);
		}
		this.tags = tags.data;
	} catch (e) {
		alert(e);
		console.log(e);
	}
	this.refresh();
}

app.modules.object.prototype.refresh = function(roles) {
	if (roles) {
		this.query.roles = roles;
	} else {
		delete this.query.roles;
	}
	this.cant = 0;
	this.obtained = 0;
	this.coll = [];
	this.getTotal();
}

app.modules.object.prototype.getTotal = async function() {
	$('.loader').fadeIn();
	try {
		const cant = await this.services.total(this.paramsToGetTotal());
		if(cant.error){
			throw(cant.error);
		}
		this.cant = cant.data;
		this.getCollection();
	} catch (e) {
		alert(e);
		console.log(e);
	}
}

app.modules.object.prototype.paramsToGetTotal = function() {
	return {
		query: JSON.stringify(this.query)
	};
}

app.modules.object.prototype.getCollection = async function() {
	$('.loader').fadeIn();
	try {
		this.obtaining = true;

		const coll = await this.services.collection(this.paramsToGetCollection());
		if(coll.error){
			throw(coll.error);
		}
		this.coll = this.coll.concat(coll.data);
		this.obtained = this.coll.length;
		this.obtaining = false;
		this.parent.refresh();
	} catch (e) {
		alert(e);
		console.log(e);
	}
	$('.loader').fadeOut();
}

app.modules.object.prototype.paramsToGetCollection = function() {
	return {
		query: JSON.stringify(this.query),
		options: JSON.stringify(this.getOptions())
	};
}

app.modules.object.prototype.getOptions = function() {
	return {
		...this.options,
		skip: this.obtained,
		limit: 50
	};
}

app.modules.object.prototype.changeRoles = async function(row) {
	try {
		console.log(this.parent);
		const newroles = await this.parent.prompt.execute('Actualizar roles', 'text', 'Ingrese roles separados por coma', row.roles.join(','));
		if (newroles.trim() == '') {
			return;
		}
		$(".loader").fadeIn();
		const update = await this.services.update({
			id: row._id
		}, {
			type: 'roles',
			roles: newroles.split(',')
		});
		if(update.error){
			throw(update.error);
		}
		alert("Documento actualizado correctamente");
		this.refresh();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.object.prototype.activate = async function(row) {
	try {
		const q = (row.activate) ? "Deshabilitar" : "Habilitar";
		if (!confirm('Confirma ' + q)) {
			return;
		}
		$(".loader").fadeIn();
		const update = await this.services.update({
			id: row._id
		}, {
			type: 'activate'
		});
		if(update.error){
			throw(update.error);
		}
		alert("Documento actualizado correctamente");
		this.refresh();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.object.prototype.changePassword = async function(row) {
	try {
		if (!confirm('Confirma querer cambiar contraseña')) {
			return;
		}
		const newpassword = await this.parent.prompt.execute('Cambiar contraseña', 'password', 'Ingrese nueva contraseña...', '');
		if (newpassword.trim() == '') {
			return;
		}
		$(".loader").fadeIn();
		const update = await this.services.update({
			id: row._id
		}, {
			type: 'password',
			password: newpassword
		});
		if(update.error){
			throw(update.error);
		}
		alert("Documento actualizado correctamente");
		this.refresh();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.object.prototype.enableRecovery = async function(row) {
	try {
		if (!confirm('Confirma enviar correo de recuperación')) {
			return;
		}
		$(".loader").fadeIn();
		const update = await this.services.update({
			id: row._id
		}, {
			type: 'notify'
		});
		if(update.error){
			throw(update.error);
		}
		alert("Notificacion enviada correctamente");
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.object.prototype.delete = async function(id) {
	try {
		if (!confirm("Confirme eliminación del documento")) {
			return;
		}
		$(".loader").fadeIn();
		const del = await this.services.delete({
			id: id || this.doc._id
		});
		if(del.error){
			throw(del.error);
		}
		alert("Documento eliminado correctamente");
		this.refresh();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.object.prototype.start = function() {
	this.getTags();
}