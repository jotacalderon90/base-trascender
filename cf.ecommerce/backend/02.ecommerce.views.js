"use strict";

const fs = require('fs');
const response = require('cl.jotacalderon.cf.framework/lib/response');
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const helper = require('cl.jotacalderon.cf.framework/lib/helper');
const parent = require('./lib/ecommerce');

module.exports = {
	
	//@route('/')
	//@method(['get'])
	renderCollection: async function(req,res){
		try{
			const rows = await mongodb.find(parent.object,parent.getBasicQuery(req),{limit: 6,sort:{created: -1}, projection: parent.projection});
			const tags = await parent.getTags(req);
			
			let view = 'ecommerce/collection/_';
			if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/collection/_.html')){
				view = req.headers.host + '/collection/_';
			}
			
			response.render(req,res,view, {
				rows: rows, 
				tags: tags,
				title: 'Ecommerce de ' + req.headers.host.split('.')[1],
				keywords: parent.object + ',' + tags.join(','),
				description: 'Ecommerce de ' + req.headers.host.split('.')[1], 
				author: '@jotace',
				img: req.protocol + '://' + req.headers.host + '/logo.png',
				www: req.protocol + '://' + req.headers.host.replace('ecommerce','www')
			});
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/categoria/:id')
	//@method(['get'])
	renderCollectionTag: async function(req,res){
		try{
			const rows = await mongodb.find(parent.object,{tag: req.params.id, ...parent.getBasicQuery(req)},{sort:{created: -1}, projection: parent.projection});
			const tags = await parent.getTags(req);
			
			let view = 'ecommerce/collection/_';
			if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/collection/_.html')){
				view = req.headers.host + '/collection/_';
			}
			
			response.render(req,res,view, {
				rows: rows, 
				tags: tags,
				title: req.params.id,
				keywords: parent.object + ',' + tags.join(','),
				description: 'Notas de ' + req.headers.host.split('.')[1] + ' acerca de ' + req.params.id, 
				author: '@jotace',
				img: req.protocol + '://' + req.headers.host + '/logo.png',
				www: req.protocol + '://' + req.headers.host.replace('ecommerce','www')
			});
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/:id.html')
	//@method(['get'])
	renderHtml: async function(req,res){
		try{
			const data = await mongodb.find(parent.object,{uri:req.params.id, ...parent.getBasicQuery(req)});
			if(data.length==0){
				throw("No se encontró el documento solicitado");
			}else{
				response.renderHtml([data[0]],req,res);
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/:id')
	//@method(['get'])
	renderDocument: async function(req,res){
		try{
			const row = await mongodb.find(parent.object,{uri:req.params.id, ...parent.getBasicQuery(req)});
			if(row.length==0){
				throw("No se encontró el documento solicitado");
			}else{
				
				row[0].relation = await mongodb.find(parent.object,{tag: {$in: [row[0].tag_main]}, title: {$ne: row[0].title}, ...parent.getBasicQuery(req)},{skip: 0, limit: 10, sort: {created: -1}, projection: parent.projection});
				row[0].relation = helper.randomArray(row[0].relation).slice(0,2);
					
				let view = 'ecommerce/document/_';
				if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/document/_.html')){
					view = req.headers.host + '/document/_';
				}
				
				response.render(req,res,view, {
					row: row[0], 
					tags: await parent.getTags(req), 
					title: row[0].title,
					keywords: parent.object + ',' + row[0].tag.join(','),
					description: row[0].resume, 
					author: row[0].author.nickname,
					img: req.protocol + '://' + process.env.HOST_CMS + '/assets/img/ecommerce/' + row[0]._id + '.jpg',
					www: req.protocol + '://' + req.headers.host.replace('ecommerce','www')
				});
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/ecommerce/carro-de-solicitud')
	//@method(['get'])
	cart: async function(req,res){
		try{
			let view = 'ecommerce/cart/_';
			if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/cart/_.html')){
				view = req.headers.host + '/cart/_';
			}
			response.render(req,res,view);
		}catch(e){
			response.renderError(req,res,e);
		}
	}
	
};