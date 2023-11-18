"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const chat = require('./lib/chat');

module.exports = {
	
	//@route('/api/chat/info')
	//@method(['get'])
	//@roles(['root','admin','chat'])
	total: async function(req,res){
		try{
			res.send({data: chat.sockets.map((r)=>{return r._id})});
		}catch(e){
			response.renderError(req,res,e);
		}
	}
	
};