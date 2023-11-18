$('body').delegate('#form_subscription', 'submit', async function(event){
	event.preventDefault();
	try{
		if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email.value)){
			throw('Ingrese un email válido');
		}
		$('.loader').fadeIn();
		await fetch('https://mailing.jotace.cl/api/mailing/multidomain', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: this.email.value,
				message: 'Subscripción a sitio web',
				subject: 'Subscripcion desde sitio web ' + document.location.hostname,
				'g-recaptcha-response': grecaptcha.getResponse()
			})
		});
		$('.loader').fadeOut();
		alert('Subscripcion realizada con éxito\n');
		location.href = '/';		
	}catch(error){
		$('.loader').fadeOut();
		alert(error);
	}
});