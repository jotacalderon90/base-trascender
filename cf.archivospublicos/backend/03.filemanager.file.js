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
	//@method(['get'])
	read: async function(req,res){
		try{
			res.send({data: fs.readFileSync(directory + decode(req.params.id),"utf8")});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/download')
	//@method(['get'])
	download: async function(req,res){
		try{
			res.download(directory + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/file/:id/getfile')
	//@method(['get'])
	get: async function(req,res){
		try{
			res.sendFile(directory + decode(req.params.id));
		}catch(e){
			response.APIError(req,res,e);
		}
	}
}