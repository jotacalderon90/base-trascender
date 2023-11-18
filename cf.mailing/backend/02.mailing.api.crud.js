"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const render = require('cl.jotacalderon.cf.framework/lib/render');
const mailing = require('./lib/mailing');
const parent = 'mailing';
const frontDirectory = 'mailing/memo/';

module.exports = {
	
	//@route('/api/mailing')
	//@method(['post'])
	create: async function(req,res){
		try{
			
			req.body.created = new Date();
			const d = await mongodb.insertOne(parent,req.body);
			req.body.pxmagico = d.insertedId.toString();
			
			if(req.body.type=='template'){
				req.body.html = render.process(frontDirectory + req.body.template,req.body);
				mongodb.updateOne('mailing',d.insertedId,{$set: {html: req.body.html}});
			}
			
			mailing.send(req.body);

			res.send({data: d.insertedId});
		
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/mailing/:id')
	//@method(['get','put','delete'])
	//@roles(['root','admin','mailing'])
	read: async function(req,res){
		try{
			switch(req.method.toLowerCase()){
				case 'get':
					res.send({data: await mongodb.findOne(parent,req.params.id)});
				break;
				case 'put':
					req.body.updated = new Date();
					await mongodb.updateOne(parent,req.params.id,req.body);
					res.send({data: true});
				break;
				case 'delete':
					const row = await mongodb.findOne(parent,req.params.id);
					await mongodb.deleteOne(parent,req.params.id);
					res.send({data: true});
				break;
			}
		}catch(e){
			response.APIError(req,res,e);
		}
	}
};