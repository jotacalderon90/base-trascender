"use strict";

const mongodb	= require('cl.jotacalderon.cf.framework/lib/mongodb');
const response	= require('cl.jotacalderon.cf.framework/lib/response');

module.exports = {
	
	//@route('/api/document/:name/total')
	//@method(['get'])
	//@roles(['root'])
	total: async function(req,res){
		try{
			const query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
			res.send({data: await mongodb.count(req.params.name,query)});
		}catch(e){
			response.APIError(req,res,e);
		}
	}, 
	
	//@route('/api/document/:name/collection')
	//@method(['get'])
	//@roles(['root'])
	collection: async function(req,res){
		try{
			const query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
			const options = (req.method=="GET")?JSON.parse(req.query.options):(req.method=="POST")?req.body.options:{};
			res.send({data: await mongodb.find(req.params.name,query,options)});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/document/:name/tags')
	//@method(['get'])
	//@roles(['root'])
	tags: async function(req,res){
		try{
			res.send({data: await mongodb.distinct(req.params.name,"tag")});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
}