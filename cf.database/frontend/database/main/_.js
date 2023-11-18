const database = function(parent) {
	this.parent = parent;
	this.services = {
		objeto: createServices('api/document/object'),
		registros: createServices('api/document/:object'),
		import: createService('POST', '/api/document/:object/import'),
	};
	/*
	this.scroller = '#database_modal_registros .modal-content';
	$(this.scroller).scroll(() => {
		const p = $(this.scroller)[0].scrollHeight - $(document).height();
		if (($(this.scroller).scrollTop() * 100) / p >= 99) {
			if (this.registros.obtained < this.registros.cant && !this.registros.obtaining) {
				this.loadRegistros();
			}
		}
	});*/
}

/*Inicio de app*/
database.prototype.start = function() {
	this.restartObjetos();
}

/*Objetos*/

database.prototype.restartObjetos = async function() {
	try {
		$('.loader').fadeIn();
		const d = await this.services.objeto.collection({
			query: JSON.stringify({}),
			options: JSON.stringify({})
		});
		if (d.error) {
			throw (d.error);
		}
		this.objetos = sortArrayByField(d.data, 'label');
		this.parent.refresh();
		$('.loader').fadeOut();
	} catch (e) {
		alert(e);
	}
}

database.prototype.newObjeto = function() {
	$('#database_modal_objetos').modal('hide');
	$('#database_modal_objeto').fadeIn();
	this.objeto = {
		content: JSON.stringify({}, undefined, "\t")
	};
}

database.prototype.createObjeto = async function() {
	try {
		if (!confirm("Confirme creación del documento")) {
			return;
		}
		const doc = JSON.parse(this.objeto.content.split("\n").join(""));
		if (!doc.name || doc.name.trim() == "") {
			throw ("Nombre inválido");
		}
		if (this.objetos.filter((r) => {
				return r.name.toLowerCase() == doc.name.toLowerCase();
			}).length != 0) {
			throw ("El objeto " + doc.name + " ya existe");
		}
		$(".loader").fadeIn();
		const d = await this.services.objeto.create({}, doc);
		if (d.error) {
			throw (d.error);
		}
		alert("Objeto creado");
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}

	$(".loader").fadeOut();
	$('#database_modal_objetos').fadeIn();
	$('#database_modal_objeto').fadeOut();
	this.restartObjetos();
}

database.prototype.selectObjeto = function(objeto) {
	this.objeto = objeto;
	this.objeto.content = JSON.stringify(objeto, undefined, "\t");
	this.restartRegistros();
}

