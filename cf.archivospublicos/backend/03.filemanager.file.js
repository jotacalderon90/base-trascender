"use strict";

const fs = require("fs");
const path = require("path");
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const response = require('cl.jotacalderon.cf.framework/lib/response');
const directory = process.cwd() + "/frontend/";

const decode = function(value){
	return decodeURIComponent(new Buffer(value,"base64"));
}

module.exports = {
	
	//@route('/api/filemanager/file/:id/total')
	//@method(['get'])
	//@roles(['root'])
	total: async function(req,res){
		try{
			const dir = directory + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return fs.statSync(path.join(dir,row)).isFile();
			}).length;
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/collection')
	//@method(['get'])
	//@roles(['root'])
	collection: async function(req,res){
		try{
			const dir = directory + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return fs.statSync(path.join(dir,row)).isFile();
			});
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id')
	//@method(['post'])
	//@roles(['root'])
	create: async function(req,res){
		try{
			fs.writeFileSync(directory + decode(req.params.id) + req.body.name, (req.body.content)?req.body.content:"");
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id')
	//@method(['get'])
	//@roles(['root'])
	read: async function(req,res){
		try{
			res.send({data: fs.readFileSync(directory + decode(req.params.id),"utf8")});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id')
	//@method(['put'])
	//@roles(['root'])
	update: async function(req,res){
		try{
			fs.writeFileSync(directory + decode(req.params.id), req.body.content);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id')
	//@method(['delete'])
	//@roles(['root'])
	delete: async function(req,res){
		try{
			fs.unlinkSync(directory + decode(req.params.id));
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/rename')
	//@method(['put'])
	//@roles(['root'])
	rename: async function(req,res){
		try{
			fs.renameSync(directory + decode(req.params.id),directory + "/" + req.body.name);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/download')
	//@method(['get'])
	//@roles(['root'])
	download: async function(req,res){
		try{
			res.download(directory + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/getfile')
	//@method(['get'])
	//@roles(['root'])
	get: async function(req,res){
		try{
			res.sendFile(directory + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/uploader')
	//@method(['post'])
	//@roles(['root'])
	upload: async function(req,res){
		try{
			if (!req.files || Object.keys(req.files).length === 0) {
				throw("no file");
			}
			
			const dir = directory + (decode(req.params.id)).substr(1);
			
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