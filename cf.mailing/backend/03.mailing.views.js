"use strict";

const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');

module.exports = {
	
	//@route('/')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	renderIndex: function(req,res){
		response.render(req,res,'mailing/list/_', {user: req.user});
	},
	
	//@route('/new')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	renderNew: function(req,res){
		res.render('mailing/form/_', {user: req.user});
	},
	
	//@route('/edit/:id')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	renderEdit: async function(req,res){
		try{
			const row = await mongodb.findOne('mailing', req.params.id);
			if(row==null){
				throw("No se encontró el documento solicitado");
			}else{
				response.render(req,res,'mailing/form/_', {row: row});
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/media/img/pxmagico.png')
	//@method(['get'])
	pxmagico: async function(req,res){
		try{
			if(req.query.data && req.query.data != 'undefined'){
				mongodb.updateOne('mailing',req.query.data,{$set: {view: true}});
			}
		}catch(e){
			console.log(e);
		}
		res.redirect(process.env.HOST_ARCHIVOSPUBLICOS + '/media/img/px.png');
	}
};