database.prototype.updateObjeto = async function() {
	try {
		if (!confirm("Confirme actualización del documento")) {
			return;
		}
		const doc = JSON.parse(this.objeto.content.split("\n").join(""));
		if (!doc.name || doc.name.trim() == "") {
			throw ("Nombre inválido");
		}
		if (this.objetos.filter((r) => {
				return r.name.toLowerCase() == doc.name.toLowerCase() && r._id != this.objeto._id;
			}).length != 0) {
			throw ("El objeto " + doc.name + " ya existe");
		}
		$(".loader").fadeIn();

		const d = await this.services.objeto.update({
			id: this.objeto._id
		}, doc);
		if (d.error) {
			throw (d.error);
		}
		alert("Objeto actualizado");

	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

database.prototype.deleteObjeto = async function() {
	try {
		if (!confirm("Confirme eliminación del documento")) {
			return;
		}
		$(".loader").fadeIn();
		const d = await this.services.objeto.delete({
			id: this.objeto._id
		});
		if (d.error) {
			throw (d.error);
		}
		alert("Objeto eliminado");
		$('#database_modal_objetos').fadeIn();
		$('#database_modal_objeto').fadeOut();
		this.restartObjetos();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

database.prototype.openObjeto = function() {
	$('#database_modal_registros').fadeOut();
	$('#database_modal_objeto').fadeIn();
}

database.prototype.closeObjeto = function() {
	$('#database_modal_objeto').fadeOut();
	$('#database_modal_registros').fadeIn();
}

database.prototype.import = async function() {
	try {

		const url = prompt('Ingrese URL de la colección');
		if (!url) {
			return;
		}

		$(".loader").fadeIn();

		let headers = {};
		if (confirm('¿Desea ingresar headers?')) {
			headers = prompt('Ingrese headers: ');
		}

		const d = await this.services.import({
			object: this.objeto.name
		}, {
			url: url,
			headers: headers,
			dropCollection: confirm('¿Desea reiniciar colección?')
		});
		if (d.error) {
			throw (d.error);
		}
		alert('Importación realizada correctamente');

		$(".loader").fadeOut();

	} catch (e) {
		$(".loader").fadeOut();
		alert(e.error || e);
		console.log(e);
	}
}

/*Registros*/

database.prototype.restartRegistros = async function() {
	try {
		$('.loader').fadeIn();
		$('#database_modal_objetos').fadeOut();
		$('#database_modal_registros').fadeIn();

		this.registros = {
			coll: [],
			selected: []
		};
		const d = await this.services.registros.total({
			object: this.objeto.name,
			query: JSON.stringify({})
		});
		if (d.error) {
			throw (d.error);
		}
		this.registros.cant = d.data;
		this.loadRegistros();
	} catch (e) {
		alert(e);
	}
}

database.prototype.loadRegistros = async function() {
	try {
		$('.loader').fadeIn();

		this.registros.obtaining = true;

		const d = await this.services.registros.collection({
			object: this.objeto.name,
			query: JSON.stringify({}),
			options: JSON.stringify(this.getOptions())
		});

		if (d.error) {
			throw (d.error);
		}

		this.registros.coll = this.registros.coll.concat(d.data);
		this.registros.obtained = this.registros.coll.length;
		this.registros.obtaining = false;

		this.parent.refresh();
		$('.loader').fadeOut();
	} catch (e) {
		alert(e);
	}
}

database.prototype.getOptions = function() {
	const o = {
		skip: this.registros.obtained,
		limit: 50
	};
	if (this.objeto.projection) {
		o.projection = this.objeto.projection;
	}
	if (this.objeto.sort) {
		o.sort = this.objeto.sort;
	}
	return o;
}

database.prototype.newRegistro = function() {
	$('#database_modal_registros').fadeOut();
	$('#database_modal_registro').fadeIn();
	this.registro = {
		content: JSON.stringify(this.objeto.schema, undefined, "\t")
	};
}

database.prototype.createRegistro = async function() {
	try {
		if (!confirm("Confirme creación del documento")) {
			return;
		}
		const doc = JSON.parse(this.registro.content.split("\n").join(""));
		$(".loader").fadeIn();
		const d = await this.services.registros.create({
			object: this.objeto.name
		}, doc);
		if (d.error) {
			throw (d.error);
		}
		alert("Documento creado");
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}

	$(".loader").fadeOut();
	$('#database_modal_registro').fadeOut();
	$('#database_modal_objetos').fadeIn();
	this.restartRegistros();
}

/*Registro*/

database.prototype.selectRegistro = async function(row) {
	$('.loader').fadeIn();
	try {
		console.log(this.services);
		const registro = await this.services.registros.read({
			object: this.objeto.name,
			id: row._id
		});
		if (registro.error) {
			throw (registro.error);
		}
		this.registro = registro.data;
		
		this.registro.content = JSON.stringify(this.registro, undefined, "\t");
		
		this.parent.refresh();
		$('.loader').fadeOut();
	} catch (e) {
		$('.loader').fadeOut();
		alert(e);
		console.log(e);
	}
}

database.prototype.updateRegistro = async function() {
	try {
		if (!confirm("Confirme actualización del documento")) {
			return;
		}
		$(".loader").fadeIn();

		const d = JSON.parse(this.registro.content);

		d['$$hashKey'] = undefined;
		d['_class'] = undefined;

		const d2 = await this.services.registros.update({
			object: this.objeto.name,
			id: this.registro._id
		}, d);
		if (d2.error) {
			throw (d2.error);
		}
		alert("Documento actualizado");

	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

database.prototype.deleteRegistro = async function() {
	try {
		if (!confirm("Confirme eliminación del documento")) {
			return;
		}
		$(".loader").fadeIn();
		const d = await this.services.registros.delete({
			object: this.objeto.name,
			id: this.registro._id
		});
		if (d.error) {
			throw (d.error);
		}
		alert("Objeto eliminado");
		$('#database_modal_objetos').fadeIn();
		$('#database_modal_registro').fadeOut();
		this.restartRegistros();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

database.prototype.closeRegistros = function() {
	$('#database_modal_objetos').fadeIn();
	$('#database_modal_registros').fadeOut();
}

database.prototype.closeRegistro = function() {
	$('#database_modal_registro').fadeOut();
	$('#database_modal_registros').fadeIn();
}

database.prototype.selectRegistros = function(registro) {
	if (this.registros.selected.indexOf(registro._id) == -1) {
		this.registros.selected.push(registro._id);
		registro._class = 'danger';
	} else {
		this.registros.selected.splice(this.registros.selected.indexOf(registro._id), 1);
		registro._class = '';
	}
	console.log(this.registros, registro);
}

database.prototype.deleteRegistros = async function() {
	try {
		if (!confirm("Confirme eliminación de " + this.registros.selected.length + " registros")) {
			return;
		}
		$(".loader").fadeIn();
		for (let i = 0; i < this.registros.selected.length; i++) {
			const d = await this.services.registros.delete({
				object: this.objeto.name,
				id: this.registros.selected[i]
			});
			if (d.error) {
				throw (d.error);
			}
		}
		this.registros.selected = [];
		alert("Registros eliminados");
		this.restartRegistros();
	} catch (e) {
		alert(e.error || e);
		console.log(e);
	}
	$(".loader").fadeOut();
}

app.modules.database = database;