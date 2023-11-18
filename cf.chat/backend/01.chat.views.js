"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');

module.exports = {
	
	//@route('/')
	//@method(['get'])
	//@roles(['root','admin','chat'])
	renderHome: async function(req,res){
		try{
			response.render(req,res,'chat/index/_', {user: req.user});
		}catch(e){
			response.renderError(req,res,e);
		}
	}
	
};