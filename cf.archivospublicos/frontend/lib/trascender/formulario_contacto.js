$('body').delegate('#form_contact','submit', async function(event){
	event.preventDefault();
	try{
		if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email.value)){
			throw('Ingrese un email válido');
		}
		if(this.message.value.trim()==''){
			throw('Ingrese un mensaje válido');
		}
		$('.loader').fadeIn();
		await fetch('https://mailing.jotace.cl/api/mailing/multidomain', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: this.email.value,
				message: this.message.value,
				subject: 'Mensaje desde sitio web ' + document.location.hostname,
				'g-recaptcha-response': grecaptcha.getResponse()
			})
		});
		$('.loader').fadeOut();
		alert('Hemos recibido su mensaje\nnos contactaremos lo mas pronto posible');
		location.href = '/';		
	}catch(error){
		$('.loader').fadeOut();
		alert(error);
	}
});