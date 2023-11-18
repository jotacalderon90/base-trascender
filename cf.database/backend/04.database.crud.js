"use strict";

const mongodb	= require('cl.jotacalderon.cf.framework/lib/mongodb');
const response	= require('cl.jotacalderon.cf.framework/lib/response');

module.exports = {
	
	//@route('/api/document/:name')
	//@method(['post'])
	//@roles(['root'])
	create: async function(req,res){
		try{
			const parentDoc = await mongodb.find('object',{name: req.params.name});
			if(parentDoc.length > 0 && parentDoc[0].dateOnSubmit){
				req.body[parentDoc[0].dateOnSubmit] = new Date(req.body[parentDoc[0].dateOnSubmit]);
			}
			
			await mongodb.insertOne(req.params.name,req.body);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/document/:name/:id')
	//@method(['get'])
	//@roles(['root'])
	read: async function(req,res){
		try{
			res.send({data: await mongodb.findOne(req.params.name,req.params.id)});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/document/:name/:id')
	//@method(['put'])
	//@roles(['root'])
	update: async function(req,res){
		try{
			const parentDoc = await mongodb.find('object',{name: req.params.name});
			if(parentDoc.length > 0 && parentDoc[0].dateOnSubmit && parentDoc[0].dateOnSubmit!=''){
				req.body[parentDoc[0].dateOnSubmit] = new Date(req.body[parentDoc[0].dateOnSubmit]);
			}
			await mongodb.updateOne(req.params.name,req.params.id,req.body);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/document/:name/:id')
	//@method(['delete'])
	//@roles(['root'])
	delete: async function(req,res){
		try{
			await mongodb.deleteOne(req.params.name,req.params.id);
			res.send({data: true});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
}