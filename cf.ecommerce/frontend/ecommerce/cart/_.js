app.modules.object = function() {
	
}

app.modules.object.prototype.start = function() {
	this.doc = {
		email: "",
		message: "",
		product: []
	};
	const cart = localStorage.getItem("cart");
	if (cart != null && cart != "") {
		const products = (atob(cart)).split("||");
		for (let i = 0; i < products.length; i++) {
			const product = products[i].split("##");
			this.doc.product.push({
				_id: product[0],
				title: product[1],
				price: parseInt(product[2]),
				cant: 1
			});
		}
	}

	$('#modal_form').modal('show');
	$('.loader').fadeOut();
}

app.modules.object.prototype.calculaterow = function(row) {
	return row.price * row.cant;
}

app.modules.object.prototype.calculatetotal = function() {
	if (this.doc != null) {
		var total = 0;
		for (var i = 0; i < this.doc.product.length; i++) {
			total += this.doc.product[i].price * this.doc.product[i].cant
		}
		return total;
	} else {
		return "null";
	}
}

app.modules.object.prototype.remove = function(index) {
	this.doc.product.splice(index, 1);
	this.updateCart();
}

app.modules.object.prototype.updateCart = function() {
	let cart = "";
	for (let i = 0; i < this.doc.product.length; i++) {
		cart += this.doc.product[i]._id +
			"##" + this.doc.product[i].title +
			"##" + this.doc.product[i].price +
			"##" + this.doc.product[i].cant +
			"##" + this.doc.product[i].dcto +
			"##" + this.doc.product[i].img;
		if (cart + 1 < this.doc.product.length) {
			cart += "||";
		}
	}
	localStorage.setItem("cart", btoa(cart));
}

app.modules.object.prototype.create = async function() {

	if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.doc.email)){
		throw('Ingrese un email válido');
	}

	if (!confirm('Confirme cotización')) {
		return;
	}

	$('.loader').fadeIn();
	try {
		await fetch('https://mailing.jotace.cl/api/mailing/multidomain', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: this.doc.email,
				message: 'Solicitud de cotización, ' + this.doc.message,
				subject: 'Cotización desde sitio web ' + document.location.hostname,
				'g-recaptcha-response': grecaptcha.getResponse(),
				template: 'ecommerceRequest.html',
				total: this.calculatetotal(),
				product: this.doc.product.map((r)=>{
					return {
						_id: r._id,
						title: r.title,
						img: HOST_CMS + '/assets/img/ecommerce/' + r._id + '.jpg',
						price: r.price,
						cant: 1,
						total: r.price
					};
				})
			})
		});
		localStorage.setItem("cart", btoa(''));
		alert('Documento creado correctamente');
		location.href = '/';
	} catch (e) {
		console.log(e);
		alert(e.error || 'Error, estado ' + e.xhttp.status);
	}
	$('.loader').fadeOut();
}