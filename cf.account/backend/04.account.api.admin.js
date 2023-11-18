"use strict";

const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const response = require('cl.jotacalderon.cf.framework/lib/response');
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const request = require('cl.jotacalderon.cf.framework/lib/request');

module.exports = {
	
	//@route('/api/admin/account/createadmin')
	//@method(['post'])
	createAdmin: async function(req,res){
		try{
			
			if(!process.env.CANCREATEADMIN=='1'){
				throw("none");
			}
			
			req.body.email = req.body.email.toLowerCase();
			const cantXEmail = await mongodb.count("user",{email: req.body.email});
			if(cantXEmail!=0){
				throw("El email ingresado ya está registrado");
			}
			const doc = {};
			doc.email = req.body.email;
			doc.hash = helper.random(10);
			doc.password = helper.toHash(req.body.password + req.body.email,doc.hash);
			doc.nickname = req.body.email;
			doc.notification = true;
			doc.thumb = process.env.HOST_ARCHIVOSPUBLICOS + "/media/img/user.png";
			doc.roles = ["root"];
			doc.created = new Date();
			doc.activate = true;
			await mongodb.insertOne("user",doc);
			
			response.renderMessage(req,res,200,'Cuenta administrador','Se ha creado el usuario administrador de manera correcta','success');
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	
	//@route('/api/admin/account/total')
	//@method(['get'])
	//@roles(['root','admin'])
	total: async function(req,res){
		try{
			req.query = (req.query.query && req.query.query!=':query')?JSON.parse(req.query.query):{};
			const total = await mongodb.count('user',req.query);
			res.send({data: total});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/admin/account/collection')
	//@method(['get'])
	//@roles(['root','admin'])
	collection: async function(req,res){
		try{
			req.options = (req.query.options)?JSON.parse(req.query.options):{};
			req.query = (req.query.query)?JSON.parse(req.query.query):{};
			const data = await mongodb.find('user',req.query,req.options);
			res.send({data: data});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/admin/account/tag/collection')
	//@method(['get'])
	//@roles(['root','admin'])
	tag: async function(req,res){
		try{
			const data = await mongodb.distinct('user','roles');
			res.send({data: data});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/admin/account')
	//@method(['post'])
	//@roles(['root','admin'])
	create: async function(req,res){
		try{
			req.body.email = req.body.email.toLowerCase();
			if(!helper.isEmail(req.body.email)){
				throw("El email ingresado no es válido");
			}
			if(req.body.password==undefined || req.body.password==null || req.body.password.length < 5){ 
				throw("La contraseña ingresada debe tener al menos 5 caracteres");
			}
			const cantXEmail = await mongodb.count("user",{email: req.body.email});
			if(cantXEmail!=0){
				throw("El email ingresado ya está registrado");
			}
			const doc = {};
			doc.email = req.body.email;
			doc.hash = helper.random(10);
			doc.password = helper.toHash(req.body.password + req.body.email,doc.hash);
			doc.nickname = req.body.email;
			doc.notification = true;
			doc.thumb = process.env.HOST_ARCHIVOSPUBLICOS + "/media/img/user.png";
			doc.roles = ["user"];
			doc.created = new Date();
			doc.activate = true;
			await mongodb.insertOne("user",doc);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/admin/account/:id')
	//@method(['put'])
	//@roles(['root','admin'])
	update: async function(req,res){
		try{
			const row = await mongodb.findOne('user',req.params.id);
			switch(req.body.type){
				case 'roles':
					if(req.body.roles.length==0){ 
						throw("Debe asignar al menos un rol");
					}
					await mongodb.updateOne('user',req.params.id,{$set: {roles: req.body.roles}});
					break;
				case 'activate':
					await mongodb.updateOne('user',req.params.id,{$set: {activate: (row.activate)?false:true}});
				break;
				case 'password':
					if(req.body.password==undefined || req.body.password==null || req.body.password.length < 5){ 
						throw("La contraseña ingresada debe tener al menos 5 caracteres");
					}
					await mongodb.updateOne('user',req.params.id,{$set: {password: helper.toHash(req.body.password + row.email,row.hash)}});
				break;
				case 'notify':
					if(process.env.HOST_MAILING){
						const memo = {};
						memo.to = row.email;
						memo.subject = "Reestablecer contraseña"
						memo.hash = process.env.HOST + "/api/account/recovery?hash=" + new Buffer(row.password).toString("base64");
						
						memo.type = 'template';
						memo.template = 'accountRecovery.html';
						memo.send = true;
						
						request.post(process.env.HOST_MAILING + '/api/mailing',{},memo);
					}
				break;
			}
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/admin/account/:id')
	//@method(['delete'])
	//@roles(['root','admin'])
	delete: async function(req,res){
		try{
			await mongodb.deleteOne('user',req.params.id);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
}