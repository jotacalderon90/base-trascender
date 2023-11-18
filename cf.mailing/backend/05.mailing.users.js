"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');

module.exports = {
	
	//@route('/api/mailing/users/tag')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	users_tag: async function(req,res){
		try{
			const data = await mongodb.distinct("user","roles");
			res.send({data: data.filter((r)=>{return r!='root'})});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/mailing/users/:id')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	users_by_tag: async function(req,res){
		try{
			const q = {notification: true}
			if((req.params.id!='*')){
				q.roles = {$in: [req.params.id]};	
			}
			const data = await mongodb.find('user',q,{projection: {email: 1,nickname: 1}});
			res.send({data: data});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
};