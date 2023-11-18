"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const recaptcha = require('cl.jotacalderon.cf.framework/lib/recaptcha');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const accesscontrol = require('cl.jotacalderon.cf.framework/lib/accesscontrol');
const request = require('cl.jotacalderon.cf.framework/lib/request');
const googleapis = require('./lib/googleapis');

const cookie = function(res,cookie){
	if(process.env.COOKIE_DOMAIN){
		res.cookie("Authorization", cookie, { domain: process.env.COOKIE_DOMAIN, path: "/", secure: true });
	}else{
		res.cookie("Authorization",cookie);
	}
}

const removeLogged = async function(req){
	if(req.user){
		req.session.destroy();
	}
}

module.exports = {
	
	//@route('/api/account/login')
	//@method(['post'])
	login: async function(req,res){
		try{
			await recaptcha.validate(req);
			req.body.email = req.body.email.toLowerCase();
			let rows = await mongodb.find("user",{email: req.body.email, activate: true});
			if(rows.length!=1){
				throw("Los datos ingresados no corresponden");
			}
			if(helper.toHash(req.body.password+req.body.email,rows[0].hash) != rows[0].password){
				throw("Los datos ingresados no corresponden");
			}
			cookie(res,accesscontrol.encode(rows[0]));
			
			if(process.env.HOST_PUSH){
				const headers = {};
				headers['x-api-key'] = process.env.X_API_KEY;
				request.post(process.env.HOST_PUSH + '/api/push/admin',{headers: headers},{title: 'Login', body: req.body.email});
			}
			
			if(req.headers.referer.indexOf('redirectoTo=')>-1){
				res.redirect(301, helper.strRight(req.headers.referer,'redirectoTo='));
			}else{
				res.redirect("/");
			}
			/*
			if(req.session.redirectTo){
				res.redirect(req.session.redirectTo);
			}else{
				res.redirect("/");
			}
			*/
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/logout')
	//@method(['get'])
	logout: async function(req,res){
		try{
			await removeLogged(req);
			cookie(res,"null");
			res.redirect("/login");
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/activate/:hash')
	//@method(['get'])
	activate: async function(req,res){
		try{
			
			const hash = new Buffer(req.params.hash, "base64").toString("ascii");
			const row = await mongodb.find("user",{password: hash});
			if(row.length!=1){
				throw("Error al obtener usuario asociado al hash");
			}
			row[0].activate = true;
			await mongodb.updateOne("user",row[0]._id,row[0]);
			response.renderMessage(req,res,200,'Usuario activado','Se ha completado su registro satisfactoriamente','success');
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/desactivate/:hash')
	//@method(['get'])
	desactivate: async function(req,res){
		try{
			
			const hash = new Buffer(req.params.hash, "base64").toString("ascii");
			const row = await mongodb.find("user",{password: hash});
			if(row.length!=1){
				throw("Error al obtener usuario asociado al hash");
			}
			row[0].activate = false;
			await mongodb.updateOne("user",row[0]._id,row[0]);
			response.renderMessage(req,res,200,'Usuario desactivado','Se ha completado su desactivación satisfactoriamente','success');
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/forget')
	//@method(['post'])
	forget: async function(req,res){
		try{
			
			if(process.env.CANRECOVERY!='1'){
				throw("none");
			}
			
			await recaptcha.validate(req);
			req.body.email = req.body.email.toLowerCase();
			const user = await mongodb.find("user",{email: req.body.email});
			if(user.length!=1){
				throw("Error al obtener usuario");
			}
			
			if(process.env.HOST_MAILING){
				const memo = {};
				memo.to = req.body.email;
				memo.subject = "Reestablecer contraseña"
				memo.hash = process.env.HOST + "/api/account/recovery?hash=" + new Buffer(user[0].password).toString("base64");
				
				memo.type = 'template';
				memo.template = 'accountRecovery.html';
				memo.send = true;
				
				request.post(process.env.HOST_MAILING + '/api/mailing',{},memo);
			}
			
			response.renderMessage(req,res,200,'Recuperación de cuenta','Se ha enviado un correo para poder reestablecer su contraseña','success');
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/recovery')
	//@method(['get','post'])
	recovery: async function(req,res){
		try{
			
			if(process.env.CANRECOVERY!='1'){
				throw("none");
			}
			
			switch(req.method.toLowerCase()){
				case "get":
					res.render('admin/recovery', {hash: req.query.hash});
				break;
				case "post":
					await recaptcha.validate(req);
					const user = await mongodb.find("user",{password:  new Buffer(req.body.hash,"base64").toString("ascii")});
					if(user.length!=1){
						throw("Los datos ingresados no corresponden");
					}
					const updated = {$set: {password: helper.toHash(req.body.password + user[0].email,user[0].hash)}};
					await mongodb.updateOne("user",user[0]._id,updated);
					
					response.renderMessage(req,res,200,'Actualización de contraseña','Se ha actualizado su contraseña correctamente','success');
				break;
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/api/account/googleoauth')
	//@method(['get'])
	loginGoogleGetURL: async function(req,res){
		try{
			res.json({data: googleapis.getURL()});
		}catch(e){
			res.json({data: null, error: e});
		}
	},
	
	//@route('/api/account/googleoauth/callback')
	//@method(['get'])
	loginGoogleExecute: async function(req,res){
		try{
			const user = await googleapis.getUserInfo(req.query.code);
			let row = await mongodb.find("user",{email: user.emails[0].value});
			if(row.length!=1){
				row = {};
				row.email = user.emails[0].value;
				row.hash = helper.random(10);
				row.password = helper.toHash(row.hash + user.emails[0].value,row.hash);
				row.nickname = user.displayName;
				row.notification = true;
				row.thumb = user.image.url;
				row.roles = ["user"];
				row.created = new Date();
				row.activate = true
				row.google = user;
				await mongodb.insertOne("user",row);
			}else{
				let updated = {
					$set: {
						//nickname: user.displayName,
						thumb: user.image.url,
						google: user
					}
				};
				row = row[0];
				await mongodb.updateOne("user",row._id,updated);
			}
			cookie(res,accesscontrol.encode(row));
			
			const redirectTo = helper.getCookie(req,'redirectTo');
			
			if(process.env.HOST_PUSH){
				const headers = {};
				headers['x-api-key'] = process.env.X_API_KEY;
				request.post(process.env.HOST_PUSH + '/api/push/admin',{headers: headers},{title: 'Login Google', body: row.email});
			}
					
			if((redirectTo != null && redirectTo != '') || (req.session.redirectTo && req.session.redirectTo!='')){
				res.redirect(301, redirectTo || req.session.redirectTo);
			}else{
				res.redirect("/");
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	}
}