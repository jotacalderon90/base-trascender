"use strict";

const fs = require("fs");
const path = require("path");
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const response = require('cl.jotacalderon.cf.framework/lib/response');
const parent = require('./lib/cms');

const directory = process.cwd() + "/frontend/assets/sites/";

const decode = function(value){
	return decodeURIComponent(new Buffer(value,"base64"));
}

module.exports = {
	
	//@route('/api/filemanager/:id/total')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	total: async function(req,res){
		try{
			parent.validRequest(req);
			const dir = directory + req.query.host + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return fs.statSync(path.join(dir,row)).isFile();
			}).length;
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id/collection')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	collection: async function(req,res){
		try{
			parent.validRequest(req);
			const dir = directory + req.query.host + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return fs.statSync(path.join(dir,row)).isFile();
			});
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id')
	//@method(['post'])
	//@roles(['root','admin','cms'])
	create: async function(req,res){
		try{
			parent.validRequest(req);
			fs.writeFileSync(directory + req.query.host + decode(req.params.id) + req.body.name, (req.body.content)?req.body.content:"");
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	read: async function(req,res){
		try{
			parent.validRequest(req);
			res.send({data: fs.readFileSync(directory + req.query.host + decode(req.params.id),"utf8")});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id')
	//@method(['put'])
	//@roles(['root','admin','cms'])
	update: async function(req,res){
		try{
			parent.validRequest(req);
			fs.writeFileSync(directory + req.query.host + decode(req.params.id), req.body.content);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id')
	//@method(['delete'])
	//@roles(['root','admin','cms'])
	delete: async function(req,res){
		try{
			parent.validRequest(req);
			fs.unlinkSync(directory + req.query.host + decode(req.params.id));
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id/rename')
	//@method(['put'])
	//@roles(['root','admin','cms'])
	rename: async function(req,res){
		try{
			parent.validRequest(req);
			fs.renameSync(directory + req.query.host + decode(req.params.id),directory + "/" + req.body.name);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id/download')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	download: async function(req,res){
		try{
			parent.validRequest(req);
			res.download(directory + req.query.host + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id/getfile')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	get: async function(req,res){
		try{
			parent.validRequest(req);
			res.sendFile(directory + req.query.host + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/:id/uploader')
	//@method(['post'])
	//@roles(['root','admin','cms'])
	upload: async function(req,res){
		try{
			
			if (!req.files || Object.keys(req.files).length === 0) {
				throw("no file");
			}
			
			parent.validRequest(req);
			
			const dir = directory + req.query.host + (decode(req.params.id)).substr(1);
			
			if(Array.isArray(req.files.file)){
				for(let i=0;i<req.files.file.length;i++){
					await helper.upload_process(req.files.file[i], dir + req.files.file[i].name);
				}
			}else{
				await helper.upload_process(req.files.file, dir + req.files.file.name);
			}
			
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
}