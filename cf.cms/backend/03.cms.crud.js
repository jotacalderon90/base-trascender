"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const fs = require('fs');
const parent = require('./lib/cms');

module.exports = {
	
	//@route('/api/cms/:object')
	//@method(['post'])
	//@roles(['root','admin','cms'])
	create: async function(req,res){
		try{
			
			parent.validRequest(req,true);
			const host = req.query.host;
			
			req.body.host = host;
			req.body.author = helper.saveUser(req.user);
			req.body.created = new Date();
			req.body.url = helper.cleaner(req.body.title);
			req.body.uri = helper.cleaner(req.body.title);
			
			const d = await mongodb.insertOne(req.params.object,req.body);
			
			res.send({data: d.insertedId});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/:id')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	read: async function(req,res){
		try{
			parent.validRequest(req,true);
			const host = req.query.host;
			const row = await mongodb.findOne(req.params.object, req.params.id);
			if(row.host!=host){
				throw('invalid row');
			}
			res.send({data: row});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/:id')
	//@method(['put'])
	//@roles(['root','admin','cms'])
	update: async function(req,res){
		try{
			parent.validRequest(req,true);
			const host = req.query.host;
			
			req.body.host = host;
			req.body.updated = new Date();
			req.body.url = helper.cleaner(req.body.title);
			req.body.uri = helper.cleaner(req.body.title);
			
			await mongodb.updateOne(req.params.object,req.params.id,req.body);
			
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/:id')
	//@method(['delete'])
	//@roles(['root','admin','cms'])
	delete: async function(req,res){
		try{
			
			parent.validRequest(req,true);
			const host = req.query.host;
			
			const row = await mongodb.findOne(req.params.object,req.params.id);
			if(row.host != host){
				throw('invalid row');
			}
			
			await mongodb.deleteOne(req.params.object,req.params.id);
			
			fs.unlinkSync(process.cwd() + '/frontend/assets/img/'+ req.params.object + '/' + req.params.id + '.jpg');
			res.send({data: true});
		
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/:id/image')
	//@method(['post'])
	//@roles(['root','admin','cms'])
	uploadImage: async function(req,res){
		try{
			if (!req.files || Object.keys(req.files).length != 1) {
				throw("no file");
			}
			
			parent.validRequest(req,true);
			
			if (!fs.existsSync(process.cwd() + '/frontend/assets/img/'+ req.params.object)) {
				fs.mkdirSync(process.cwd() + '/frontend/assets');
				fs.mkdirSync(process.cwd() + '/frontend/assets/img');
				fs.mkdirSync(process.cwd() + '/frontend/assets/img/'+ req.params.object);
			}
			
			await helper.upload_process(req.files.file, process.cwd() + '/frontend/assets/img/'+ req.params.object + '/' + req.params.id + '.jpg');
			
			res.redirect('/' + req.params.object + '/' + req.params.id + '?host=' + req.query.host);
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/:id/img/base64')
	//@method(['post'])
	//@roles(['root','admin','cms'])
	uploadImageB64: async function(req,res){
		try{
			
			if (!req.body.base64) {
				throw("no file");
			}
			
			parent.validRequest(req,true);
			
			if (!fs.existsSync(process.cwd() + '/frontend/assets/img/'+ req.params.object)) {
				fs.mkdirSync(process.cwd() + '/frontend/assets');
				fs.mkdirSync(process.cwd() + '/frontend/assets/img');
				fs.mkdirSync(process.cwd() + '/frontend/assets/img/'+ req.params.object);
			}
			
			const buffer = Buffer.from(req.body.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
			const filePath = process.cwd() + '/frontend/assets/img/'+ req.params.object + '/' + req.params.id + '.jpg';
			
			fs.writeFile(filePath, buffer, (error) => {
				if (error) {
					response.APIError(req,res,error);
				}
				res.send({data: true});
			});
			
		}catch(e){
			response.APIError(req,res,e);
		}
	}
};