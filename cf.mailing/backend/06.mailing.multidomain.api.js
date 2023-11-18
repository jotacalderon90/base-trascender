"use strict";

const fs = require('fs');
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const render = require('cl.jotacalderon.cf.framework/lib/render');
const recaptcha = require('cl.jotacalderon.cf.framework/lib/recaptcha');
const mailing = require('./lib/mailing2');

module.exports = {
	
	//@route('/api/mailing/multidomain')
	//@method(['post'])
	create: async function(req,res){
		try{
			
			//valido origen https
			if(req.headers.origin.indexOf('https://')==-1){
				throw('Protocolo "' + req.headers.origin + '" incorrecto');
			}
			
			//valido email
			req.body.to = req.body.to.toLowerCase();
			if(!helper.isEmail(req.body.to)){
				throw('Email "' + req.body.to + '" incorrecto');
			}
			
			//valido mensaje
			if(!req.body.message || req.body.message.trim()==''){
				throw('Mensage "' + req.body.message + '" incorrecto');
			}
			
			//valido config smtp active de referer
			const origin = req.headers.origin.split('https://')[1];
			const smtp = await mongodb.find('smtp',{client: {$in: [origin]}, active: true});
			if(smtp.length == 0){
				throw('Origen "' + origin + '" incorrecto');
			}
			
			//valido recaptcha
			if(smtp[0].recaptcha === process.env.RECAPTCHA_PUBLIC){
				await recaptcha.validate(req);
			}
			
			//ALERT:la validacion anterior es para clientes que no ocupen mi recaptcha, pero debo buscar la forma de validar que no se pasen de listo y generen correo a lo loco
			
			//set body
			req.body.created = new Date();
			req.body.host = origin;
			const d = await mongodb.insertOne('mailing',req.body);
			req.body.pxmagico = d.insertedId.toString();
			
			//set template
			let template = (req.body.template)?req.body.template:'formulario_contacto.html';
			if(fs.existsSync(process.cwd() + '/frontend/mailing/memo/' + origin + '/' + template)){
				template = 'mailing/memo/' + origin + '/' +  template;
			}else{
				template = 'mailing/memo/' + template;//se asume que debe existir formulario_contacto.html en la raiz
			}
			req.body.html = render.process(template,req.body);				
			mongodb.updateOne('mailing',d.insertedId,{$set: {html: req.body.html}});
			
			//send mail
			mailing.send(smtp[0], req.body);
			
		}catch(e){
			console.log(e);
		}
		
		res.send({data: true});
	
	},
	
	//@route('/api/mailing/multidomainmicro')
	//@method(['post'])
	createMicro: async function(req,res){
		try{
			
			//microservicio para enviar correos desde distintos sistemas
			
			//valido email
			req.body.to = req.body.to.toLowerCase();
			if(!helper.isEmail(req.body.to)){
				throw('Email "' + req.body.to + '" incorrecto');
			}
			
			//valido mensaje
			if(!req.body.message || req.body.message.trim()==''){
				throw('Mensage "' + req.body.message + '" incorrecto');
			}
			
			//valido config smtp active de referer
			const smtp = await mongodb.find('smtp',{'x-api-key': req.headers['x-api-key'], active: true});
			if(smtp.length == 0){
				throw('X-API-KEY "' + req.headers['x-api-key'] + '" incorrecto');
			}
			
			//valido host in smtp config
			if(smtp[0].client.indexOf(req.body.host)==-1){
				throw('Invalid host ' + req.body.host + ' in x-api-key');
			}
			const origin = req.body.host;
			
			//set body
			req.body.created = new Date();
			const d = await mongodb.insertOne('mailing',req.body);
			req.body.pxmagico = d.insertedId.toString();
			
			//set template
			let template = (req.body.template)?req.body.template:'formulario_contacto.html';
			if(fs.existsSync(process.cwd() + '/frontend/mailing/memo/' + origin + '/' + template)){
				template = 'mailing/memo/' + origin + '/' +  template;
			}else{
				template = 'mailing/memo/' + template;//se asume que debe existir formulario_contacto.html en la raiz
			}
			req.body.html = render.process(template,req.body);				
			mongodb.updateOne('mailing',d.insertedId,{$set: {html: req.body.html}});
			
			//send mail
			mailing.send(smtp[0], req.body);
			
		}catch(e){
			console.log(e);
		}
		
		res.send({data: true});
	
	}
};