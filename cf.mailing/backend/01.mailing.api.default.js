"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const parent = 'mailing';

module.exports = {
	
	//@route('/api/mailing/total')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	total: async function(req,res){
		try{
			req.query = (req.query.query && req.query.query!=':query')?JSON.parse(req.query.query):{};
			const total = await mongodb.count(parent,req.query);
			res.send({data: total});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/mailing/collection')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	collection: async function(req,res){
		try{
			req.options = (req.query.options)?JSON.parse(req.query.options):{};
			req.query = (req.query.query)?JSON.parse(req.query.query):{};
			const data = await mongodb.find(parent,req.query,req.options);
			res.send({data: data});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/mailing/tag/collection')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	tag: async function(req,res){
		try{
			res.send({data: await mongodb.distinct(parent,"tag")});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
};