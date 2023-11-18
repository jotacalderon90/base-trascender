"use strict";

const logger	= require('cl.jotacalderon.cf.framework/lib/log')('route.database.default');
const response	= require('cl.jotacalderon.cf.framework/lib/response');
const mongodb	= require('cl.jotacalderon.cf.framework/lib/mongodb');
const request	= require('cl.jotacalderon.cf.framework/lib/request');

module.exports = {
	
	//@route('/api/document/:name/export')
	//@method(['get'])
	//@roles(['root'])
	export: async function(req,res){
		try{
			const o = await mongodb.find("object",{name: req.params.name});
			if(o.length!=1){
				throw("Problemas con el objeto");
			}
			if(!o[0].public){
				throw("Problemas con el objeto (2)");
			}
			if(o[0].role && req.user.roles.indexOf(o[0].role)==-1){
				throw("Problemas con el objeto (3)");
			}
			const data = await mongodb.find(req.params.name);
			
			//send as stream
			res.statusCode = 200;
			res.setHeader('Content-type', 'application/json');
			res.write('{"data": [');
			for (let i = 0; i < data.length; i++) {
				res.write(JSON.stringify(data[i]) + ((i+1 == data.length)?'':','));
			}
			res.write(']}');
			res.end();
			
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/document/:name/import')
	//@method(['post'])
	//@roles(['root'])
	import: async function(req,res){
		try{
			const array = req.body.headers.split('\n');
			const headers = {};
			for(let i=0;i<array.length;i++){
				const info = array[i].split(':');
				headers[info[0].trim()] = info[1].trim();	
			}
			let MyRequest = await request.get(req.body.url, {headers: headers});
			if(MyRequest==''){
				throw('no info in request.get');
			}
			MyRequest = JSON.parse(MyRequest);
			if(!MyRequest.data){
				throw(MyRequest.error);
			}
			if(req.body.dropCollection){
				await mongodb.dropCollection(req.params.name);
			}
			logger.info(MyRequest.data.length + ' registros encontrados en ' + req.body.url);
			for(let i=0;i<MyRequest.data.length;i++){
				MyRequest.data[i]._id = mongodb.toId(MyRequest.data[i]._id);
				await mongodb.insertOne(req.params.name,MyRequest.data[i]);
				logger.info("INSERTADO " + (i+1) + "/" + MyRequest.data.length);
			}
			
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
}