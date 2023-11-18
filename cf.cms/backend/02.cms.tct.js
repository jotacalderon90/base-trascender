"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const parent = require('./lib/cms');

module.exports = {
	
	//@route('/api/cms/:object/total')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	total: async function(req,res){
		try{
			
			parent.validRequest(req,true);
			const host = req.query.host;
			
			req.query = (req.query.query)?JSON.parse(req.query.query):{};
			req.query.host = host;
			
			const total = await mongodb.count(req.params.object,req.query);
			
			res.send({data: total});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/collection')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	collection: async function(req,res){
		try{
			
			parent.validRequest(req,true);
			const host = req.query.host;
			
			req.options = (req.query.options)?JSON.parse(req.query.options):{};
			req.query = (req.query.query)?JSON.parse(req.query.query):{};
			req.query.host = host;
			
			const data = await mongodb.find(req.params.object,req.query,req.options);
			res.send({data: data});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/cms/:object/tag/collection')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	tag: async function(req,res){
		try{
			parent.validRequest(req,true);
			res.send({data: await mongodb.distinct(req.params.object,"tag",{host: req.query.host})});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
};