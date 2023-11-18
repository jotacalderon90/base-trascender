"use strict";

const fs = require('fs');
const path = require('path');
const response = require('cl.jotacalderon.cf.framework/lib/response');

module.exports = {
	
	//@route('/api/background/collection')
	//@method(['get'])
	collection: async function(req,res){
		try{
			const directory = 'media/img/background';
			res.json({data: fs.readdirSync(process.cwd() + '/frontend/' + directory,"utf8").filter((row)=>{
				return fs.statSync(path.join(process.cwd() + '/frontend/' + directory,row)).isFile();
			}).map((r)=>{return process.env.HOST_ARCHIVOSPUBLICOS + '/' + directory + '/' + r})});
		}catch(e){
			response.APIError(req,res,e);
		}
	}
};