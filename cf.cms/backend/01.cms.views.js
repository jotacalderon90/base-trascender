"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const parent = require('./lib/cms');

module.exports = {
	
	//@route('/')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	renderIndex: function(req,res){
		try{
			res.render('cms/index/_', {title: 'CMS', cms: req.user.cms, user: req.user});
		}catch(e){
			console.log(e);
			response.renderError(req,res,e)
		}
	},
	
	//@route('/www')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	renderWWW: function(req,res){
		try{
			parent.validRequest(req);
			res.render('cms/www/_', {title: 'WWW CMS', cms: req.user.cms, user: req.user});
		}catch(e){
			console.log(e);
			response.renderError(req,res,e)
		}
	},
	
	//@route('/:object')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	renderObjectIndex: function(req,res){
		try{
			parent.validRequest(req,true);
			res.render('cms/' + req.params.object + '/index/_',{
				title: 'admin | ' + req.params.object,
				user: req.user
			});
		}catch(e){
			response.renderError(req,res,e)
		}
	},
	
	//@route('/:object/form')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	renderObjectForm: function(req,res){
		try{
			parent.validRequest(req,true);
			res.render('cms/' + req.params.object + '/form/_',{
				title: 'form | ' + req.params.object,
				user: req.user
			});
		}catch(e){
			console.log(e);
			response.renderError(req,res,e)
		}
	},
	
	//@route('/:object/:id')
	//@method(['get'])
	//@roles(['root','admin','cms'])
	renderObjectEdit: async function(req,res){
		try{
			parent.validRequest(req,true);
			const row = await mongodb.findOne(req.params.object,req.params.id);
			if(!row){
				throw('invalid row');
			}
			if(req.user.cms.filter((r)=>{return r.host === row.host}).length === 0){
				throw('invalid row');
			}
			res.render('cms/' + req.params.object + '/form/_',{
				title: 'form | ' + req.params.object,
				row: row,
				user: req.user
			});
		}catch(e){
			console.log(e);
			response.renderError(req,res,e)
		}
	}
}