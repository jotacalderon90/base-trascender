"use strict";

const fs = require("fs");
const path = require("path");
const response = require('cl.jotacalderon.cf.framework/lib/response');
const directory = process.cwd() + "/frontend/";

const decode = function(value){
	return decodeURIComponent(new Buffer(value,"base64"));
}

module.exports = {

	
	//@route('/api/filemanager/folder/:id/total')
	//@method(['get'])
	total: async function(req,res){
		try{
			const dir = directory + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return !fs.statSync(path.join(dir,row)).isFile();
			}).length;
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/filemanager/folder/:id/collection')
	//@method(['get'])
	collection: async function(req,res){
		try{
			const dir = directory + decode(req.params.id);
			const response = fs.readdirSync(dir,"utf8").filter(function(row){
				return !fs.statSync(path.join(dir,row)).isFile();
			});
			res.send({data: response});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
}